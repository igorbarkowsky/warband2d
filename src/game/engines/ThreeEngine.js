"use strict";

import {Event} from "./../Game.js";
import {KeyboardState} from "./../KeyboardState.js";
import img from "./../img/Tile_Floor_texture.png";
import Canvas2Image from "./../tools/canvas2image.js";

import * as THREE from "three";
import GLTFLoader from "three-gltf-loader";

export class ThreeEngine {
	constructor() {
		// scene objects
		this.objects = new Map();
		this.RESOURCES_LOADED = false;
		this.loadingManager = null;
		this.loadingScreen = null;
		// scene, camera and renderer
		this.tools = {};
		// Controls settings
		this.speedMod = 0;

		// Player tools
		this.playerGameObject = null;
		this.playerAnimixer = null;

		// Helpers
		this.helpersActive = true;
		this.helpers = new Set();

		this.pointerLockRequested = false;
		this.initLoadingScreen();
		this.initTools();
		// apply handlers on future events
		this.setupEventsHandlers();
	}

	initLoadingScreen () {
		let loadingScreen, loadingManager;

		loadingScreen = {
			scene: new THREE.Scene(),
			camera: new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100),
			box: new THREE.Mesh(
				new THREE.BoxGeometry(0.5,0.5,0.5),
				new THREE.MeshBasicMaterial({ color:0x4444ff })
			)
		};
		loadingScreen.box.position.set(0,0,5);
		loadingScreen.camera.lookAt(loadingScreen.box.position);
		loadingScreen.scene.add(loadingScreen.box);
		this.loadingScreen = loadingScreen;

		loadingManager = new THREE.LoadingManager();
		//loadingManager.onStart = ( url, itemsLoaded, itemsTotal ) =>
		// 	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
		//loadingManager.onProgress = (item, loaded, total) =>
		// 	console.log('Loading file', item, '\nLoaded', loaded, 'of', total);
		loadingManager.onError = item =>
			console.log( 'There was an error loading item', item);
		loadingManager.onLoad = () => {
			console.log("loaded all resources");
			this.RESOURCES_LOADED = true;
		};

