import {Event} from "./../Game.js";
import * as THREE from "three";
import Troop from './Troop.js';
import InputDesktop from './../InputDesktop.js';

export default class Player extends Troop {
	constructor (engine) {
		super(engine);
		this.speedModifier = 0;
		this.speedThreshold = 5;
		this.globalSpeedModifier = 2;
		this.rotateMod = 0.0005;
		this.moves = {};

		this.initEventHandlers();
	}

	bindCamera (camera) {
		// Attach camera to player
		this.object.add(camera);
		camera.name = 'PlayerCamera';
		// set camera behind player
		camera.position.set(0, 3, 3);
		// camera look to object position but higher (like somebody looks from behind players head)
		camera.lookAt(this.object.position.clone().add(new THREE.Vector3(0, 2, 0)));

		return this;
	}

	initEventHandlers () {
		Event.on("InputDesktop.MouseMove", event => this.rotatePlayer(event));
		Event.on("InputDesktop.KeyDown", event => this.onMoveStart(event));
		Event.on("InputDesktop.KeyUp", event => this.onMoveEnd(event));
		Event.on("ThreeEngineUnit.onInitAnimationSuccess", () => this.startIdleAnimation());
	}

	startIdleAnimation () {
		this.ani.actions.idle.play();
	}

	onMoveStart (event) {
		let key = InputDesktop.keyName(event.keyCode);
		if( !InputDesktop.isMoveKey(key) )
			return false;

		const direction = InputDesktop.moveKeys[key];
		if( this.moves[direction] !== undefined )
			return false;

		this.moves[direction] = true;

		//TODO: We can start tween motion or animation here
		this.ani.actions.run.play();
		return true;
	}

	onMoveEnd (event) {
		let key = InputDesktop.keyName(event.keyCode);
		if( !InputDesktop.isMoveKey(key) )
			return false;

		const direction = InputDesktop.moveKeys[key];
		if( this.moves[direction] !== undefined )
			delete this.moves[direction];

		if( this.hasMoves() )
			return true;

		// Reduce speed modifier
		this.speedModifier = 0;
		//TODO: We can stop tween motion or animation here
		this.ani.actions.run.stop();
		this.ani.actions.idle.play();
		return true;
	}

	hasMoves () {
		return ( Object.keys(this.moves).length > 0 );
	}

	update () {
		this.updateAnimation();
		this.updatePosition();
	}

	updateAnimation () {
		this.ani.mixer.update(this.engine.delta);
	}

	updatePosition () {
		if( !this.hasMoves() )
			return false;

		//console.log(this.moveQueue.size);
		let destinationVector = new THREE.Vector3(0,0,0);
		for( let d in this.moves )
			destinationVector.add(InputDesktop.moveVectors[d]);

		this.movePlayer(destinationVector);
	}

	movePlayer (directionVector) {
		let playerObject = this.object;

		// calculate distance for single player move in one frame
		//TODO: It related to outfit weight, agility and other player stats
		//TODO: Animation must plays faster on faster movings
		let initialSpeed = 1;//TODO: speed from Hero stats
		let currentSpeed = initialSpeed + this.speedModifier*0.1;
		// Unit cant move faster than threshold
		if( currentSpeed > this.speedThreshold )
			currentSpeed = this.speedThreshold;
		else
			this.speedModifier++;

		let distance = currentSpeed * this.engine.delta * this.globalSpeedModifier;
		playerObject.translateOnAxis(directionVector, distance);

		return true;
	}

	rotatePlayer (event) {
		// Rotate player to left/right
		this.object.rotateY(-event.movementX*this.rotateMod);
		// Rotate camera to up/down
		this.object.getObjectByName('PlayerCamera').rotateX(-event.movementY*this.rotateMod);
	}
}