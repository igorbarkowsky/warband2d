"use strict";

import {Event} from "./Game.js";

import {Unit} from "./Unit.js";
import {NameGenerator} from './data/NameGenerator.js';

export class Troop extends Unit {
	constructor (settings, attributes, skills, proficiencies) {
		super(settings);

		let {
			type = 'support',
				xp = 0,
				lvl = 1,
		} = settings;
		let unitSettings = {
			type,
			xp,
			lvl,
		};
		Object.assign(this, unitSettings);

		// Generate normal name
		if( this.title === 'Noname unit' ) {
			this.title = new NameGenerator().generateName();
		}

		this.attrs = {};
		this.skills = {};
		this.profs = {};

		this
			.initAttributes(attributes)
			.initSkills(skills)
			.initProficiencies(proficiencies)
		;
		
		Event.trigger('Troop.Created', this);
	}

	initAttributes (attributes) {
		let {
			strength = 1,
			agility = 1,
			intellect = 1,
			charisma = 1,
		} = attributes;
		
		let troopAttrs = {
			strength,
			agility,
			intellect,
			charisma,
		};
		
		Object.assign(this.attrs, troopAttrs);
		Object.freeze(this.attrs);
		
		return this;
	}
	
	initSkills (skills) {
		let {
			ironflesh = 0, // Reduce enemy damage
			striker = 0, // Strikes take more damage, increase chance for critical strike
			skirmisher = 0, // Operate throw weapon faster, increase it damage
			bowman = 0, // Operate your bow faster, increase bow damage and stability
			shield = 0, // Operate your shield faster, more covering
			weaponmaster = 0, // Can upgrade your profs to higher levels. Lower chance to break weapon in a battle.
			outfitmaster = 0, // Lower chance to break in a battle
			sprinter = 0, // Can move faster, improve stamina
			horseman = 0, // Can ride faster. Some horses require high skill.
			horseshooter = 0, // Can shoot from horse with more stability
			looter = 0, // Increase loot and it quality
			trainer = 0, // Can train other units with lower lvl
			tactic = 0, // Get unit advance in battles
			pathfinder = 0, // Get more information from track, find better paths, increase speed on map
			scout = 0, // Scouting and party seeing range
			shipman = 0, // Experienced sailor and ship captain improve speed in sea travels
			thief = 0, // Art of sneaking
			trader = 0, // Better prices
			stockman = 0, // Inventory management, chests, stocks
			craftman = 0, // Craftmanship
			surgeon = 0, // Save lifes of heavy wounded party members
			nurse = 0, // Speed up hp ressurect after battles for all party members
			firstaid = 0, // Heal yourself in a battle
			engineer = 0, // Speed up construction
			pervuasion = 0,
			leadership = 0, // Can lead more units in party, improve morale
			admiral = 0, // Can lead more ships, improve morale
		} = skills;
		
		let troopSkills = {
			ironflesh, 
			striker,
			skirmisher,
			bowman, 
			shield, 
			weaponmaster, 
			outfitmaster, 
			sprinter, 
			horseman, 
			horseshooter, 
			looter, 
			trainer, 
			tactic, 
			pathfinder, 
			scout, 
			shipman, 
			thief, 
			trader, 
			stockman, 
			craftman, 
			surgeon, 
			nurse, 
			firstaid, 
			engineer, 
			pervuasion,
			leadership, 
			admiral,
		};

		Object.assign(this.skills, troopSkills);
		Object.freeze(this.skills);

		return this;
	}

	initProficiencies (proficiencies) {
		let {
			onehanded = 0,
			twohanded = 0,
			polearms = 0,
			bows = 0,
			crossbows = 0,
			grenades = 0,
			firearms = 0,
		} = proficiencies;

		let troopProfs = {
			onehanded,
			twohanded,
			polearms,
			bows,
			crossbows,
			grenades,
			firearms,
		};

		Object.assign(this.profs, troopProfs);
		Object.freeze(this.profs);

		return this;
	}

	setupEventsHandlers () {}
}
