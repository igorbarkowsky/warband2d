export var Event = {

	/**
	 * Подписка на событие
	 * Использование:
	 *  menu.on('select', function(item) { ... }
	 */
	on: function(eventName, handler) {
		if (!this._eventHandlers) this._eventHandlers = {};
		if (!this._eventHandlers[eventName]) {
			this._eventHandlers[eventName] = [];
		}
		this._eventHandlers[eventName].push(handler);
	},

	/**
	 * Прекращение подписки
	 *  menu.off('select',  handler)
	 */
	off: function(eventName, handler) {
		var handlers = this._eventHandlers && this._eventHandlers[eventName];
		if (!handlers) return;
		for(var i=0; i<handlers.length; i++) {
			if (handlers[i] == handler) {
				handlers.splice(i--, 1);
			}
		}
	},

	/**
	 * Генерация события с передачей данных
	 *  this.trigger('select', item);
	 */
	trigger: function(eventName /*, ... */) {
		console.log(eventName);
		console.log(this._eventHandlers);
		if (!this._eventHandlers || !this._eventHandlers[eventName]) {
			return; // обработчиков для события нет
		}

		// вызвать обработчики
		var handlers = this._eventHandlers[eventName];
		for (var i = 0; i < handlers.length; i++) {
			handlers[i].apply(this, [].slice.call(arguments, 1));
		}

	}
};

export function Events(target){
	var events = {}, empty = [];
	target = target || this
	/**
	 *  On: listen to events
	 */
	target.on = function(type, func, ctx){
		(events[type] = events[type] || []).push([func, ctx])
		return target
	}
	/**
	 *  Off: stop listening to event / specific callback
	 */
	target.off = function(type, func){
		type || (events = {})
		var list = events[type] || empty,
				i = list.length = func ? list.length : 0;
		while(i--) func == list[i][0] && list.splice(i,1)
		return target
	}
	/** 
	 * Emit: send event, callbacks will be triggered
	 */
	target.trigger = function(type){
		var e = events[type] || empty, list = e.length > 0 ? e.slice(0, e.length) : e, i=0, j;
		while(j=list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1))
		return target
	};

	return target;
};