define(function(require, exports, module){

	var Observer = require('./observer');

	var SpriteSheet = Observer.extend({

		frameIndex : 0,

		initialize : function(options){
			for (var k in options) {
				if( options[k] === undefined ) continue;
				this[k] = options[k];
			}

			// buffer.width = this.image.width;
			// buffer.height = this.image.height;	
			// var ctx = buffer.getContext('2d')
			// ctx.drawImage(this.image, 0, 0);
			// this.buffer = buffer;

			if(this.frameData && !this.frames) {

				var frameData = this.frameData
				,	fh = frameData.frameHeight
				,	fw = frameData.frameWidth
				,	ih = frameData.imgHeight
				,	iw = frameData.imgWidth
				, 	num = frameData.frameNum
				;
				var frames = []
				,	fCol = Math.floor(iw / fw)
				,	fRow = Math.floor(ih / fh)
				,	i
				,	j = 0
				;
				for( ; j < fRow; j++) {
					for( i = 0; i < fCol; i++) {					
						var fd = [];
						fd.push(i * fw);
						fd.push(j * fh);
						fd.push(fw);
						fd.push(fh);

						frames.push(fd);//[i * fCol + j] = fd;
						if( j * fCol + i + 1 >= num ) break; 
					}
					if( j * fCol + i + 1 >= num ) break;
				}
				this.frames = frames;
			}

			if(this.animations) {
				for(var id in this.animations) {
					this.firstAnim = id;
					break;
				}
			} else {
				this.maxFrame = this.frames.length - 1;
				this.minFrame = 0;
				this.loop = false;
			}
		},

		advance : function(){
			var animOver = false;
			if(this.frameIndex < this.maxFrame) {
				this.frameIndex++;
			} else {
				this.frameIndex = this.minFrame;
				animOver = true;
				if(this._loop) {
					animOver = false;
				// } else {
				// 	this.fire('anim:complete');
				}
			}
			return animOver;
		},

		playAnim : function(name){
			var me = this
			,	animName = name ? name : this.firstAnim
			;
			if(this.animations) {
				var config = this.animations[animName];
				this.minFrame = config.start;
				this.maxFrame = config.end;
				this.frameIndex =config.start;
				this._loop = config.loop ? true : false;
			}
		},

		draw : function(com, ctx, dt){
			var frame = this.frames[this.frameIndex]
			,	sx = frame[0]
			,	sy = frame[1]
			,	swidth = frame[2]
			,	sheight = frame[3]
			;
			ctx.drawImage(this.image, sx, sy, swidth, sheight, com.x, com.y, com.width, com.height);
		}

	});

	return SpriteSheet;

})