"use strict";

import {ThreeEngine} from "./ThreeEngine.js";

export class GameEngineFactory {
	constructor (selectedEngine) {
		switch (selectedEngine) {
			default:
				return new ThreeEngine();
			break;
		}
	}
}
