"use strict";

import * as Utils from "./utils.js";
import {Event as EventEmitter} from "./Event.js";

import {Hero} from "./Hero.js";
import {Troop} from "./Troop.js";
import {GameScene} from "./GameScene.js";
import {Party} from "./Party.js";
import {Autobattle} from "./Autobattle.js";
import {GameEngineFactory} from "./engines/GameEngineFactory.js";
import {ThreeEngine} from "./engines/ThreeEngine.js";

export class Game {
	constructor () {

		this.objects = {};

		this.initEngine();
		this.initGameObjects();
	}

	static getEventEmitter () {
		return new EventEmitter();// Event emitter/ game event bus
	}

	initEngine () {
		const selectedEngine = 'three';
		let engine = new GameEngineFactory(selectedEngine);
		this.engine = engine;
	}

	initGameObjects () {
		// Initial settings for game
		console.log('Init the Game', this);
		//New scene
		let NewScene = new GameScene({title: "Wonderfull forest", width: 105, terrain:'bog'});
		console.log("New scene added", NewScene);
		//Some units
		let Player = new Hero({title: 'Richard Asshole', weight: 80, size: 'L', hp: 100, isHero: true, color: 0x999999});
		console.log("New player added", Player);
		let Enemy = new Troop({weight: 1, size: 'S', color:0x00ff00});
		console.log("New enemy added", Enemy);

		//Some parties
		let PlayerParty = new Party({title:"Player's party", faction: 'Commoners', color: 'green'}, Player, [Player]);
		console.log("New party created", PlayerParty);
		let EnemyParty = new Party({title:"Enemy's party", faction: 'Bandits', color: 'red'}, Enemy, [Enemy]);
		console.log("Another new party created", EnemyParty);

		Object.assign(this.objects, {
			NewScene, 
			Player, 
			Enemy, 
			PlayerParty, 
			EnemyParty, 
		})
	}

	play () {
		let {
			NewScene, 
			Player, 
			Enemy, 
			PlayerParty, 
			EnemyParty, 
		} = this.objects;
		// This is a tests for future game
		NewScene.addObject(PlayerParty, {x:3, y: 3});
		NewScene.addObject(EnemyParty, {x:10, y: 10});
		Event.on('autocalc.battle', function(partiesFromSideA, partiesFromSideB, scene){
			let newAutobattle = new Autobattle(partiesFromSideA, partiesFromSideB, scene);
			console.log("New autobattle starts", newAutobattle);
			let winner = newAutobattle.battle();
			console.log("And winner is ", winner);
		});
		// Test talks
		Player.say("I go to autobattle!");

		console.log("Start Player's position is", NewScene.getObjectPosition(PlayerParty));
		// Test collisions
		let newCoords = {x:10, y: 10};
		console.log("Try to move", PlayerParty, "at", newCoords);
		NewScene.moveObjectTo(PlayerParty, newCoords);
		console.log("New Player's position is", NewScene.getObjectPosition(PlayerParty));
	}

	setupEventsHandlers () {

	}
}

export const Event = Game.getEventEmitter();
