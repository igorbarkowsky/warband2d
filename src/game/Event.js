"use strict";

import {Events} from "./mixins/Event.js";

export class Event {
	constructor () {
		return Events(this);
	}
}