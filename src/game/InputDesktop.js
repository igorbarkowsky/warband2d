import {Event} from "./Game.js";
import {KeyboardState} from "./KeyboardState";

export default class InputDesktop {

	constructor() {}

	static onKeyDown (event) {
		const key = InputDesktop.keyName(event.keyCode);
		if( !InputDesktop.isPressed(key) )
			InputDesktop.pressed[key] = true;
		Event.trigger("InputDesktop.KeyDown", event);
	}

	static onKeyUp (event) {
		const key = InputDesktop.keyName(event.keyCode);
		delete InputDesktop.pressed[key];
		// console.log("onKeyUp delete key", key, "and now pressed only", InputDesktop.allPressed());
		Event.trigger("InputDesktop.KeyUp", event);
	}

	static onKeyPress (event) {
		Event.trigger("InputDesktop.KeyPress", event);
	}

	static onMouseMove (event) {
		Event.trigger("InputDesktop.MouseMove", event);
	}

	static keyName(keyCode ) {
		return ( InputDesktop.k[keyCode] != null ) ?
			InputDesktop.k[keyCode] :
			String.fromCharCode(keyCode);
	}

	static isPressed (key) {
		return ( InputDesktop.pressed[key] !== undefined );
	}

	static isMoveKey (key) {
		return ( InputDesktop.moveKeys[key] !== undefined );
	}

	static allPressed () {
		return Object.keys(InputDesktop.pressed);
	}
}

//NOTE: I know it bad - but in current es6 i can do static map property only this way
InputDesktop.pressed = {};//BUG: Set() works incorrect
InputDesktop.moveKeys = {
	"W": "forward",
	"S": "backward",
	"D": "right",
	"A": "left",
};
InputDesktop.moveVectors = {
	"forward":  {x:0, y:0, z:-1},
	"backward": {x:0, y:0, z:1},
	"left":     {x:-1, y:0, z:0},
	"right":    {x:1, y:0, z:0},
};
InputDesktop.k = {
		8: "backspace",  9: "tab",       13: "enter",    16: "shift",
		17: "ctrl",     18: "alt",       27: "esc",      32: "space",
		33: "pageup",   34: "pagedown",  35: "end",      36: "home",
		37: "left",     38: "up",        39: "right",    40: "down",
		45: "insert",   46: "delete",   186: ";",       187: "=",
		188: ",",      189: "-",        190: ".",       191: "/",
		219: "[",      220: "\\",       221: "]",       222: "'"
};