		this.loadingManager = loadingManager;
	}

	initTools () {
		let renderer, scene, camera, kbd;
		kbd = new KeyboardState();
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera();
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance',
			preserveDrawingBuffer: true,// for screenshots by pressing R
		});
		this.tools = Object.freeze({renderer, scene, camera, kbd});
	}

	showLoadingScreen () {
		if( this.RESOURCES_LOADED == true )
			return false;

		let {renderer} = this.tools;
		let {loadingScreen} = this;


		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

		renderer.render(loadingScreen.scene, loadingScreen.camera);
		requestAnimationFrame(this.animate.bind(this));
		return true; // Stop the function here.
	}

	setupScene(gameScene) {
		console.log('ThreeEngine.setupScene', gameScene);
		let {renderer, scene, camera, kbd} = this.tools;

		// simple scene
		scene.background = new THREE.Color(0x333333);
		//scene.fog = new THREE.Fog(0x000000, 250, 1400);

		let dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
		dirLight.position.set(0, 0, 1).normalize();
		scene.add(dirLight);
		//
		let pointLight = new THREE.PointLight(0xffffff, 1.5);
		pointLight.position.set(0, 100, 90);
		scene.add(pointLight);

		camera.fov = 45;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.near = 1;
		camera.far = 10000;
		camera.updateProjectionMatrix();

		// setup and apply renderer to document
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild( renderer.domElement );
		renderer.domElement.addEventListener('click', () => this.requestPointerLock() );

		if( this.helpersActive ) {
			let Axes = new THREE.AxesHelper(20);
			Axes.name = 'Helper';
			this.helpers.add(Axes);
			scene.add(Axes);
		}

		// camera view position
		// camera.position.set(-10, 50, -10);
		// camera.lookAt(0, 0, 0);

		let floor = this.loadFloor(gameScene);
		scene.add(floor);

		// Start clock sync
		this.clock = new THREE.Clock(true);
		// start animation loop
		this.animate();
	}


	// recursive function
	animate() {
		// Пока не завершена загрузка данных - показываем загрузчик
		if( this.showLoadingScreen() )
			return;

		requestAnimationFrame(this.animate.bind(this));// bind help us: "this" everytime is ThreeEngine object
		this.render();
	}

	render() {
		let {scene, camera, renderer, kbd} = this.tools;
		kbd.update();
		this.delta = this.clock.getDelta();

		this.animatePlayer();
		this.movePlayer();

		if( this.playerAnimixer !== null )
			this.playerAnimixer.update(this.delta);

		renderer.render(scene, camera);
	}

	getObject (gameObject) {
		return this.objects.get(gameObject);
	}

	addObject(gameObject, position, staticObjectFlag = false) {
		console.log('ThreeEngine.addObject', gameObject, position, staticObjectFlag);
		let {scene, camera} = this.tools;

		if (gameObject.isPlayer && gameObject.isPlayer === true)
			return this.loadPlayerModel(gameObject, position);
		else
			return this.loadEnemyModel(gameObject, position);
	}

	loadFloor (gameScene) {
		const textureLoader = new THREE.TextureLoader(this.loadingManager);

		let texture = textureLoader.load(img, texture => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set( 0, 0 );
			texture.repeat.set( 10, 10 );
		});
		let floor = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(gameScene.width, gameScene.depth),
			new THREE.MeshBasicMaterial({map:texture, color: 0xffffff, opacity: 0.5, transparent: true})
		);
		floor.position.y = -0.5;
		floor.rotation.x = -Math.PI / 2;

		return floor;
	}

	loadEnemyModel (gameObject, position) {
		const model = './src/game/models/spider/spider.glb';
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(model,
			importedObject => this.addEnemyModel2Scene(importedObject, gameObject, position),
			xhr => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
			error => console.log( 'An error happened while loading', error )
		);

		return true;
	}

	addEnemyModel2Scene (importedObject, gameObject, position) {
		let {scene} = this.tools;

		console.log(importedObject);
		let object = new THREE.Group();

		let objectScale = 100;
		importedObject.scene.scale.divideScalar(objectScale);

		object.add(importedObject.scene);
		object
			.translateX(position.x)
			.translateY(position.y-0.5)
			.translateZ(position.z);

		let box = new THREE.Box3().setFromObject( importedObject.scene );
		console.log('box of enemy model', box);
		let helper = new THREE.Box3Helper(box, 0xffff00);
		helper.name = 'Helper';
		if( !this.helpersActive )
			helper.visible = false;
		object.add(helper);
		this.helpers.add(helper);

		scene.add(object);

		object.name = gameObject.title;

		this.objects.set(gameObject, {object: object, model: importedObject});

		return true;
	}

	loadPlayerModel (gameObject, position) {
		// const model = './src/game/models/t-rex/T-Rex.glb';
		// const loader = new GLTFLoader(this.loadingManager);
		const model = './src/game/models/marine/marine_anims_core.json';
		const loader = new THREE.ObjectLoader(this.loadingManager);
		loader.load(model,
			importedObject => {
				let mesh = null;
				importedObject.traverse( function ( child ) {
					if ( child instanceof THREE.SkinnedMesh ) {
						mesh = child;
					}
				} );
				if( mesh )
					this.addPlayerModel2Scene(mesh, gameObject, position)
			},
			xhr => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
			error => console.log( 'An error happened while loading', error )
		);

		return true;
	}

	addPlayerModel2Scene (importedObject, gameObject, position) {
		console.log(importedObject);
		let {scene, camera} = this.tools;
		this.playerGameObject = gameObject;

		// Attach camera to player
		let object = new THREE.Group();
		object.add(camera);
		camera.name = 'PlayerCamera';
		// set camera behind player
		camera.position.set(0, 3, 3);
		// camera look to object position but higher (like somebody looks from behind players head)
		camera.lookAt(object.position.clone().add(new THREE.Vector3(0, 2, 0)));
		// default model is too big, so we must scale it down
		let optimalScaleFoThisModel = 100;
		importedObject.scale.divideScalar(optimalScaleFoThisModel);
		let box = new THREE.Box3().setFromObject( importedObject );
		let helper = new THREE.Box3Helper(box, 0xffff00);
		helper.name = 'Helper';
		if( !this.helpersActive )
			helper.visible = false;
		object.add(helper);
		this.helpers.add(helper);

		object.add(importedObject);

		this.playerAnimixer = new THREE.AnimationMixer( importedObject );

		object
			.translateX(position.x)
			.translateY(position.y-0.5)
			.translateZ(position.z);

		object.name = gameObject.title;

		scene.add(object);

		this.objects.set(gameObject, {object: object, model: importedObject});

		this.playerAnimations = {
			idle: this.playerAnimixer.clipAction( 'idle' ),
			move: this.playerAnimixer.clipAction( 'run' ),
		};

		this.playerAnimations.idle.play();

		return true;
	}

	animatePlayer () {
		let {kbd} = this.tools;

		//TODO: Разная анимация на разные направления (ходьба и бег вперед, пятиться, стрейф вправо и влево)
		//TODO: Переключать анимацию через миксер с помощью weight
		let movingStarted = (kbd.down("W") || kbd.down("A") || kbd.down("S") || kbd.down("D"));
		let movingContinued = (kbd.pressed("W") || kbd.pressed("A") || kbd.pressed("S") || kbd.pressed("D"));
		let movingReleased = (kbd.up("W") || kbd.up("A") || kbd.up("S") || kbd.up("D"));
		if( movingStarted ) {
			console.log('movingPressed');
			this.playerAnimations.move.play();
		}
		// full stop
		if( movingReleased && !movingContinued ) {
			console.log('movingReleased');
			this.playerAnimations.move.stop();
			this.playerAnimations.idle.play();
		}

		return true;
	}

	movePlayer() {
		let speedTreshold = 40;
		if (this.speedMod < speedTreshold) {
			this.speedMod++;
		}

		let {kbd} = this.tools;
		let movingPressed = (kbd.pressed("W") || kbd.pressed("A") || kbd.pressed("S") || kbd.pressed("D"));
		if (!movingPressed) {
			this.speedMod = 0;
			return false;
		}

		let playerObject = this.getObject(this.playerGameObject).object;

		// calculate distance for single player move
		//TODO: It related to outfit weight, agility and other player stats
		let globalSpeedMod = 2;
		let iniSpeed = 1;
		let maxSpeed = 5;
		let curSpeed = iniSpeed + this.speedMod*0.1;
		if( curSpeed > maxSpeed )
			curSpeed = maxSpeed;

		// calculate move vector
		let x = 0, y = 0, z = 0;
		let distance = curSpeed*this.delta*globalSpeedMod;
		if (kbd.pressed("W")) z = -1;
		if (kbd.pressed("D")) x = 1;
		if (kbd.pressed("S")) z = 1;
		if (kbd.pressed("A")) x = -1;

		let destLocalVector = new THREE.Vector3(x, y, z);
		playerObject.translateOnAxis(destLocalVector, distance);

		return true;
	}

	rotatePlayer(event) {
		let playerObject = this.getObject(this.playerGameObject).object;
		playerObject.rotateY(-event.movementX*0.0005);
		playerObject.getObjectByName('PlayerCamera').rotateX(-event.movementY*0.0005)
	}

	setupEventsHandlers() {
		console.log('Engine handlers definition');

		// Game events
		Event.on( 'GameScene.Init', gameScene => this.setupScene(gameScene) );
		Event.on( 'GameScene.addObject', (gameObject, position) => this.addObject(gameObject, position) );

		// Browser events
		window.addEventListener('resize', () => this.resizeGame() );
		document.addEventListener('pointerlockchange', () => this.lockChangeAlert(), false);

		// Dirty hacks for removeEventListener
		this.rotateByMouseHandler = this.rotatePlayer.bind(this);

		// Screenshot
		document.addEventListener("keydown", event => this.takeScreenshot(event), true);
		// Helpers
		document.addEventListener("keydown", event => this.toggleHelpers(event), true);
	}

	/////////////////////////////////////////////////////////////////////////////
	// STUFF                                                                   //
	/////////////////////////////////////////////////////////////////////////////

	resizeGame () {
		let {renderer, camera} = this.tools;

		let aspectRatio = window.innerWidth / window.innerHeight;

		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
	}

	requestPointerLock () {
		if( this.pointerLockRequested )
			return true;

		let {renderer} = this.tools;
		renderer.domElement.requestPointerLock()
	}

	lockChangeAlert () {
		let {renderer} = this.tools;

		if( document.pointerLockElement === renderer.domElement ) {
			renderer.domElement.addEventListener("mousemove", this.rotateByMouseHandler, true);
			console.log('Pointer has locked by game');
			this.pointerLockRequested = true;
		}
		else {
			renderer.domElement.removeEventListener("mousemove", this.rotateByMouseHandler, true);
			console.log('Pointer released');
			this.pointerLockRequested = false;
		}
	}

	// press R to make screenshot
	takeScreenshot (event) {
		if( event.code != 'KeyR' )
			return true;

		let {renderer} = this.tools;
		let screenshoter = new Canvas2Image();
		screenshoter.saveAsPNG(renderer.domElement);
	}
	// press H to toggle helpers
	toggleHelpers (event) {
		if( event.code != 'KeyH' )
			return true;

		this.helpersActive = !this.helpersActive;
		this.helpers.forEach( object3D => object3D.visible = this.helpersActive );
	}
}
