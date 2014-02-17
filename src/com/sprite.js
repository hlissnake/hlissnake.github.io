define(function(require, exports, module){

	var Com = require('./com')

	var Sprite = Com.extend({

		framerate : 0,

		initialize : function(options){
			this.supr(options);
			this.callbackList = [];
			this.frameLoop = 0;
			if(this.autoPlay) {
				this.play(this.firstAnim);
			}
		},

		_draw : function(dt, ctx){
			this.supr(dt, ctx);
			if(this.painter && this._animPlay && !this.isOver) {
				
				if(this.frameLoop < this.framerate) {
					this.frameLoop++;
				} else {
					this.frameLoop = 0;
					this.isOver = this.painter.advance();
					if(this.isOver && this.callbackList.length) {
						this.callbackList[0]();
					}
				}
			}
		},

		play : function(animName, callback){
			if (!this.painter) return;
			var me = this
			,	name = animName ? animName : this.firstAnim
			;
			me._animPlay = true;
			me.isOver = false;
			me.painter.playAnim(name);
			if(callback) {
				this.callbackList.push(function(){
					callback.call(me);
					me.callbackList.shift();
					//me.painter.off('anim:complete', arguments.callee);
				});
			}
		},

		stop : function(){
			this._animPlay = false;
		}

	});


	return Sprite;

});