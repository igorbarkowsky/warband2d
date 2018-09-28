"use strict";

import {Event} from "./../Game.js";
import Input from "./../Input.js";
import img from "./../img/Tile_Floor_texture.png";
import Canvas2Image from "./../tools/canvas2image.js";

import * as THREE from "three";
import * as CANNON from "cannon";
import TextSprite from 'three.textsprite';
import Chance from 'chance';

import Troop from './Troop.js';
import Player from './Player.js';

import * as Utils from './../Utils.js';


export class ThreeEngine {
	constructor() {
		// scene objects
		this.objects = new Map();
		this.physics = {};
		// scene, camera and renderer
		this.tools = {};
		this.hud = {};

		// Player tools
		this.playerGameObject = null;

		// Helpers
		this.helpersActive = true;
		this.helpers = new Map();
		this.chance = new Chance();

		this.pointerLockRequested = false;
		this.initLoading();
		this.initTools();
		// apply handlers on future events
		this.setupEventsHandlers();
	}

	initLoading () {
		this.loading = {};

		let RESOURCES_LOADED = false, screen, manager;

		screen = {
			scene: new THREE.Scene(),
			camera: new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100),
			box: new THREE.Mesh(
				new THREE.BoxGeometry(0.5,0.5,0.5),
				new THREE.MeshBasicMaterial({ color:0x4444ff })
			)
		};
		screen.box.position.set(0,0,5);
		screen.camera.lookAt(screen.box.position);
		screen.scene.add(screen.box);

		manager = new THREE.LoadingManager();
		//loadingManager.onStart = ( url, itemsLoaded, itemsTotal ) =>
		// 	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
		//loadingManager.onProgress = (item, loaded, total) =>
		// 	console.log('Loading file', item, '\nLoaded', loaded, 'of', total);
		manager.onError = item =>
			console.log( 'There was an error loading item', item);
		manager.onLoad = () => {
			console.log("loaded all resources");
			this.loading.RESOURCES_LOADED = true;
		};

