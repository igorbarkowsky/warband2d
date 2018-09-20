"use strict";

function mixin (targetClass, mixinObject) {
	for( let mixinMethod in mixinObject ) targetClass.prototype[mixinMethod] = mixinObject[mixinMethod];
}

function sum(arr) {
	return arr.reduce((sum, x) => sum + x, 0);
}

function objectMaxKey (obj) {
	return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
}

var GameUtils = {
	argDefaulter: function (defaultArgs, functionArgs){

	}
}

function getFileExtension (filename) {
	return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

export {mixin, objectMaxKey, getFileExtension};