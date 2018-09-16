"use strict";

import {Event} from "./../Game.js";
import {KeyboardState} from "./../KeyboardState.js";

import * as THREE from "three";
import * as TWEEN from "es6-tween";

export class ThreeEngine {
	constructor() {
		// scene objects
		this.objects = new Map();
		this.playerGameObject = null;
		this.tweens = new Map();
		// scene, camera and renderer
		this.tools = {};
		this.speedMod = 0;

		// apply handlers on future events
		this.setupEventsHandlers();
	}

	setupScene(gameScene) {
		console.log('ThreeEngine.setupScene', gameScene);

		let kbd = new KeyboardState();

		// simple scene
		let scene = new THREE.Scene();
		scene.background = new THREE.Color(0x333333);
		scene.fog = new THREE.Fog(0x000000, 250, 1400);

		let dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
		dirLight.position.set(0, 0, 1).normalize();
		scene.add(dirLight);

		let pointLight = new THREE.PointLight(0xffffff, 1.5);
		pointLight.position.set(0, 100, 90);
		scene.add(pointLight);

		let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

		// setup and apply renderer to document
		let renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild( renderer.domElement );

		// freeze tools for speedup
		this.tools = Object.freeze({scene, camera, renderer, kbd});

		renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock() );


		let Axes = new THREE.AxesHelper(20);
		scene.add(Axes);

		// camera view position
		// camera.position.set(-10, 50, -10);
		// camera.lookAt(0, 0, 0);

		let floor = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(gameScene.width, gameScene.depth),
			new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.5, transparent: true})
		);
		floor.position.y = -0.5;
		floor.rotation.x = -Math.PI / 2;
		scene.add(floor);



		// Test object and center of the scene
		this.addObject({color: 'white'}, {x: 0, y: 0, z: 0}, true);

		// Start clock sync
		this.clock = new THREE.Clock(true);
		// start animation loop
		this.animate();
	}

	// recursive function
	animate() {
		this.render();
		requestAnimationFrame(this.animate.bind(this));// bind help us: "this" everytime is ThreeEngine object
	}

	render() {
		let {scene, camera, renderer, kbd} = this.tools;
		kbd.update();
		this.delta = this.clock.getDelta();

		this.movePlayer();

		renderer.render(scene, camera);
	}

	addObject(gameObject, position, staticObjectFlag = false) {
		console.log('ThreeEngine.addObject', gameObject, position, staticObjectFlag);
		let {scene, camera} = this.tools;


		let geometry = new THREE.BoxGeometry(1, 1, 1);
		let material = new THREE.MeshBasicMaterial({color: gameObject.color});
		let object = new THREE.Mesh(geometry, material);

		if (gameObject.isPlayer && gameObject.isPlayer === true) {
			this.playerGameObject = gameObject;
			// Attach camera to player
			object.add(camera);
			camera.position.z = -10;
			camera.position.y = 5;
			camera.lookAt(object.position.clone().add(new THREE.Vector3(0, 3, 0)));
		}

		if (staticObjectFlag === true) {
			object.matrixAutoUpdate = false;
		}
		else {
			object
				.translateX(position.x)
				.translateY(position.y)
				.translateZ(position.z);
		}
		scene
			.add(object);

		this.objects.set(gameObject, object);
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

		let playerObject = this.objects.get(this.playerGameObject);

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
		if (kbd.pressed("W")) z = 1;
		if (kbd.pressed("A")) x = 1;
		if (kbd.pressed("S")) z = -1;
		if (kbd.pressed("D")) x = -1;

		let destLocalVector = new THREE.Vector3(x, y, z);
		playerObject.translateOnAxis(destLocalVector, distance);
	}

	rotatePlayer(event) {
		let playerObject = this.objects.get(this.playerGameObject);
		console.log(event.movementX);
		playerObject.rotateY(-event.movementX*0.0002);
	}

	setupEventsHandlers() {
		console.log('Engine handlers definition');

		Event.on( 'GameScene.Init', gameScene => this.setupScene(gameScene) );
		Event.on( 'GameScene.addObject', (gameObject, position) => this.addObject(gameObject, position) );

		window.addEventListener('resize', () => this.resizeGame() );
		document.addEventListener('pointerlockchange', () => this.lockChangeAlert(), false);

		// Dirty hack for removeEventListener
		this.rotateByMouseHandler = this.rotatePlayer.bind(this);
	}

	resizeGame () {
		let {renderer, camera} = this.tools;

		let aspectRatio = window.innerWidth / window.innerHeight;

		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
	}

	lockChangeAlert() {
		let {renderer} = this.tools;

		if( document.pointerLockElement === renderer.domElement ) {
			console.log('The pointer lock status is now locked');
			renderer.domElement.addEventListener("mousemove", this.rotateByMouseHandler, true);
		} else {
			console.log('The pointer lock status is now unlocked');
			renderer.domElement.removeEventListener("mousemove", this.rotateByMouseHandler, true);
		}
	}
}
