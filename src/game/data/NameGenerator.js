import Names from './names.js';
import Lastnames from './lastnames.js';

export class NameGenerator {
	constructor() {
	}

	capFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	generateName() {
		let firstNames = this.getFirstNames();
		let firstName = firstNames[this.getRandomInt(0, firstNames.length + 1)];

		let lastNames = this.getLastNames();
		let lastName = lastNames[this.getRandomInt(0, lastNames.length + 1)];

		let name = this.capFirst(firstName) + ' ' + this.capFirst(lastName);
		return name;
	}

	getFirstNames() {
		return Names;
	}

	getLastNames() {
		return Lastnames;
	}
}
