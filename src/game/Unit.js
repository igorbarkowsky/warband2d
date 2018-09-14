"use strict";

export class Unit {
	constructor (settings) {
		let {
			title = 'Noname unit',
			weight = 0, 
			size = 'M', 
			hp = 10, 
			xp = 0, 
			lvl = 1, 
			alive = true, 
			isHero = false, 
			color = 0x000000, 
			// dims = [0,0,0],
		} = settings;
		let unitSettings = {
			title, 
			weight, 
			size, 
			hp, 
			xp, 
			lvl, 
			alive, 
			isHero, 
			color, 
		};
		Object.assign(this, unitSettings);
	}
};
