"use strict";

import {Event as EventBus} from "./Event.js";

import {Hero} from "./Hero.js";
import {Troop} from "./Troop.js";
import {GameScene} from "./GameScene.js";
import {Party} from "./Party.js";
import {Autobattle} from "./Autobattle.js";
import {GameEngineFactory} from "./engines/GameEngineFactory.js";

export class Game {
	constructor () {

		this.objects = {};

		this.initEngine();
		this.initGameObjects();
	}

	static getEventBus () {
		return new EventBus();// Event emitter/ game event bus
	}

	initEngine () {
		const selectedEngine = 'three';
        this.engine = new GameEngineFactory(selectedEngine);
	}

	initGameObjects () {
		// Initial settings for game
		console.log('Init the Game', this);
		//New scene
		let NewScene = new GameScene({title: "Wonderful forest", width: 25, depth: 25, terrain:'bog'});
		//Some units
		let Player = new Hero({title: 'Richard Asshole', weight: 80, size: 'L', hp: 100, isPlayer: true, color: 0x0000ff});
		let Enemy = new Troop({weight: 1, size: 'S', color:0xff0000});

		this.objects = {
			NewScene, 
			Player, 
			Enemy, 
		};
	}

	play () {
		let {
			NewScene, 
			Player,
			Enemy,
		} = this.objects;
		// This is a tests for future game
		NewScene.addObject(Player, {x:7, y: 0, z: 7});
		NewScene.addObject(Enemy, {x:3, y: 0, z: 3});
	}

	setupEventsHandlers () {

	}
}

export const Event = Game.getEventBus();
