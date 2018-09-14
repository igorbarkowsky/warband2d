"use strict";

import {Event} from "./../Game.js";

import * as THREE from "three";
import * as TWEEN from "es6-tween";

export class ThreeEngine {
	constructor () {
		// scene objects
		this.objects = new Map();
		this.tweens = new Set();
		// scene, camera and renderer
		this.tools = {};
		// apply handlers on future events
		this.setupEventsHandlers();
	}

	setupScene () {
		console.log('ThreeEngine.setupScene');

		// simple scene
		let scene = new THREE.Scene();
		//TODO: maybe choose another camera type?
		let camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );

		// setup and apply renderer to document
		let renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		// camera view position
		camera.position.z = 50;
		camera.position.x = 10;
		camera.position.y = 10;

		// freeze tools for speedup
		this.tools = Object.freeze({ scene, camera, renderer});

		// Test object and center of the scene
		this.addObject({color:'white'}, {x:0, y: 0});

		// Start clock sync
		this.clock = new THREE.Clock(true);
		// start animation loop
		this.animate();
	}

	// recursive function
	animate() {
		requestAnimationFrame( this.animate.bind(this) );// bind help us: "this" everytime is ThreeEngine object
		this.render();
	}

	render () {
		let { scene, camera, renderer } = this.tools;
		this.delta = this.clock.getDelta();
		//TEST: rotation is only for testing
		this.objectsRotation();
		this.objectsTweens();
		// this.objectsMoveTo();

		renderer.render( scene, camera );
	}

	//TEST: this is test function - it rotate all objects a little each frame
	objectsRotation () {
		// let timer = this.timer;
		this.objects.forEach( (object, gameObject, map) => {
				object.rotation.x += this.delta;
				object.rotation.y += this.delta;
		});
	}

	objectsTweens () {
		// TWEEN.update();
		this.tweens.forEach( (tween) => {
			tween.update();
			
		});
	}

	addObject (gameObject, position) {
		console.log('ThreeEngine.addObject', gameObject, position);
		let { scene } = this.tools;

		let geometry = new THREE.BoxGeometry( 1, 1, 1 );
		let material = new THREE.MeshBasicMaterial( { color: gameObject.color } );
		// its a simple cube
		let object = new THREE.Mesh( geometry, material );
		object
			.translateX(position.x)
			.translateY(position.y);
		scene
			.add(object)

		this.objects.set(gameObject, object);
	}

	moveObjectTo (gameObject, targetPosition) {
		console.log('ThreeEngine.moveObjectTo', gameObject, targetPosition);
		let object = this.objects.get(gameObject);
		let currentPosition = object.position;
		console.log(currentPosition);
		let tween = new TWEEN.Tween(currentPosition)
			.to(targetPosition, 2000)
			.start();

		this.tweens.add(tween);
	}

	setupEventsHandlers () {
		// console.log('Engine handlers definition');
		let obj = this;
		Event.on('GameScene.Init', function(gameScene){
			console.log('ThreeEngine.on.GameScene.Init', gameScene)
			obj.setupScene();
		});
		Event.on('GameScene.addObject', function(gameScene, gameObject, position){
			console.log('ThreeEngine.on.GameScene.addObject', gameScene, gameObject, position)
			obj.addObject(gameObject, position);
		});
		Event.on('GameScene.moveObjectTo', function(gameObject, targetPosition){
			console.log('ThreeEngine.on.GameScene.moveObjectTo', gameObject, targetPosition)
			obj.moveObjectTo(gameObject, targetPosition);
		});
	}
}
