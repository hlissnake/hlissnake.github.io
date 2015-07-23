KISSY.add('vr/cube', function(S, D, E, Touch, Orientation){

	var $ = D.get;

	var preload_prefix = '_100x100';

    var prefix = S.UA.webkit ? 'webkit' : S.UA.firefox ? 'Moz' : S.UA.opera ? 'O' : S.UA.ie ? 'ms' : '';
    // var prefix = '-' + jsVendor + '-';
    var prefixTransform = prefix + 'Transform';

	var TPL = '<div class="cube">\
					<div class="cube-container">\
						<div class="front"></div>\
						<div class="back"></div>\
						<div class="left"></div>\
						<div class="right"></div>\
						<div class="up"></div>\
						<div class="down"></div>\
					</div>\
				</div>';

	var Cube = function(options){

		var stage = options.el,
			perspective = options.fv,
			textures = options.textures,
			cubeWidth = stage.getBoundingClientRect().width;

		this._initialize(stage, perspective, textures, cubeWidth, options.type, options.alicdn_prefix);

		if(options.type == 'touch') {
			Touch.bindEvent(stage, this);
		} else {
			Orientation.bindEvent(stage, this);
		}
	}

	Cube.prototype = {

		_initialize : function(stage, perspective, image_list, cubeWidth, type, alicdn_prefix){

			this.scale = 1;
			this.cubeOrigin = cubeWidth/2;

			stage.innerHTML = TPL;
			this.el = stage;

			this.cube = D.get('.cube', stage);
			var cubeStyle = this.cube.style;
			this.cubeStyle = cubeStyle;

			this.cubeCtner = D.get('.cube-container', stage);

			if(alicdn_prefix) {

				var up = image_list.up.replace(alicdn_prefix, preload_prefix),
					down = image_list.down.replace(alicdn_prefix, preload_prefix),
					left = image_list.left.replace(alicdn_prefix, preload_prefix),
					right = image_list.right.replace(alicdn_prefix, preload_prefix),
					front = image_list.front.replace(alicdn_prefix, preload_prefix),
					back = image_list.back.replace(alicdn_prefix, preload_prefix);

				$('.up', stage).innerHTML = '<img src="' + up + '" width="100%" height="100%">';
				$('.down', stage).innerHTML = '<img src="' + down + '" width="100%" height="100%">';
				$('.left', stage).innerHTML = '<img src="' + left + '" width="100%" height="100%">';
				$('.right', stage).innerHTML = '<img src="' + right + '" width="100%" height="100%">';
				$('.front', stage).innerHTML = '<img src="' + front + '" width="100%" height="100%">';
				$('.back', stage).innerHTML = '<img src="' + back + '" width="100%" height="100%">';

				this.lazyload(stage, image_list);

			} else {

				$('.up', stage).innerHTML = '<img src="' + image_list.up + '" width="100%" height="100%">';
				$('.down', stage).innerHTML = '<img src="' + image_list.down + '" width="100%" height="100%">';
				$('.left', stage).innerHTML = '<img src="' + image_list.left + '" width="100%" height="100%">';
				$('.right', stage).innerHTML = '<img src="' + image_list.right + '" width="100%" height="100%">';
				$('.front', stage).innerHTML = '<img src="' + image_list.front + '" width="100%" height="100%">';
				$('.back', stage).innerHTML = '<img src="' + image_list.back + '" width="100%" height="100%">';
				
			}

			stage.style[prefix + 'Perspective'] = perspective + 'px';
			stage.style[prefix + 'TransformStyle'] = 'preserve-3d';
			
			cubeStyle.position = 'absolute';
			cubeStyle.left = '50%';
			cubeStyle.top = '50%';
			cubeStyle.margin = '-' + cubeWidth/2 + 'px 0 0 -' + cubeWidth/2 + 'px';
			cubeStyle.width = cubeWidth + 'px';
			cubeStyle.height = cubeWidth + 'px';
			cubeStyle[prefix + 'TransformStyle'] = 'preserve-3d';
			cubeStyle[prefixTransform] = 'translateZ(' + cubeWidth/2 + 'px)';

			this.cubeCtner.style[prefix + 'TransformStyle'] = 'preserve-3d';
			if(type == 'touch') {
				this.cubeCtner.style[prefixTransform] = 'rotateX(90deg)';
			}

			$('.up', stage).style[prefixTransform] = 'rotateZ(180deg) rotateY(180deg) translateZ(-' + (cubeWidth/2-1) + 'px)';
			$('.down', stage).style[prefixTransform] = 'translateZ(-' + (cubeWidth/2-1) + 'px)';
			$('.left', stage).style[prefixTransform] = 'rotateY(90deg) rotateZ(-90deg) translateZ(-' + (cubeWidth/2-1) + 'px)';
			$('.right', stage).style[prefixTransform] = 'rotateY(-90deg) rotateZ(90deg) translateZ(-' + (cubeWidth/2-1) + 'px)';
			$('.front', stage).style[prefixTransform] = 'rotateX(-90deg) translateZ(-' + (cubeWidth/2-1) + 'px)';
			$('.back', stage).style[prefixTransform] = 'rotateX(90deg) rotateZ(180deg) translateZ(-' + (cubeWidth/2-1) + 'px)';
		},

		lazyload : function(stage, image_list){

			var imageUp = new Image();
			var imageDown = new Image();
			var imageLeft = new Image();
			var imageRight = new Image();
			var imageFront = new Image();
			var imageBack = new Image();

			imageUp.onload = function(){
				$('.up img', stage).src = image_list.up;
				imageUp = null;
			}
			imageUp.src = image_list.up;

			imageDown.onload = function(){
				$('.down img', stage).src = image_list.down;
				imageDown = null;
			}
			imageDown.src = image_list.down;
			
			imageLeft.onload = function(){
				$('.left img', stage).src = image_list.left;
				imageLeft = null;
			}
			imageLeft.src = image_list.left;
			
			imageRight.onload = function(){
				$('.right img', stage).src = image_list.right;
				imageRight = null;
			}
			imageRight.src = image_list.right;
			
			imageFront.onload = function(){
				$('.front img', stage).src = image_list.front;
				imageFront = null;
			}
			imageFront.src = image_list.front;
			
			imageBack.onload = function(){
				$('.back img', stage).src = image_list.back;
				imageBack = null;
			}
			imageBack.src = image_list.back;
		},

		render : function(x, y, scale){
			if(scale > 2) scale = 2;
			if(scale < 0.7) scale = 0.7;
			this.cubeStyle[prefixTransform] = [ 'scale(', scale, ')',
											   'translateZ(', this.cubeOrigin, 'px) ',
											   'rotateX(', x, 'deg) ', 
											   'rotateY(', y,'deg) ',
											   'rotateZ(0)'].join('');
		},

		renderByOrientation : function(x, y, z, scale){
			if(scale > 2) scale = 2;
			if(scale < 0.7) scale = 0.7;
			this.cubeStyle[prefixTransform] = [ 'scale(', scale, ')',
											   'translateZ(', this.cubeOrigin, 'px) ',
											   'rotateY(', y, 'deg) ', 
											   'rotateX(', x,'deg) ',
											   'rotateZ(', z,'deg)'].join('');
		}

	}

	return Cube;

}, {
	requires : [
		'dom', 'event',
		'vr/touch',
		'vr/orientation'
	]
});