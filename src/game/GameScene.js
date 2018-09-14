"use strict";

import * as Utils from "./utils.js";
import {Event} from "./Game.js";

import {Party} from "./Party.js";

export class GameScene {

	constructor (settings) {
		
		let {
			title = 'Noname scene',
			width = 100, 
			height = 100, 
			terrain = 'plain', 
			weather = 'sunny', 
		} = settings;
		let sceneSettings = {
			title,
			width, 
			height, 
			terrain, 
			weather, 
		}
		Object.assign(this, sceneSettings);

		this.objects = new Map();
		Event.trigger('GameScene.Init', this);
	}

	addObject (object, coords)
	{
		this.objects.set(object, {position: coords});
		Event.trigger('GameScene.addObject', this, object, coords);
	}

	delObject (objectKey)
	{
		return this.objects.delete(objectKey);
	}

	getObject (objectKey)
	{
		return this.objects.get(objectKey);
	}

	moveObjectTo (objectKey, position) {
		this.getObject(objectKey).position = position;
		Event.trigger('GameScene.moveObjectTo', objectKey, position);
		// Check if we collision with another objects
		let existsAtPosition = this.whoElseExistsAtPosition(position, objectKey);
		if( existsAtPosition != [] ) {
			// Start autobattle if enemy
			console.log("In this position we found somebody else, go to war with them!");
			//TODO: convert code for battle with multiple parties on both sides
			if( objectKey instanceof Party ) {
				for( let existObject of existsAtPosition ) {
					if( existObject instanceof Party && existObject.faction != objectKey.faction ) {
						Event.trigger('autocalc.battle', [objectKey], [existObject], this);
					}
				}				
			}
		}
	}

	getObjectPosition (objectKey)
	{
		return this.getObject(objectKey).position;
	}

	whoElseExistsAtPosition ( position, objectKey )
	{
		let existsAtPosition = [];
		for( let o of this.objects.keys() )
		{
			if( o == objectKey )
				continue;

			if( this.isObjectExistsAt(o, position) )
				existsAtPosition.push(o);
		}

		return existsAtPosition;
	}

	isObjectExistsAt (objectKey, position)
	{
		if( this.getObjectPosition(objectKey).x == position.x && this.getObjectPosition(objectKey).y == position.y )
			return true;
	}

	isObjectsCollisions (objectA, objectB) {
		return this.isObjectExistsAt(objectA, this.getObjectPosition(objectB));
	}

	setupEventsHandlers () {}
}
