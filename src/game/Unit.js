"use strict";

export class Unit {
	constructor (settings) {
		let {
			title = 'Noname unit',
			weight = 0, 
			size = 'M', 
			hp = 10, 
			alive = true,
			color = 0x000000,
		} = settings;
		let unitSettings = {
			title, 
			weight, 
			size, 
			hp, 
			alive,
			color,
		};
		Object.assign(this, unitSettings);
	}
};
