KISSY.add('vr/touch', function(S){
	var EVENT_START = S.UA.mobile ? 'touchstart' : 'mousedown',
		EVENT_MOVE = S.UA.mobile ? 'touchmove' : 'mousemove',
		EVENT_END = S.UA.mobile ? 'touchend' : 'mouseup';

	var Ticker = Hilo.Ticker;
	var Tween = Hilo.Tween;

	return {

		/**
		 * bind touch event to interact with the cube object
		 */
		bindEvent : function(el, instance){

			var me = instance,
				anim_tween,
				x_deg = 0, y_deg = 0,
				isMoving = false,
				identifier,
				render_scale = 1,
				touch_scale = 1,
				previous_touch_distance = 0,
				previous_diff = {
					x : 0, y : 0
				},
				previous_touch = {
					x : 0, y : 0
				};

			var ticker = new Ticker(50);
	    	ticker.addTick(Tween);

	    	if(!S.UA.mobile) {
				document.addEventListener( 'mousewheel', function(event){
					// WebKit
					if ( event.wheelDeltaY ) {
						render_scale -= event.wheelDeltaY * 0.005;
					// Opera / Explorer 9
					} else if ( event.wheelDelta ) {
						render_scale -= event.wheelDelta * 0.005;
					// Firefox
					} else if ( event.detail ) {
						render_scale += event.detail * 0.5;
					}
					me.render(x_deg, y_deg, render_scale);
				}, false );
	    	}

	    	// touch move
			el.addEventListener(EVENT_START, function(e){
				var target;
				if(S.UA.mobile) {
					var touches = e.touches;
					// one finger touched
					if(touches.length == 1) {
						target = touches[0];
						identifier = target.identifier;
					}
					// multi fingers touched
					else {
						var one = touches[0],
							two = touches[1];
						// initial distance between two fingers
						previous_touch_distance = Math.sqrt(Math.pow((two.pageX - one.pageX), 2),
														Math.pow((two.pageX - one.pageX), 2));
						return false;
					}
				} else {
					isMoving = true;
					target = e;
				}
				// initial touches coordinations
				previous_touch.x = target.pageX;
				previous_touch.y = target.pageY;

				previous_diff.x = 0;
				previous_diff.y = 0;

				anim_tween && anim_tween.stop();
			});

			el.addEventListener(EVENT_END, function(e){
				if(!S.UA.mobile) {
					isMoving = false;
				}

				touch_scale = render_scale;

				var diff_x = previous_diff.x,
					diff_y = previous_diff.y,
					velocityVector = {
						x : diff_y/4,
						y : diff_x/4
					};

				// create a tween animation according to the velocity that process by the previous diff distance
				anim_tween = Tween.to(velocityVector, {
	                x:0,
	                y:0
	            }, {
	                duration : 700,
	                onComplete : function(){
	                	ticker.stop();
	                },
	                onUpdate : function(){

	                	x_deg += velocityVector.x;
	                	y_deg -= velocityVector.y;

						if(x_deg > 70) x_deg = 70;
						if(x_deg < -70) x_deg = -70;

						me.render(x_deg, y_deg, render_scale);
	                }
	            });
				ticker.start(true);
	        });

			el.addEventListener(EVENT_MOVE, function(e){

				e.preventDefault();

				if(!S.UA.mobile && !isMoving) return false;

  				var touches = e.touches,
  					target,
					diff_x,
					diff_y;

				if(S.UA.mobile) {
					// only select the first touch event object during the multi touches
					for(var i = 0, len = touches.length; i < len; i++) {
						if(touches[i].identifier === identifier) {
							target = touches[i];
							break;
						}
					}
					// when trigger by multi touches,
					// calculate the scale ratio by current distance between touches
					if(touches.length > 1 && touches.length < 3) {
						var one = touches[0],
							two = touches[1],
							touch_distance = Math.sqrt(Math.pow((two.pageX - one.pageX), 2),
															Math.pow((two.pageX - one.pageX), 2));

						var scale = touch_distance / previous_touch_distance * touch_scale; //console.log(e.scale);
						if(scale > 2.5) scale = 2.5;
						if(scale < 0.7) scale = 0.7;
						render_scale = scale;

						me.render(x_deg, y_deg, render_scale);
						return false;
					}
					// target = touches[0];
				} else {
					target = e;
				}

				// calculate the diff distance between current touch and previous
				diff_x = target.pageX - previous_touch.x,
				diff_y = target.pageY - previous_touch.y;

				previous_touch.x = target.pageX;
				previous_touch.y = target.pageY;

				previous_diff.x = diff_x;
				previous_diff.y = diff_y;

				y_deg -= diff_x/5;
				x_deg += diff_y/5;
				if(x_deg > 70) x_deg = 70;
				if(x_deg < -70) x_deg = -70;

				me.render(x_deg, y_deg, render_scale);
			});

		}
	}
})