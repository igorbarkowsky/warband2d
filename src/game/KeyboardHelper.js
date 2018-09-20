export class KeyboardHelper {
	constructor() {
		// bind keyEvents
		this.status = {};
		document.addEventListener("keydown",  event => this.onKeyDown(event), true);
		document.addEventListener("keyup",    event =>  this.onKeyUp(event),  true);
	}

	keyName(keyCode ) {
		return ( this.k[keyCode] != null ) ?
			this.k[keyCode] :
			String.fromCharCode(keyCode);
	}

	onKeyUp(event) {
		const key = this.keyName(event.keyCode);
		if ( this.status[key] )
			this.status[key].pressed = false;
	}

	onKeyDown(event) {
		const key = this.keyName(event.keyCode);
		if ( !this.status[key] )
			this.status[key] = { down: true, pressed: false, up: false, updatedPreviously: false };
	}

	update() {
		for (let key in this.status) {
			// insure that every keypress has "down" status exactly once
			if ( !this.status[key].updatedPreviously ) {
				this.status[key].down        		= true;
				this.status[key].pressed     		= true;
				this.status[key].updatedPreviously = true;
			}
			else // updated previously
			{
				this.status[key].down = false;
			}

			// key has been flagged as "up" since last update
			if ( this.status[key].up ) {
				delete this.status[key];
				continue; // move on to next key
			}

			if ( !this.status[key].pressed ) // key released
				this.status[key].up = true;
		}
	}

	down(keyName) {
		return (this.status[keyName] && this.status[keyName].down);
	}

	pressed(keyName) {
		return (this.status[keyName] && this.status[keyName].pressed);
	}

	up(keyName) {
		return (this.status[keyName] && this.status[keyName].up);
	}

	debug() {
		let list = "Keys active: ";
		for (let arg in this.status)
			list += " " + arg
		console.log(list);
	}

	get k () {
		return {
			8: "backspace",  9: "tab",       13: "enter",    16: "shift",
			17: "ctrl",     18: "alt",       27: "esc",      32: "space",
			33: "pageup",   34: "pagedown",  35: "end",      36: "home",
			37: "left",     38: "up",        39: "right",    40: "down",
			45: "insert",   46: "delete",   186: ";",       187: "=",
			188: ",",      189: "-",        190: ".",       191: "/",
			219: "[",      220: "\\",       221: "]",       222: "'"
		}
	}
};

