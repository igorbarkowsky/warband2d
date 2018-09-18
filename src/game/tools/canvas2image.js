
export default class Canvas2Image {
	constructor () {

		// check if support sth.
		let $support = function () {
			const canvas = document.createElement('canvas');
			let ctx = canvas.getContext('2d');

			return {
				canvas: !!ctx,
				imageData: !!ctx.getImageData,
				dataURL: !!canvas.toDataURL,
				btoa: !!window.btoa
			};
		}();

		const downloadMime = 'image/octet-stream';

		function scaleCanvas(canvas, width = undefined, height = undefined) {
			const w = canvas.width,
				h = canvas.height;
			if (width === undefined) {
				width = w;
			}
			if (height === undefined) {
				height = h;
			}

			const retCanvas = document.createElement('canvas');
			const retCtx = retCanvas.getContext('2d');
			retCanvas.width = width;
			retCanvas.height = height;
			retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
			return retCanvas;
		}

		function getDataURL(canvas, type, width = undefined, height = undefined) {
			canvas = scaleCanvas(canvas, width, height);
			return canvas.toDataURL(type);
		}

		function saveFile(strData) {
			document.location.href = strData;
		}

		function genImage(strData) {
			const img = document.createElement('img');
			img.src = strData;
			return img;
		}

		function fixType(type) {
			type = type.toLowerCase().replace(/jpg/i, 'jpeg');
			const r = type.match(/png|jpeg|gif/)[0];
			return 'image/' + r;
		}


		/**
		 * saveAsImage
		 * @param {String|Object} canvas - Id or DomElement object
		 * @param {String} [type] - output image type
		 * @param {Number} [width] - output image width
		 * @param {Number} [height] - output image height
		 */
		const saveAsImage = function (canvas, type = undefined, width = undefined, height = undefined) {
			if ($support.canvas && $support.dataURL) {
				if (typeof canvas === "string") {
					canvas = document.getElementById(canvas);
				}
				if (type === undefined) {
					type = 'png';
				}
				type = fixType(type);
				const strData = getDataURL(canvas, type, width, height);
				saveFile(strData.replace(type, downloadMime));
			}
		};

		const convertToImage = function (canvas, type = undefined, width = undefined, height = undefined) {
			if ($support.canvas && $support.dataURL) {
				if (typeof canvas === "string") {
					canvas = document.getElementById(canvas);
				}
				if (type === undefined) {
					type = 'png';
				}
				type = fixType(type);

				const strData = getDataURL(canvas, type, width, height);
				return genImage(strData);
			}
		};

		// Public methods
		return {
			saveAsImage: saveAsImage,
			saveAsPNG: function (canvas, width, height) {
				return saveAsImage(canvas, 'png', width, height);
			},
			saveAsJPEG: function (canvas, width, height) {
				return saveAsImage(canvas, 'jpeg', width, height);
			},
			saveAsGIF: function (canvas, width, height) {
				return saveAsImage(canvas, 'gif', width, height);
			},

			convertToImage: convertToImage,
			convertToPNG: function (canvas, width, height) {
				return convertToImage(canvas, 'png', width, height);
			},
			convertToJPEG: function (canvas, width, height) {
				return convertToImage(canvas, 'jpeg', width, height);
			},
			convertToGIF: function (canvas, width, height) {
				return convertToImage(canvas, 'gif', width, height);
			}
		};
	}
}
