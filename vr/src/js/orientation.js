KISSY.add('vr/orientation', function(S){

	var Ticker = Hilo.Ticker;
	var Tween = Hilo.Tween;
	var threshold = 1;

	function calculateRotate3d(alpha, gamma, beta){
		var orientation,
			o = window.orientation || 0;
        if (o == 90) {
            orientation = [ -gamma, beta, alpha-90];
        }
        else if (o == -90) {  //横屏
            orientation = [ gamma, beta, alpha+90];
        }
        else if (o == 0) {  //竖屏
            orientation = [ beta, -gamma, alpha];
        }
		return orientation;
	}

	return {

		/**
		 * [bind touch event to interact with the cube object]
		 * @param  {[type]}
		 * @param  {[type]}
		 * @param  {[type]}
		 * @return {[type]}
		 */
		bindEvent : function(el, instance, anim_open){

			var that = instance,
				ticker,
				now, lastTime = 0,
				TweenDuration = 200,
				render_scale = 1,
				touch_scale = 1,
				xAngle = 0, yAngle = 0, zAngle = 0,
				angleVector = {
					x : 0, y : 0, z : 0
				};

			// var ticker = new Ticker(50);
	  //   	ticker.addTick(Tween);
			// ticker.start(true);

			if(anim_open) {
				ticker = new Ticker(50);
		    	ticker.addTick(Tween);
				ticker.start(true);
			}

			el.addEventListener('touchmove', function(e){
				e.preventDefault();
			});

			el.addEventListener('gestureend', function(e){
				touch_scale = render_scale;
			});

			el.addEventListener('gesturechange', function(e){
				var scale = e.scale * touch_scale; //console.log(e.scale);
				render_scale = scale;
				that.renderByOrientation(xAngle, yAngle, zAngle, render_scale);
			});

			window.ondeviceorientation = function(e){
				if ((Math.abs(e.beta - xAngle) > threshold) ||
				(Math.abs(-e.gamma - yAngle) > threshold) ||
				(Math.abs(e.alpha - zAngle) > threshold)) {
					xAngle = e.beta||0; //Math.floor(e.beta)||0;
					yAngle = -e.gamma||0; //Math.floor(-e.gamma)||0;
					zAngle = e.alpha||0; //Math.floor(e.alpha)||0;

					if(anim_open) {
				        now = +new Date;
						// 使得陀螺仪每隔一定时间才作用一次，所有的对象做 
						if( (now - lastTime) > TweenDuration || lastTime == 0 ) {
							lastTime = now;
							Tween.to(angleVector, {
				                x:xAngle,
				                y:yAngle,
				                z:zAngle
				            }, {
				                duration : TweenDuration,
				                onComplete : function(){
				                	angleVector = {
										x : xAngle, 
										y : yAngle, 
										z : zAngle
									};
				                },
				                onUpdate : function(){
									that.renderByOrientation(angleVector.x, angleVector.y, angleVector.z);
				                }
				            });
				        }
					} else {	
						that.renderByOrientation(xAngle, yAngle, zAngle, render_scale);
					}
				}
		    }

		}
	}
})