		this.loading = {RESOURCES_LOADED, screen, manager};
	}

	initHUD () {
		// We will use 2D canvas element to render our HUD.
		let canvas = document.createElement('canvas');

		// Again, set dimensions to fit the screen.
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Get 2D context and draw something supercool.
		var context = canvas.getContext('2d');
		context.font = "Normal 20px Arial";
		context.textAlign = 'center';
		context.fillStyle = "white";
		let helpText = 'Click to start game. Press H for toggle outlines.';
		let lineHeight = 25;
		this.wrapText(context, helpText, canvas.width / 2, lineHeight, canvas.width / 2, lineHeight);

		// Create the camera and set the viewport to match the screen dimensions.
		let camera = new THREE.OrthographicCamera(
			-canvas.width/2, canvas.width/2,
			canvas.height/2, -canvas.height/2,
			0, 30
		);

		// Create also a custom scene for HUD.
		let scene = new THREE.Scene();

		// Create texture from rendered graphics.
		let texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		// Create HUD material.
		let material = new THREE.MeshBasicMaterial( {map: texture} );
		material.transparent = true;

		// Create plane to render the HUD. This plane fill the whole screen.
		let planeGeometry = new THREE.PlaneGeometry( canvas.width, canvas.height );
		let plane = new THREE.Mesh( planeGeometry, material );
		scene.add( plane );

		this.hud = Object.freeze({scene, camera, objects: {context, texture}});
		console.log('HUD inited', this.hud);
	}

	updateHUD () {
		// Update HUD graphics.
		// let {context: ctx, texture} = this.hud.objects;
		// ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		// ctx.fillText(Date.now() , window.innerWidth / 2, 100);
		// texture.needsUpdate = true;
	}

	initTools () {
		let renderer, scene, camera, kbd;
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1/128, 1000);
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance',
			//preserveDrawingBuffer: true,// for screenshots by pressing R
		});
		renderer.autoClear = false;
		//renderer.setClearColor(0x000000, 1);
		this.tools = Object.freeze({renderer, scene, camera});
	}

	showLoadingScreen () {
		if( this.loading.RESOURCES_LOADED === true )
			return false;

		let {renderer} = this.tools;
		let {screen} = this.loading;


		screen.box.position.x -= 0.05;
		if( screen.box.position.x < -10 ) screen.box.position.x = 10;
		screen.box.position.y = Math.sin(screen.box.position.x);

		renderer.render(screen.scene, screen.camera);
		requestAnimationFrame(this.animate.bind(this));
		return true; // Stop the function here.
	}

	setupScene(gameScene) {
		console.log('ThreeEngine.setupScene', gameScene);
		let {renderer, scene, camera} = this.tools;

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
		Event.trigger('ThreeEngine.requestPointerLock', this);
		renderer.domElement.addEventListener('click', () => this.requestPointerLock() );

		if( this.helpersActive ) {
			let Axes = new THREE.AxesHelper(20);
			// noinspection JSUndefinedPropertyAssignment
			Axes.name = 'AxesHelper';
			this.helpers.set(Axes, Axes);
			scene.add(Axes);
		}

		this.addCoordHelper(new THREE.Vector3(0,0,0));
		for( let i = 3, max = 30; i < max; i += 3)
			this.addCoordHelper(new THREE.Vector3(i,0,0));
		for( let i = 3, max = 30; i < max; i += 3)
			this.addCoordHelper(new THREE.Vector3(0,0,i));

		this.addText('Text');

		// camera view position
		// camera.position.set(-10, 50, -10);
		// camera.lookAt(0, 0, 0);

		let floor = this.loadFloor(gameScene);
		scene.add(floor);
		this.initHUD();

		this.initPhysics();
		// Start clock sync
		this.clock = new THREE.Clock(true);
		// start animation loop
		this.animate();
	}


	// ANIMATION LOOP - recursive function
	animate() {
		// Пока не завершена загрузка данных - показываем загрузчик
		if( this.showLoadingScreen() )
			return;

		requestAnimationFrame(this.animate.bind(this));// bind help us: "this" everytime is ThreeEngine object
		this.render();
	}

	// Maybe main function of this engine - render on each frame
	render() {
		let {scene, camera, renderer} = this.tools;
		this.delta = this.clock.getDelta();

		this.updatePhysics();
		this.updateObjects();
		//this.updateHelpers();
		this.updateHUD();

		renderer.render(scene, camera);
		renderer.render(this.hud.scene, this.hud.camera);
	}

	initPhysics () {
		let world = new CANNON.World();
		world.gravity.set(0,-10,0);
		world.broadphase = new CANNON.NaiveBroadphase();
		world.solver.iterations = 10;
		//world.solver.tolerance = 0.001;
		world.defaultContactMaterial.friction = 0.1;
		world.defaultContactMaterial.contactEquationStiffness = 1e8;
		world.defaultContactMaterial.contactEquationRegularizationTime = 3;

		// Ground plane
		let plane = new CANNON.Plane();
		let groundBody = new CANNON.Body({ mass: 0 });
		groundBody.addShape(plane);
		groundBody.position.set(0,-0.5,0);
		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
		world.addBody(groundBody);

		this.physics.world = world;
	}

	updatePhysics () {
		if( this.delta > 0 ) {
			this.physics.world.step(this.delta);
			this.objects.forEach( (engineObject) => {
				if( engineObject.body.inited !== true )
					return;

				engineObject.object.position.copy(engineObject.body.position);
				engineObject.object.quaternion.copy(engineObject.body.quaternion);
			});
		}
	}

	updateObjects () {
		this.objects.forEach( (engineObject) => {
			engineObject.update();
		});
	}

	updateHelpers () {
		this.helpers.forEach( (helper) => {
			if( helper.name === 'Helper' ) helper.updateMatrixWorld();
		});
	}

	getObject (gameObject) {
		return this.objects.get(gameObject);
	}

	addObject(gameObject, position, staticObjectFlag = false) {
		console.log('ThreeEngine.addObject', gameObject, position, staticObjectFlag);

		if (gameObject.isPlayer && gameObject.isPlayer === true) {
			this.playerGameObject = gameObject;
			const modelFile = './src/game/models/marine/marine_anims_core.json';
			let player = new Player(this);
			player.loadModel(modelFile, gameObject, position);
		}
		else {
			const modelFile = './src/game/models/spider/spider.glb';
			let troop = new Troop(this);
			troop.loadModel(modelFile, gameObject, position);
		}

		return true;
	}

	loadFloor (gameScene) {
		const textureLoader = new THREE.TextureLoader(this.loading.manager);

		let texture = textureLoader.load(img, texture => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set( 0, 0 );
			texture.repeat.set( 10, 10 );
		});
		let floor = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(gameScene.width, gameScene.depth),
			new THREE.MeshBasicMaterial({map:texture, color: 0xffffff, opacity: 0.5, transparent: false})
		);
		floor.rotation.x = -Math.PI / 2;

		return floor;
	}

	addText (sometext) {
		let {scene} = this.tools;
		let sprite = new TextSprite({
			textSize: 0.05,
			redrawInterval: 1,
			texture: {
				text: sometext,
				fontFamily: 'sans-serif',
			},
			material: {color: 'red'},
		});

		scene.add( sprite );
		sprite.position.set(0,1,-3);
	}

	addCoordHelper (position) {
		let {scene} = this.tools;
		let sphere = new THREE.SphereGeometry(0.1);
		let object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0xff0000 ) );
		let helper = new THREE.BoxHelper( object, 0xffff00 );

		helper.name = 'Helper';
		scene.add( object );
		object.add( helper );
		object.position.set(position.x, position.y+object.geometry.parameters.radius, position.z);

		if( !this.helpersActive )
		{ // noinspection JSUndefinedPropertyAssignment
			helper.visible = false;
		}
		this.helpers.set(object, helper);
	}

	addBoxHelper (object, color) {
		let box = new THREE.Box3().setFromObject( object );
		// Now we know sizes of unit group object
		let size = box.getSize(new THREE.Vector3());
		// Local center of unit object - we must correct Y positioin bcoz object is translated by Y on half of his size
		let objectCenter = new THREE.Vector3(0, size.y/2, 0);
		// Translate Bbox to center and scale fir to unit object
		box.setFromCenterAndSize(objectCenter, size);
		// Create a helper
		let helper = new THREE.Box3Helper(box, color);
		// noinspection JSUndefinedPropertyAssignment
		helper.name = 'Helper';
		// Bind helper to object, not to scene - now helper can repeat all object moves and rotates
		object.add(helper);

		if( !this.helpersActive )
		{ // noinspection JSUndefinedPropertyAssignment
			helper.visible = false;
		}
		this.helpers.set(object, helper);
	}

	addBoundingBoxHelper (unit) {
		return this.addBoxHelper(unit.object, unit.gameObject.color);
	}

	addObject2Scene (unit) {
		console.log('ThreeEngine.addObject2Scene', unit);
		let {scene} = this.tools;

		this.addBoundingBoxHelper(unit);
		unit.object.name = unit.gameObject.title;
		scene.add(unit.object);
		unit.initPhysics(unit.gameObject);
		this.objects.set(unit.gameObject, unit);


		return true;
	}

	setupEventsHandlers() {
		console.log('Engine handlers definition');

		// Game events
		Event.on( 'GameScene.Init', gameScene => this.setupScene(gameScene) );
		Event.on( 'GameScene.addObject', (gameObject, position) => this.addObject(gameObject, position) );
		Event.on('ThreeEngineUnit.SuccessInit', unit => this.addObject2Scene(unit) );

		// Browser events
		window.addEventListener('resize', () => this.resizeGame() );
		document.addEventListener('pointerlockchange', () => this.togglePointerLock(), false);

		// Dirty hacks for removeEventListener
		// this.rotateByMouseHandler = Input.onMouseMove;
		// this.eventKeyDownHandler = Input.onKeyDown;
		this.takeScreenshotHandler = this.takeScreenshot.bind(this);
		this.toggleHelpersHandler = this.toggleHelpers.bind(this);
	}

	/////////////////////////////////////////////////////////////////////////////
	// STUFF                                                                   //
	/////////////////////////////////////////////////////////////////////////////

	resizeGame () {
		let {renderer, camera} = this.tools;
		let {camera: hudCamera} = this.hud;

		let aspectRatio = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
		hudCamera.aspect = aspectRatio;
		hudCamera.updateProjectionMatrix();
	}

	requestPointerLock () {
		if( this.pointerLockRequested )
			return true;

		let {renderer} = this.tools;
		renderer.domElement.requestPointerLock()
	}

	togglePointerLock () {
		let {renderer} = this.tools;

		if( document.pointerLockElement === renderer.domElement ) {
			console.log('Pointer has locked by game');
			// Enable interacting with Game world
			Input.enable(renderer);
			// document.addEventListener("keydown",  this.takeScreenshotHandler, true);
			document.addEventListener("keydown",  this.toggleHelpersHandler, true);

			// this.Keyboard('w, a, s, d', 'gameScene', this.animatePlayerHandler);
			// this.Keyboard('w, a, s, d', 'gameScene', this.movePlayerHandler);

			this.pointerLockRequested = true;
		}
		else {
			console.log('Pointer released');
			// Disable interacting with Game world
			Input.disable(renderer);
			// document.removeEventListener("keydown",  this.takeScreenshotHandler, true);
			document.removeEventListener("keydown",  this.toggleHelpersHandler, true);

			// this.Keyboard.deleteScope('gameScene');
			this.pointerLockRequested = false;
		}
	}

	// press R to make screenshot
	takeScreenshot (event) {
		if( event.code !== 'KeyR' )
			return true;

		let {renderer} = this.tools;
		let screenshoter = new Canvas2Image();
		screenshoter.saveAsPNG(renderer.domElement);
	}
	// press H to toggle helpers
	toggleHelpers (event) {
		if( event.code !== 'KeyH' )
			return true;

		this.helpersActive = !this.helpersActive;
		this.helpers.forEach( object3D => object3D.visible = this.helpersActive );
	}

	wrapText (context, text, x, y, maxWidth, lineHeight) {
		let words = text.split(' ');
		let line = '';

		for( let n = 0; n < words.length; n++ ) {
			let testLine = line + words[n] + ' ';
			let metrics = context.measureText(testLine);
			let testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			}
			else {
				line = testLine;
			}
		}
		context.fillText(line, x, y);
	}
}
