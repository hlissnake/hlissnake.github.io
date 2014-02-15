define(function(require, exports, module){

	var Class = require('./class');

	var Observer = Class({

		on : function(eventType, callback, context){
			this._events = this._events || {};
			if(!this._events[eventType]) {
				this._events[eventType] = [];
			}
			this._events[eventType].push({
				fn : callback,
				ctx : context
			})
			return this;
		},

		fire : function(eventType){
			this._events = this._events || {};

			var evs = this._events[eventType]
			,	params = Array.prototype.slice.call(arguments, 1)
			,	event
			;
			if(evs && evs.length) {
				for (var i = 0; i < evs.length; i++) {
					event = evs[i];
					// try{
						event["fn"].apply(event["ctx"] || this, params);
					// } catch(e) {
					// 	continue;
					// }
				}
			}
			return this;
		},

		off : function(eventType, callback){
			this._events = this._events || {};
			if(!callback) {
				delete this._events[eventType]
			} else {
				for (var i = 0; i < this._events[eventType].length; i ++) {
                    if (callback == this._events[eventType][i]) {
                        this._events[eventType].splice(i, 1);
                        break;
                    }
                }
			}
			return this;
		}

	});

	return Observer;
})