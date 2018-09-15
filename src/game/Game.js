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
		let NewScene = new GameScene({title: "Wonderful forest", width: 105, terrain:'bog'});
		console.log("New scene added", NewScene);
		//Some units
		let Player = new Hero({title: 'Richard Asshole', weight: 80, size: 'L', hp: 100, isPlayer: true, color: 0x999999});
		console.log("New player added", Player);
		let Enemy = new Troop({weight: 1, size: 'S', color:0x00ff00});
		console.log("New enemy added", Enemy);

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
		NewScene.addObject(Player, {x:3, y: 3});
		NewScene.addObject(Enemy, {x:10, y: 10});
	}

	setupEventsHandlers () {

	}
}

export const Event = Game.getEventBus();
