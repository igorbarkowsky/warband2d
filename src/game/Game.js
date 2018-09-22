"use strict";

import {Event as EventBus} from "./Event.js";

import {Hero} from "./Hero.js";
import {Troop} from "./Troop.js";
import {GameScene} from "./GameScene.js";
import {Party} from "./Party.js";
import {Autobattle} from "./Autobattle.js";
import {GameEngineFactory} from "./engines/GameEngineFactory.js";

import DefaultPlayerStats from './data/defaultPlayerStats.js';
import DefaultTroopStats from './data/defaultTroopStats.js';

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
		let NewScene = new GameScene({title: "Wonderful forest", width: 500, depth: 500, terrain:'bog'});
		//Some units
		let Player = new Hero({title: 'Richard Asshole', weight: 100, size: 'L', hp: 100, isPlayer: true, color: 0x0000ff},
			DefaultPlayerStats.attributes, DefaultPlayerStats.skills, DefaultPlayerStats.proficiencies);
		let Enemy = new Troop({weight: 50, size: 'S', color:0xff0000},
			DefaultTroopStats.attributes, DefaultTroopStats.skills, DefaultTroopStats.proficiencies);

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
		NewScene.addObject(Player, {x:20, y: 0, z: 20});
		NewScene.addObject(Enemy, {x:10, y: 0, z: 10});
	}

	setupEventsHandlers () {

	}
}

export const Event = Game.getEventBus();
