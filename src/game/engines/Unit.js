import * as THREE from "three";
import {Event} from './../Game.js';

export default class Unit {
	constructor (engine) {
		console.log(engine);
		this.engine = engine;
		this.object = null;
		this.model = null;
		this.ani = {
			mixer: null,
			clips: [],
			actions: {},
		};
	}

	initObject3dFromJsonModel (model) {
		this.model = model;
		this.scaleModel();
		let object = new THREE.Group();

		object.add(model);
		this.object = object;
		return this;
	}

	initObject3dFromGltfModel (model) {
		this.model = model.scene;
		this.scaleModel();
		let object = new THREE.Group();

		object.add(model.scene);
		this.object = object;
		return this;
	}

	initPosition (position) {
		this.object
			.translateX(position.x)
			.translateY(position.y-0.5)
			.translateZ(position.z);
		return this;
	}

	scaleModel () {
		// rescale model - fit it to 2 meters height
		let box = new THREE.Box3().setFromObject( this.model );
		let optimalScaleFoThisModel = 2/box.max.y;
		this.model.scale.multiplyScalar(optimalScaleFoThisModel);
	}

	initAni (model) {
		this.ani.mixer = new THREE.AnimationMixer( model );
		this.ani.clips = this.getAnimationsFromModel(model);
		if( this.ani.clips.length ) {
			for( let clip of this.ani.clips ) {
				this.ani.actions[clip.name] = this.ani.mixer.clipAction(clip.name);
			}
		}

		Event.trigger("ThreeEngineUnit.onInitAnimationSuccess", this);
		return this;
	}

	getAnimationsFromModel (model) {
		let clipArray = model.geometry && model.geometry.animations || model.animations;
		return clipArray;
	}

	update () {}
}