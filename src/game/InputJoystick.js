import {Event} from "./Game.js";

export default class InputJoystick {

	constructor() {}

	static onKeyDown (event) {
		Event.trigger("InputDesktop.KeyDown", event);
	}

	static onKeyUp (event) {
		Event.trigger("InputDesktop.KeyUp", event);
	}

	static onKeyPress (event) {
		Event.trigger("InputDesktop.KeyPress", event);
	}

	static onMouseMove (event) {
		console.log("Input.onMouseMove");
		Event.trigger("Input.MouseMove", event);
	}

	static get keyMap () {
		return {
			keyW: "forward",
			keyS: "backward",
			keyA: "left",
			keyD: "right",
		};
	}

	static get moveVector () {
		return {
			forward: {x:0, y:0, z:-1},
			backward: {x:0, y:0, z:1},
			left: {x:-1, y:0, z:0},
			right: {x:1, y:0, z:0},
		};
	}
}