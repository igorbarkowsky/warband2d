"use strict";

import {Troop} from "./Troop.js";

export class Hero extends Troop {
	constructor (settings, attributes, skills, proficiencies) {
		super(settings, attributes, skills, proficiencies);
		this.type = 'hq';
		let {
			isPlayer = false,
		} = settings;
		let unitSettings = {
            isPlayer,
		}
        Object.assign(this, unitSettings);
	}

	setupEventsHandlers () {}
}
