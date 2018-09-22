import {Event} from './../Game.js';
import {Events} from "./../mixins/Event.js";

import * as THREE from "three";
import * as CANNON from "cannon";
import * as Utils from "../Utils";
import GLTFLoader from "three-gltf-loader";


export default class Unit {
	constructor (engine) {
		Events(this);
		this.engine = engine;
		this.object = null;
		this.model = null;
		this.body = null;
		this.gameObject = null;
		this.ani = {
			mixer: null,
			clips: [],
			actions: {},
		};
	}

	loadModel (modelFile, gameObject, position, onSuccessLoadModelCallback = undefined) {
		let file = modelFile.file || modelFile;
		let type = modelFile.type;

		if( !type )
			type = Utils.getFileExtension(modelFile);

		let loader, callback;
		switch( type ) {
			case 'gltf':
			case 'glb':
				loader = new GLTFLoader(this.engine.loading.manager);
				callback = importedObject => {
					let model = importedObject;
					if( onSuccessLoadModelCallback !== undefined )
						onSuccessLoadModelCallback(model, gameObject, position);
					else
						this.init(model, gameObject, position);
				};
				break;

			default:
				loader = new THREE.ObjectLoader(this.engine.loading.manager);
				callback = importedObject => {
					let model = null;
					importedObject.traverse( function ( child ) {
						if ( child instanceof THREE.SkinnedMesh ) {
							model = child;
						}
					} );
					if( model ) {
						if( onSuccessLoadModelCallback !== undefined )
							onSuccessLoadModelCallback(model, gameObject, position);
						else
							this.init(model, gameObject, position);
					}
				};
				break;

		}
		loader.load(modelFile,
			callback,
			xhr => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
			error => console.log( 'An error happened while loading', error )
		);

	}

	init (model, gameObject, position) {
		this.gameObject = gameObject;

		this.initObject3dFromModel(model)
			.scaleModelTo(1)
			.initPosition(position)
			.initAni(model)
			//.initPhysics(gameObject)
		;
		Event.trigger('ThreeEngineUnit.SuccessInit', this);
		return this;
	}

	initObject3dFromModel (model) {
		this.model = model.scene || model;
		let object = new THREE.Group();

		object.add(this.model);
		this.object = object;
		return this;
	}

	scaleModelTo (scaleTo = 2) {
		// rescale model - fit it to 2 meters height
		let box = new THREE.Box3().setFromObject( this.model );
		let optimalScaleFoThisModel = scaleTo / this.getModelSize().y;
		this.model.scale.multiplyScalar(optimalScaleFoThisModel);
		return this;
	}

	getModelSize () { return new THREE.Box3().setFromObject( this.model ).getSize(); }
	getObjectSize () { return new THREE.Box3().setFromObject( this.object ).getSize(); }

	initPosition (position) {
		this.object
			.translateX(position.x)
			.translateY(this.getObjectSize().y/2)
			.translateZ(position.z);
		return this;
	}

	initPhysics (gameObject) {
		let box = new THREE.Box3().setFromObject( this.model );
		let sizes = new THREE.Vector3();
		box.getSize(sizes);
		let shape = new CANNON.Box(new CANNON.Vec3(sizes.x/2, sizes.y/2, sizes.z/2));
		let body = new CANNON.Body({ mass: gameObject.weight });
		body.addShape(shape);
		body.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
		this.engine.physics.world.addBody(body);
		this.body = body;
		this.body.inited = true;

		this.trigger("InitPhysicsSuccess", this);

		return this;
	}

	initAni (model) {
		this.ani.mixer = new THREE.AnimationMixer( model );
		this.ani.clips = this.getAnimationsFromModel(model);
		if( this.ani.clips.length ) {
			for( let clip of this.ani.clips ) {
				this.ani.actions[clip.name] = this.ani.mixer.clipAction(clip.name);
			}
		}

		this.trigger("InitAnimationSuccess", this);
		return this;
	}

	getAnimationsFromModel (model) {
		let clipArray = model.geometry && model.geometry.animations || model.animations;
		return clipArray;
	}

	update () {}
}