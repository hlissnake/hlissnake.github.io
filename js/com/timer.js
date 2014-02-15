define(function(require, exports, module){

	var Observer = require('./observer');

	var RAF = 
		requestAnimationFrame || 
		webkitRequestAnimationFrame || 
		function(callback){
			setTimeout(callback, 1000 / 60);
		};

	var Timer = Observer.extend({

		_loop : function(){
			if ( !this._run ) return false;
			var me = this
			,	now = (+new Date)
			,	lastTime = me.lastTime
			;
			RAF(function(){
				me._loop();
			});
			me.fire('run', (now - lastTime) / 1000)
			me.lastTime = now;
		},

		start : function(){
			this._run = true;
			this.lastTime = (+new Date);
			this._loop();

			return this;
		},

		stop : function(){
			this._run = false;

			return this;
		}

	});

	return Timer;

})//(MC, _, MC["CObject"])