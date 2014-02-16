define(function(require, exports, module){
// MC = window.MC || {};

// MC.CObject = (function(MC, _){

	var Observer = require('./observer')
	;

	var _COMEvents = ',touchend,touchmove,touchstart,click,mousemove,'
	,	_COMCustomEvents = ',tap,pinch,swipe,rotate,hold,'
	;

	if(window.location.search.indexOf('_debug_') > -1) {
		window['_DEBUG_'] = true;
	}

	var COMObject = Observer.extend({

		x : 0,
		y : 0,
		width : 0,
		height : 0,
		rotate : 0,
		scaleX : 1,
		scaleY : 1,
		//transform : [1,0,0,1,0,0],
		fillColor : 'rgba(0,0,0,1)',
		lineWidth : 0,
		opacity : 1,
		visible : true,
		zIndex : 0,
		// shape : [],
		// painter : [],
		behaviors : [],
		ev_map : {},

		initialize : function(options){
			if(options.getContext) {
				this.canvas = options;
				this.context = this.canvas.getContext('2d');
				this.x = this.y = 0;
				this.width = this.canvas.width;
				this.height = this.canvas.height;
				this.type = 'stage';
			} else {
				for (var k in options) {
					if( options[k] === undefined ) continue;
					this[k] = options[k];
				}
				if(options.backgroundImage) {
					this.backgroundImageWidth = options.backgroundImage.width;
					this.backgroundImageHeight = options.backgroundImage.height;
				}
			}
		},

		append : function(com){
			this.children = this.children || [];
			if(com) {
				com.context = this.context;
				com.stage = this.type == 'stage' ? this : this.stage;
				this.children.push(com);

				// sort children array by zIndex
				this.children.sort(function(a, b){
					return a.zIndex - b.zIndex;
				});
			}
		},

		clear : function(dirty, context){
			var context = context || this.context;
			if(!context) {
				throw "no canvas context for this COM-Object";
				return;
			}
			context.clearRect(this.x + this.lineWidth, this.y + this.lineWidth, this.width + 2 * this.lineWidth, this.height + 2* this.lineWidth);
		},

		render : function(dt, context){
			var context = context || this.context;
			if(!context) {
				throw "no canvas context for this COM-Object";
				return;
			}

			this.fire('render:before', dt);

			context.save();

			this._setGraphicStyle(context);

			context.beginPath();
			this._createPath(context);
			context.closePath();

			this._draw(dt, context);
			this._renderChildren(dt, context);

			context.restore();	

			this.fire('render:after', dt);
		},

		_renderChildren : function(dt, context){
			if(this.children) {
				context.translate(this.x, this.y);

				var childCom
				,	children = this.children
				,	len = children.length
				;
				for( var i = 0; i < len; i++ ) {
					childCom = children[i];
					childCom.render(dt, context);
				}
			}
		},

		_setGraphicStyle : function(context){
			var translateX = this.x + this.width / 2
			,	translateY = this.y + this.height / 2
			;

			if(this.transform) {
				context.setTransform(this.transform);
			} else {
				// all transform effect accrodding to com's center croodination
				context.translate(translateX, translateY);

				this.rotate && context.rotate( this.rotate * Math.PI/180);

				if(this.scaleX || this.scaleY) {
					context.scale(this.scaleX, this.scaleY);
				}
				if(this.skewX || this.skewY){
					context.transform(1, Math.tan(this.skewY * Math.PI / 180), Math.tan(this.skewX * Math.PI / 180), 1, 0, 0);
				}
				context.translate( -translateX, -translateY);
			}
			context.globalAlpha = this.opacity;
			context.fillStyle = this.fillColor;
			if (this.strokeColor) context.strokeStyle = this.strokeColor;
			if (this.lineWidth) context.lineWidth = this.lineWidth;
		},

		_createPath : function(context){
			if(this.shape) {
				this.shape.draw(this, context);
			}
		},

		_draw : function(dt, context){
			if(!this.visible) return false;
			if (this.painter) {
				this.painter.draw(this, context, dt);
			} else {
				if(this.fillColor) context.fill();
				if(this.strokeColor) context.stroke();
			}
			if( window['_DEBUG_'] ) {
				context.strokeStyle = 'rgba(1,1,1,0.6)'
				context.lineWidth = 2;
				context.stroke();
			}
			if(this.behaviors.length) {
				var behavior
				,	behaviors = this.behaviors
				,	len = behaviors.length
				;
				for( var i = 0; i < len; i++ ) {
					behavior = behaviors[i];
					behavior.execute(this, context, dt);
				}
			}
		},

		/**
		 * for html events or observer events
		 * only listen to trigger com's events. not include children target com in event object
		 * this can aviod the findTarget function recursion to improve the performance
		 */
		on : function(ev, callback){
			var me = this;
			if( _COMEvents.indexOf(',' + ev + ',') > -1) {
				var stage = this.type == 'stage' ? this : this.stage;
				stage._addEventListener(ev, me, function(e){
					callback && callback.call(me, e);			
				}, true);
			} else if ( _COMCustomEvents.indexOf(',' + ev + ',') > -1) {

			} else {
				me.supr(ev, callback);
			}
			return me;
		},

		/**
		 * for html events only, not observer events
		 * delegate the children coms event. include the target children com in event object
		 */
		delegate : function(ev, comId, callback){
			var me = this;
			if( _COMEvents.indexOf(',' + ev + ',') > -1) {
				var stage = this.type == 'stage' ? this : this.stage;
				stage._addEventListener(ev, me, function(e){
					// only match com of the prvoided id, can trigger the event callback
					if(e.targetCom.id && e.targetCom.id == comId) {
						callback && callback.call(me, e);
					}
				});
			}
			return me;
		},

		_addEventListener : function(ev, trigger, callback, listenSelf){
			var ev_map = this.ev_map
			,	me = this
			;
			if( !ev_map[ev] ) {
				ev_map[ev] = [];
				me.canvas.addEventListener(ev, function(e){
					me._eventTrigger(e || window.event);
				})
			}
			ev_map[ev].push({
				t : trigger,
				fn : callback,
				listenSelf : listenSelf
			});	
		},

		_eventTrigger : function(e){
			var canvasOffset = this.canvas.getBoundingClientRect()
			,	canvas = this.canvas
			,	coordinate = {}
			,	eventType = e.type
			,	pageX
			,	pageY
			;
			if(eventType.match(/touch/)){
				var touch = e.touches.length ? e.touches[0] : e.changedTouches[0];
				pageX = touch.pageX;
				pageY = touch.pageY;
			} else {
				pageX = e.pageX;
				pageY = e.pageY;
			}
			coordinate = {
				x : pageX - canvasOffset.left * (canvas.width / canvasOffset.width),
				y : pageY - canvasOffset.top * (canvas.height / canvasOffset.height)
			}

			var callbackList = this.ev_map[eventType];

			for(var i = 0; i < callbackList.length; i++) {
				var cb = callbackList[i]
				,	trigger = cb.t
				,	target = trigger._findTarget(coordinate, cb.listenSelf)
				;
				if(target) {
					e.targetCom = target;
					cb.fn.call(trigger, e);
					continue;
				}			
			}
		},

		_findTarget : function(coord, listenSelf){
			var me = this
			,	context = me.context
			,	inPath
			,	target
			;
			function find(com, ctx){
				var result = true;

				if(com.type == 'stage') {
					inPath = true;
				} else {
					ctx.save();
					com._setGraphicStyle(ctx);
					ctx.beginPath();
					com._createPath(ctx);
					ctx.closePath();
					inPath = ctx.isPointInPath(coord.x, coord.y);
				}
				
				if(inPath) {
					target = com;
					// only listen com self, no need to find children target, quit the function recursion
					if(listenSelf) {
						result = true;
					} else if(com.children) {
						var children = com.children;
						ctx.translate(com.x, com.y);

						for(var i = children.length - 1; i >= 0; i--) {
							if( children[i].visible && find(children[i], ctx) ) {
								// target = result;
								result = true;
								break;
							} else {
								result = false;
							}
						}
					}
				} else {
					result = false;
				}
				ctx.restore();

				return result;
			}

			find(me, context);

			return target;
		}

	});

	COMObject.Shape = {

		Rect : {				
			draw : function(com, ctx){
				ctx.rect(com.x, com.y, com.width, com.height);
			}
		},

		Circle : {				
			draw : function(com, ctx){
				var centerX = com.x + com.width / 2
				,	centerY = com.y + com.height / 2
				,	radius = com.width / 2
				; 
				ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
				ctx.clip();
			}
		}
	}

	COMObject.Painter = {
		Bitmap : {
			draw : function(com, ctx, dt){
				var img = com.backgroundImage;
				if( com.backgroundRepeatX ) {
					var w = com.backgroundImageWidth
					,	h = com.backgroundImageHeight
					,	cw = com.height / h * w
					,	positionX = com.imagePositionX || 0
					,	repeatNum = Math.ceil(com.width / cw) + 1
					;
					if (!com.maxPositionX) com.maxPositionX = cw;
					for(var i = 0; i < repeatNum; i++) {
						ctx.drawImage(img, 0, 0, w, h, com.x + i * cw - positionX, com.y, cw, com.height);
					}
				} else {
					ctx.drawImage(img, 0, 0, img.width, img.height, com.x, com.y, com.width, com.height)
				}
			}
		}
	}

	return COMObject;

})//(MC)