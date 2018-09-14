"use strict";

export class Division {
	constructor (type) {
		this.type = type;
		this.units = new Set();
	}
	
	addUnit (unit) {
		this.units.add(unit);
	}

	removeUnit (unit) {
		this.units.delete(unit);
	}

	getSize () {
		return this.units.size;
	}

	getType () {
		return this.type;
	}

	getBaseBattlePotential () {
		let pt = 0;
		for( let unit of this.units ) {
			//TODO: change formula to reality
			pt += unit.lvl * unit.hp;
		}

		return pt;
	}
}
