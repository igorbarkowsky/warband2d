"use strict";

import * as Utils from "./utils.js";
// import {Event as EventMixin} from "./mixins/Event.js";
import {Events} from "./mixins/Event.js";
import {Say as SayMixin} from "./mixins/Say.js";

import {Troop} from "./Troop.js";

export class Hero extends Troop {
	constructor (settings, attributes, skills, proficiencies) {
		super(settings, attributes, skills, proficiencies);
		Events(this).setupEventsHandlers();
		this.type = 'hq';
	}

	setupEventsHandlers () {}
}
Utils.mixin(Hero, SayMixin);
