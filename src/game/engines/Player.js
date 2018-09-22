import {Event} from "./../Game.js";

import * as THREE from "three";
import * as CANNON from "cannon";

import Troop from './Troop.js';
import InputDesktop from './../InputDesktop.js';

export default class Player extends Troop {
	constructor (engine) {
		super(engine);
		this.speedModifier = 0;
		this.speedModifierThreshold = 100;
		this.globalSpeedModifier = 2;
		this.rotateMod = 0.0005;
		this.moves = {};

		// When true - rotate camera left/right instead player
		this.moveCameraModifier = false;

		this.initEventHandlers();
	}

	init (model, gameObject, position) {
		this.gameObject = gameObject;

		let {camera} = this.engine.tools;
		this.initObject3dFromModel(model)
			.scaleModelTo(2)
			.initPosition(position)
			.bindCamera (camera)
			.initAni(model)
			//.initPhysics(gameObject)
		;
		Event.trigger('ThreeEngineUnit.SuccessInit', this, model, gameObject, position);
		return this;
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
		Event.on("InputDesktop.MouseDown", event => this.clickPlayer(event));
		Event.on("InputDesktop.MouseUp", event => this.clickPlayer(event));
		Event.on("InputDesktop.KeyDown", event => this.onMoveStart(event));
		Event.on("InputDesktop.KeyUp", event => this.onMoveEnd(event));
		this.on("InitAnimationSuccess", () => this.startIdleAnimation());
		// Делаем игрока устойчивым
		this.on("InitPhysicsSuccess", () => {
			this.body.fixedRotation = true;
			this.body.updateMassProperties();
		});
	}

	startIdleAnimation () {
		// We use two animations to move - run and idle
		this.ani.actions.run.fadeOut(this.engine.delta).play();
		this.ani.actions.idle.fadeIn(this.engine.delta).play();
	}

	animationCrossfade (startAnimation, endAnimation, duration = 1, warp = false) {
		endAnimation.time = 0;// Start end animation from first keyframe
		endAnimation.enabled = true;// Must be enabled to be visible
		endAnimation.setEffectiveTimeScale( 1 );
		endAnimation.setEffectiveWeight( 1 );

		startAnimation.crossFadeTo(endAnimation, duration, warp);
	}

	onMoveStart (event) {
		let key = InputDesktop.keyName(event.keyCode);
		if( !InputDesktop.isMoveKey(key) )
			return false;

		const direction = InputDesktop.moveKeys[key];
		if( this.moves[direction] !== undefined )
			return true;

		this.moves[direction] = true;

		// Another keys pressed too - we do not switch animation
		if( this.movesQnty() > 1 ) {
			return true;
		}
		else {
			// We can start tween motion or animation here
			//TODO: Fix incorrect animation
			this.animationCrossfade(this.ani.actions.idle, this.ani.actions.run, 2);

			return true;
		}
	}

	onMoveEnd (event) {
		let key = InputDesktop.keyName(event.keyCode);
		if( !InputDesktop.isMoveKey(key) )
			return false;

		const direction = InputDesktop.moveKeys[key];
		if( this.moves[direction] !== undefined )
			delete this.moves[direction];

		// Another keys pressed too - we do not switch animation and do not stop player
		if( this.hasMoves() ) {
			return true;
		}
		else {
			// Reset speed modifier
			this.speedModifier = 0;

			this.animationCrossfade(this.ani.actions.run, this.ani.actions.idle, this.engine.delta*30);
			return true;
		}
	}

	hasMoves () {
		return ( this.movesQnty() > 0 );
	}

	movesQnty () {
		return Object.keys(this.moves).length;
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

		let localDirectionVector = new THREE.Vector3(0,0,0);
		for( let d in this.moves )
			localDirectionVector.add(InputDesktop.moveVectors[d]);

		this.movePlayerPhysic(localDirectionVector);
	}

	// Real physic move
	movePlayerPhysic (directionVector) {
		// Translate THREE vector to CANNON Local vector
		let moveDirection = new CANNON.Vec3(directionVector.x,
			directionVector.y,
			directionVector.z);
		moveDirection.normalize();
		// Convert local to world vector
		let worldDirection = this.body.vectorToWorldFrame(moveDirection);

		// calculate distance for single player move in one frame
		//TODO: It related to outfit weight, agility and other player stats
		//TODO: Animation must plays faster on faster movings
		//TODO: speed from Hero stats
		// Let initial speed is a half of agility (10 agility = 5m/s for example)
		let initialSpeed = this.gameObject.attrs.agility/2;
		// Bonus to speed. One sprinter skill point is +5% to initial speed
		initialSpeed += this.gameObject.attrs.agility* this.gameObject.skills.sprinter*0.05;
		// Speed modifier is boost from keypress. It emulate from walk to run situation
		let currentSpeedModifier = initialSpeed * this.speedModifier*0.01;
		let currentSpeed = initialSpeed + currentSpeedModifier;
		// Unit cant get speedModifier bonus more than threshold
		if( this.speedModifier > this.speedModifierThreshold )
			this.speedModifier = this.speedModifierThreshold;
		else
			this.speedModifier++;

		currentSpeed *= this.globalSpeedModifier;

		// Apply new velocity in target vector (in world scope)
		this.body.velocity = worldDirection.mult(currentSpeed);
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

	clickPlayer (event) {
		if( event.type === 'mousedown' && event.button === 0 )
			this.moveCameraModifier = true;
		else if (event.type === 'mouseup' && event.button === 0 )
			this.moveCameraModifier = false;
	}
	rotatePlayer (event) {
		// Rotate camera
		let camera = this.object.getObjectByName('PlayerCamera');
		camera.rotateX(-event.movementY*this.rotateMod);

		if( this.moveCameraModifier ) {
			camera.rotateY(-event.movementX*this.rotateMod);
		}
		else {
			// Rotate player left/right
			let angleY = -event.movementX*this.rotateMod;
			let quatY = new CANNON.Quaternion();
			quatY.setFromAxisAngle(new CANNON.Vec3(0,1,0), angleY).normalize();
			this.body.quaternion = this.body.quaternion.mult(quatY);
		}


	}
}