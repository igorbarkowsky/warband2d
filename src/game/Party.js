"use strict";

import {Division} from './Division.js';
import {Troop} from './Troop.js';
import {Hero} from './Hero.js';

export class Party {
	constructor (settings, leader, units ) {
		let {
			title = 'Noname party',
			faction = 'Commoners', 
			color = 0xffffff, 
		} = settings;

		let partySettings = {
			title,
			faction, 
			color, 
		};
		Object.assign(this, partySettings);

		this.divisions = {
			infantry: new Division('infantry'), 
			archers: new Division('archers'), 
			cavalry: new Division('cavalry'), 
			skirmishers: new Division('skirmishers'), 
			artillery: new Division('artillery'), 
			support: new Division('support'), 
			guards: new Division('guards'), 
			hq: new Division('hq'), 
		};

		this.leader = leader;

		this.units = new Map();
		for( let unit of units ) {
			if( unit instanceof Troop ) {
				this.hireUnit(unit);
				this.setUnitDivision(unit, unit.type);				
			}
		}
	}

	isPlayerParty () {
		return ( this.leader instanceof Hero );
	}

	getPartySize () {
		return this.units.size;
	}

	hireUnit (unit) {
		//TODO: add heroes at once, troops increments
		let canHired = false;
		//Heroes are unique, so we must check if hero already exists in party
		if( unit.isHero && !this.units.has(unit) ) {
			canHired = true;
		}
		//Check party limit for player
		else if( this.isPlayerParty() && this.leader.maxPartySize() > this.getPartySize() ) {
			canHired = true;
		}

		//After pass all checks, we can hire unit to party
		if( canHired ) {
			this.units.set(unit);
			// by default move unit to its native division
			//TODO: callbacks
			return true;
		}
		else {
			//TODO: callbacks
			return false;
		}
		
	}

	disbandUnit (unit) {
		//TODO: cannot disband heroes, troops decrements
		if( !unit.isHero ) {
			this.units.delete(unit);
			return true;
		}
		else {
			return false;
		}
	}

	setUnitDivision (unit, type) {
		for( let div in this.divisions ) {
			let division = this.divisions[div];
			if( division.type == type ) {
				division.addUnit(unit);
			}
		}
	}
}
