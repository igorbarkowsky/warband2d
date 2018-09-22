import InputDesktop from './InputDesktop.js';
import InputJoystick from './InputJoystick.js';

export default class Input {

	constructor () {}

	// Register all possible events from input devices and translate it to target classes
	static enable (renderer) {
		renderer.domElement.addEventListener("mousemove", InputDesktop.onMouseMove, true);
		renderer.domElement.addEventListener("mousedown", InputDesktop.onMouseDown, true);
		renderer.domElement.addEventListener("mouseup", InputDesktop.onMouseUp, true);
		document.addEventListener("keydown",  InputDesktop.onKeyDown, true);
		document.addEventListener("keypress",  InputDesktop.onKeyPress, true);
		document.addEventListener("keyup",  InputDesktop.onKeyUp, true);
	}

	static disable (renderer) {
		renderer.domElement.removeEventListener("mousemove", InputDesktop.onMouseMove, true);
		renderer.domElement.removeEventListener("mousedown", InputDesktop.onMouseDown, true);
		renderer.domElement.removeEventListener("mouseup", InputDesktop.onMouseUp, true);
		document.removeEventListener("keydown",  InputDesktop.onKeyDown, true);
		document.removeEventListener("keypress",  InputDesktop.onKeyPress, true);
		document.removeEventListener("keyup",  InputDesktop.onKeyUp, true);
	}

}