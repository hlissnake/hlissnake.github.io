define(function(require, exports, module){
	var Com = require('com/com')
	, 	Timer = require('com/timer')
	, 	Sprite = require('com/sprite')
	, 	SpriteSheet = require('com/spriteSheet')
	, 	Loader = require('com/loader')
	;

	var assetsMap = {
		'runner' : './image/runner.png',
		'hill' : './image/hill.png',
		'sky' : './image/bg.png',
		'blood' : './image/blood.png',
		'ground' : './image/ground.png',
		'start' : './image/start.png',
		'over' : './image/over.png',
		'arrow' : './image/arrow.png'
	};

	var GRAVITY_FORCE = 9.81,
		JUMP_HEIGHT_METERS = 2,
		pixPerMeter = 50,
		moveSensitivity = 2000,
		jumpVelocityPerSecond = 60 / 1, 
		jumpHeightPix = 60;
		
	var runnerVelocity = 100
	,	grundVelocity = 100
	,	hillVelocity = 60
	,	skyVelocity = 20
	,	rockRadius = 40 * Math.random() + 30
	,	rockVelocity = 70
	,	rockRotateVelocity = 360 / (Math.PI * rockRadius / 70);
	;

	var gameoverAixsY = 80;

	var runner, rock;

	return {

		score : 0,

		calculateAccelerate : function(accelerationX, dt, com){
            var translateX = accelerationX * dt * dt * moveSensitivity;
            com.x += translateX;
            if(com.x < 0) {
            	com.x = 0;
            } else if (com.x > this.stage.width - com.width) {
            	com.x = this.stage.width - com.width;
            }
            if(Math.abs(translateX) > 1 && !this.Jumping) {
            	com.framerate = 0;
            } else {
            	com.framerate = 1;
            }
            if(translateX >= 0) {
            	com.scaleX = 1;
            } else {
            	com.scaleX = -1;
            }
		},

		hitTestCircle : function(comA, comB){
			var centerA = {
					x : comA.x + comA.width / 2,
					y : comA.y + comA.height / 2,
					r : comA.width / 2
				}
			,	centerB = {
					x : comB.x + comB.width / 2,
					y : comB.y + comB.height / 2,
					r : comB.width / 2
				}
			,	distance = Math.sqrt(Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2))
			;
			return distance < centerA.r + centerB.r;
		},

		hitTestArrow : function(com, arrows){
			var circle = {
					x : com.x + com.width / 2,
					y : com.y + com.height / 2,
					r : com.width / 2
				}
			,	result
			;
			for(var i = 0; i < arrows.length; i++) {
				var arrow = arrows[i]
				,	point = {
						x : arrow.x + arrow.width / 2 - arrow.tan * (arrow.height / 2),
						y : arrow.y + arrow.height
					}
				,	distance = Math.sqrt(Math.pow(circle.x - point.x, 2) + Math.pow(circle.y - point.y, 2))
				;
				if(distance < circle.r) {
					return true;
				}
			}
			return false;

		},

		gameStart : function(){
			var Game = this;
			Game.gamePlaying = true;
			if(rock) {
				runner.x = 0;
				runner.y = Game.stage.height - 60 - 90;
				runner.die = false;
				runner.play('run');
				runner.visible = true;
				rock.x = -rock.width;
			} else {;
				rock = new Com({
					x : Game.stage.width,
					y : Game.stage.height - 60 - rockRadius,
					width : rockRadius,
					height : rockRadius,
					backgroundImage : Game.loader.get('ground'),
					// behaviors : [ jumpBehavior ],
					shape : Com.Shape.Circle,
					painter : Com.Painter.Bitmap
				}).on('render:before', function(dt){
					if( this.x < -this.width) {
						this.x = Game.stage.width + 250 * Math.random();
						var w = 40 * Math.random() + 30;
						this.width = w;
						this.height = w;
						this.y = Game.stage.height - 60 - w;
						rockRotateVelocity = 360 / (Math.PI * w / rockVelocity);
					} else {
						this.x -= (rockVelocity + grundVelocity) * dt;
					}
					this.rotate -= rockRotateVelocity * dt;
				});

				Game.stage.append(rock);
			}
		},

		init : function(){

			var Game = this;

			var canvas = document.getElementById('canvas');
			canvas.width = document.body.getBoundingClientRect().width;
			canvas.height = document.body.getBoundingClientRect().height;	

			var loader = new Loader(assetsMap)
			,	stage = new Com(canvas)
			;
			Game.stage = stage;
			Game.loader = loader;

			loader.on('complete', function(status, img){

				var loading = document.getElementById('loading');
				loading.style.display = 'none';


				var jumpBehavior = {

					over : true,

					jump : function(com, callback){
						// this._actionStart = true;

						var me = this
						,	originHeight = com.y
						;
						if(!me.over || com.die) {
							return;
						}
						var	jump = new TWEEN.Tween( { y : originHeight } )
						    .to( { y : originHeight - 50 }, 600 )
						    // .repeat( Infinity )
						    // .delay( delayTime )
						    .easing( TWEEN.Easing.Quintic.Out)
						    .onUpdate( function () {
						        com.y = this.y;
						    });
								
						var	fall = new TWEEN.Tween( { y : originHeight - 50 } )
						    .to( { y : originHeight }, 600 )
						    // .repeat( Infinity )
						    // .delay( delayTime )
						    .easing( TWEEN.Easing.Quartic.In)
						    .onUpdate( function () {
						        com.y = this.y;
						        if(com.y == originHeight) {
						        	me.over = true;
						        }
						    });

						jump.chain(fall).start();
						me.over = false;
					}
				},
				dieBehavior = {

					over : true,

					die : function(com, callback){
						var me = this
						,	originHeight = com.y
						;
						if(!me.over) {
							return;
						}
						com.stop();
						var	up = new TWEEN.Tween( { y : originHeight } )
						    .to( { y : originHeight - 30 }, 500 )
						    // .repeat( Infinity )
						    // .delay( delayTime )
						    .easing( TWEEN.Easing.Quartic.Out)
						    .onUpdate( function () {
						        com.y = this.y;
						    });
						var	down = new TWEEN.Tween( { y : originHeight - 30 } )
						    .to( { y : stage.height }, 800 )
						    // .repeat( Infinity )
						    // .delay( delayTime )
						    .easing( TWEEN.Easing.Quartic.In)
						    .onUpdate( function () {
						        com.y = this.y;
						    })
						    .onComplete(function(){
					        	me.over = true;
					        	if(callback) callback.call(Game);
						    });
						up.chain(down).start();
						me.over = false;
					}
				};

				var sky = new Com({
						width : stage.width,
						height : stage.height - 60,
						backgroundImage : loader.get('sky'),
						imagePositionX : 0,
						backgroundRepeatX : true,
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					})

				,	ground = new Com({
						y : canvas.height - 60,
						width : canvas.width,
						height : 60,
						backgroundImage : loader.get('ground'),
						imagePositionX : 0,
						backgroundRepeatX : true,
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					})

				,	hill = new Com({
						x : canvas.width * Math.random(),
						y : canvas.height - 60 - 118,
						width : 564,
						height : 118,
						backgroundImage : loader.get('hill'),
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					})

				,	startBtn = new Com({
						id : 'start',
						x : stage.width / 2 - 110 / 2,
						y : 140,
						width : 110,
						height : 60,
						backgroundImage : loader.get('start'),
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					})

				,	over = new Com({
						id : 'gameover',
						x : stage.width / 2 - 198 / 2,
						y : - 50,
						width : 198,
						height : 50,
						visible : false,
						zIndex : 199,
						backgroundImage : loader.get('over'),
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					})

				,	score = new Com({
						id : 'score',
						x : stage.width / 2,
						y : 140 + 100,
						width : 60,
						height : 50,
						text : 0,
						fillColor : 'white',
						font : '30px Palatino',
						shape : Com.Shape.Rect,
						painter : Com.Painter.Text
					})

				,	arrows = []

				,	bloodSheetPainter = new SpriteSheet({
						image : Game.loader.get('blood'),
						frameData : {
							imgWidth : 450,
							imgHeight : 64,
							frameWidth : 64,
							frameHeight : 64,
							frameNum : 6
						},
					})

				,	blood = new Sprite({
						width : 50,
						height : 50,
						visible : false,
						framerate : 4,
						shape : Com.Shape.Rect,
						painter : bloodSheetPainter
					})

				,	spriteSheetPainter = new SpriteSheet({
						image : Game.loader.get('runner'),
						frameData : {
							imgWidth : 2048,
							imgHeight : 2048,
							frameWidth : 165,
							frameHeight : 292,
							frameNum : 64
						},
						animations : {
							run : {
								start : 0, 
								end : 25,
								loop : true
							},
							jump : {
								start : 26, 
								end : 63
							},
							stand : {
								start : 58, 
								end : 60,
								loop : true
							}
						}
					})
				;

				runner = new Sprite({
					x : 50,
					y : Game.stage.height - 60 - 90,
					width : 50,
					height : 90,
					zIndex : 10,
					shape : Com.Shape.Rect,
					painter : spriteSheetPainter,
					loop : true,
					autoPlay : true
				});

				stage.append(sky);
				stage.append(ground);
				stage.append(hill);
				stage.append(runner);
				stage.append(blood);
				stage.append(startBtn);
				stage.append(over);
				stage.append(score);

				function createArrow(){
					for( var i = 0; i < 2; i++) {
						var arrow = new Com({
							id : 'arrow',
							x : i * stage.width,
							y : -58,
							width : 13,
							height : 58,
							visible : false,
							velocityY : 0,
							backgroundImage : loader.get('arrow'),
							shape : Com.Shape.Rect,
							painter : Com.Painter.Bitmap
						});
						stage.append(arrow);
						arrows.push(arrow);
					}
				}
				createArrow();

				stage.delegate('touchstart', '',  function(e){
					if(e.targetCom.id == 'start') {
						return;
					}
					if (runner.die) return;
					runner.framerate = 1;
					Game.Jumping = true;
					runner.play('jump', function(){
						runner.framerate = 0;
						Game.Jumping = false;
						this.play('run'); //console.log( (+new Date) - start );
					});

					jumpBehavior.jump(runner);
				})

				stage.delegate('touchstart', 'start', function(e){
					Game.gameStart();
					enableArrow(true);

					new TWEEN.Tween( { x : stage.width / 2 - 110 / 2 } )
					    .to( { x : 0 - startBtn.width }, 500 )
					    // .repeat( Infinity )
					    // .delay( delayTime )
					    .easing( TWEEN.Easing.Back.Out)
					    .onUpdate( function () {
					        startBtn.x = this.x;
					    })
					    .onComplete(function(){
							startBtn.visible = false;
					    })
					    .start();
					if(over.visible) {
						new TWEEN.Tween( { y : gameoverAixsY } )
					    .to( { y : 0 - over.height }, 500 )
					    // .repeat( Infinity )
					    // .delay( delayTime )
					    .easing( TWEEN.Easing.Back.In)
					    .onUpdate( function () {
					        over.y = this.y;
					    })
					    .onComplete(function(){
							over.visible = false;
					    })
				    	.start();
					}
				});


				var AccelerationX = 0
				;
				window.addEventListener('devicemotion', function(ev){
					// var acceleration = ev.accelerationIncludingGravity
                    AccelerationX = ev.accelerationIncludingGravity.x;
				});

				var FPS_TOTAL = 0;
				var isAndroid = false;
			    if (window.navigator.userAgent.match(/Android/)) {
			    	isAndroid = true;
			    }


				new Timer().on('run', function(dt){

					if(ground.imagePositionX >= ground.maxPositionX) {
						ground.imagePositionX = 0;
					} else {
						ground.imagePositionX += grundVelocity * dt;
					}

					if(hill.x < -hill.width) {
						hill.x = stage.width + 60;
					} else {
						hill.x = hill.x - hillVelocity * dt;
					}

					if(sky.imagePositionX >= sky.maxPositionX) {
						sky.imagePositionX = 0;
					} else {
						sky.imagePositionX += skyVelocity * dt;
					}

					TWEEN.update();

					if(Game.gamePlaying) {
						runner.die || Game.calculateAccelerate(AccelerationX, dt, runner);

						for(var i = 0; i < arrows.length; i++) {
							renderArrow(arrows[i], dt);
						}

						if(Game.hitTestArrow( runner, arrows ) || Game.hitTestCircle(runner, rock)) {
							console.log('die');
							runner.die = true;
							blood.x = runner.x - 7;
							blood.y = runner.y + 13;
							blood.visible = true;
							blood.play('', function(){
								blood.visible = false;
							})
							dieBehavior.die(runner, function(){
								gameover();
							});
						}
					}

					showGameScore();

					stage.clear();
					stage.render(dt);

					// if (isAndroid) {
				 //    	if(canvas.style.opacity) {
				 //    		canvas.style.opacity = '';
				 //    	} else {
				 //    		canvas.style.opacity = '0.99';
				 //    	}
				 //    }

					FPS_TOTAL += dt;
					if(FPS_TOTAL > 1) {
						FPS_TOTAL = 0;
						fps.innerHTML = 'FPS:' + Math.floor(1/dt);
					}

				}).start();

				function showGameScore(){
					score.text = Game.score;
				}

				function renderArrow(arrow, dt){
					if(!arrow.visible) arrow.visible = true;
					if(arrow.dropping) {
						if(arrow.y == -arrow.height) {
							var tan
							,	falledX = stage.width * Math.random()
							;
							arrow.x = stage.width * Math.random();
							tan = (arrow.x - falledX) / (stage.height - 60 - 58);
							arrow.rotate = Math.atan(tan) / Math.PI * 180;
							arrow.tan = tan;
						} else if (arrow.y > (stage.height - 60 - 58 * Math.cos(arrow.rotate * Math.PI / 180)) ) {
							arrow.dropping = false;
							arrow.hitLand = true;
							// Add score
							if(Game.gamePlaying)Game.score++;
						}
						arrow.velocityY += GRAVITY_FORCE * dt * pixPerMeter;
						var translateY = arrow.velocityY * dt;
						arrow.y += translateY;
						arrow.x -= arrow.tan * translateY;
					} else if (arrow.hitLand) {
						if(arrow.x < -20) {
							arrow.dropping = true;
							arrow.hitLand = false;
							arrow.y = -arrow.height;
							arrow.velocityY = 0;
						} else {
							arrow.x -= (grundVelocity * dt)
						}
					} else {

					}
				}

				function enableArrow(status){
					for(var i = 0; i < arrows.length; i++) {
						var arrow = arrows[i];
						arrow.dropping = status;
						arrow.visible = status;
						if(status) {
							arrow.velocityY = 0;
							arrow.y = -arrow.height;
						}
					}
				}

				var arrowBehavior = {
					fall : function(){

					}
				}

				function gameover(){
					runner.visible = false;
					startBtn.visible = true;
					over.visible = true;
					Game.gamePlaying = false;
					Game.score = 0;
					enableArrow(false);

					new TWEEN.Tween( { y : 0 - over.height } )
					    .to( { y : gameoverAixsY }, 500 )
					    // .repeat( Infinity )
					    // .delay( delayTime )
					    .easing( TWEEN.Easing.Back.Out)
					    .onUpdate( function () {
					        over.y = this.y;
					    })
					    .start();

					new TWEEN.Tween( { x : 0 - startBtn.width } )
					    .to( { x : stage.width / 2 - 110 / 2 }, 500 )
					    // .repeat( Infinity )
					    // .delay( delayTime )
					    .easing( TWEEN.Easing.Back.Out)
					    .onUpdate( function () {
					        startBtn.x = this.x;
					    })
					    .start();
				}

			});
	
		}
	}

});	