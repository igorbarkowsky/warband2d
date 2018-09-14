"use strict";

import * as Utils from "./utils.js";
import {Events} from "./mixins/Event.js";

export class Autobattle {
	constructor (partiesFromSideA, partiesFromSideB, scene) {
		Events(this).setupEventsHandlers();
		// Battle parties. Each party choose one of battle sides
		this.sides = {
			A: partiesFromSideA,
			B: partiesFromSideB,
		};

		this.scene = scene;
	}

	battle () {
		let sidesPower = {};
		for (let side in this.sides ) {
			let sideParties = this.sides[side];
			sidesPower[side] = 0;
			for( let party of sideParties ) {
				let partyPower = this.calculatePartyPower(party);
				//TODO: More logic for relations between parties at one side. Modifiers for bad relations between leaders, different factions, both-hated troops like regular and mercenary
				sidesPower[side] += partyPower;
			}
		}
		console.log(sidesPower);
		//And winner is...
		let winSide = Utils.objectMaxKey(sidesPower);
		console.log(winSide);
		//let winSide = sidesPower.indexOf(biggestPower);

		//TODO: Change sides parties like they really charged, reduce amount of troops, etc...
		
		return this.sides[winSide];
	}
	
	calculatePartyPower (party) {
		console.log("calculatePartyPower", party)
		//TODO: We need more complex logic
		let partyBattlePt = 0;
		let divisionsPt = 0;
		let scene = this.scene;

		for( let div in party.divisions ) {
			let division = party.divisions[div];
			let divPt = division.getBaseBattlePotential();
			console.log("Base battle potential for division", div, "is", divPt);
			// Additional mods for different types
			switch( div ) {
				case 'infantry':
					// terrain, lower for bog/mountain and higher for plain hill
					if( scene.terrain == 'bog' || scene.terrain == 'mountains' )
						divPt *= 0.75;
					else if ( scene.terrain == 'forest' )
						divPt *= 1.25;
				break;

				case 'archers':
					if( scene.terrain == 'hills' || scene.terrain == 'mountains' )
						divPt *= 1.5;
					else if ( scene.terrain == 'forest' )
						divPt *= 0.75;
						
					if( scene.weather == 'rain' || scene.weather == 'blizzard' )
						divPt *= 0.5;
				break;

				case 'cavalry':
					// terrain, lower for bog/mountain and higher for plain hill
					if( scene.terrain == 'bog' || scene.terrain == 'mountains' )
						divPt *= 0.5;
					else if ( scene.terrain == 'forest' )
						divPt *= 0.75;
				break;

				default:
					// terrain, lower for bog/mountain and higher for plain hill
					if( scene.terrain == 'bog' || scene.terrain == 'mountains' )
						divPt *= 0.75;
					else if ( scene.terrain == 'forest' )
						divPt *= 1.25;
				break;
			}
			divisionsPt += divPt;
		}

		//TODO:
		//Leader modificators from tactic skill, surgeon, nurse, pervuasion, charisma and others
		let LeaderMod = 0;

		//TODO:
		//Morale modificator
		let MoraleMod = 1;

		//TODO: faction related mods, like battle with south-eastern factions at desert raise battle pt for southerns
		
		//Now time to calculate
		partyBattlePt = (divisionsPt + LeaderMod) * MoraleMod;
		console.log(partyBattlePt);
		return partyBattlePt;
	}

	setupEventsHandlers () {}
}

// Utils.mixin(Autobattle, EventMixin);
Events(Autobattle);