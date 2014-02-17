define(function(require, exports, module){
	var Com = require('com/com')
	, 	Sprite = require('com/sprite')
	, 	SpriteSheet = require('com/spriteSheet')
	, 	Loader = require('com/loader')
	, 	Game = require('demo/game')
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
		pixPerMeter = 1500,
		jumpVelocityPerSecond = 60 / 1, 
		jumpHeightPix = 60;

	var Jump_Height = 50
	;
		
	var FPS_TOTAL = 0;

	var runnerVelocity = 100
	,	grundVelocity = 100
	,	hillVelocity = 60
	,	skyVelocity = 20
	,	rockRotateTime = 2
	,	rockVelocity = Math.PI * 50 / 2 + grundVelocity
	,	rockRotateVelocity = 360 / 2;
	;
	var AccelerationX;

	function createArrow(){
		;
	}

	return {

		init : function(){

			canvas.width = document.body.getBoundingClientRect().width;
			canvas.height = document.body.getBoundingClientRect().height;

			var calculateAccelerate = function(accelerationX, dt, com){
		            var translateX = accelerationX * dt * dt * pixPerMeter;
		            com.x += translateX;
		            if(com.x < 0) {
		            	com.x = 0;
		            } else if (com.x > scene.canvas.width - com.width) {
		            	com.x = scene.canvas.width - com.width;
		            }
		            if(translateX > 0 && !this.Jumping) {
		            	com.framerate = 0;
		            } else {
		            	com.framerate = 1;
		            }
		            if(translateX >= 0) {
		            	com.scaleX = 1;
		            } else {
		            	com.scaleX = -1;
		            }
				}

			,	hitTestCircle = function(comA, comB){
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
				}

			,	gameStart = function(){

					if(rock) {
						runner.x = 0;
						runner.y = canvas.height - 60 - 90;
						runner.die = false;
						runner.play('run');
						runner.visible = true;
					} else {
						rock = new Com({
							x : scene.canvas.width,
							y : scene.canvas.height - 60 - 50,
							width : 50,
							height : 50,
							backgroundImage : scene.get('ground'),
							shape : Com.Shape.Circle,
							painter : Com.Painter.Bitmap
						}).on('render:before', function(dt){
							if(this.x < -this.width) {
								this.x = scene.canvas.width + 60 * Math.random();
							} else {
								this.x -= rockVelocity * dt;
							}
							this.rotate -= rockRotateVelocity * dt;
						});

						scene.append(rock);
					}
				}
			;

			var sky, runner, rock, ground, blood, startBtn, gameover, hill;

			var scene = Game.createScene(canvas, {

				assets : assetsMap,

				init : function(){

					loading.style.display = 'none';

					var canvas = this.canvas
					,	game = this
					,	stage = game.stage
					;
					var jumpBehavior = {
							over : true,

							jump : function(com, callback){
								var me = this
								,	originHeight = com.y
								;
								if(!me.over || com.die) {
									return;
								}
								var	jump = new TWEEN.Tween( { y : originHeight } )
								    .to( { y : originHeight - Jump_Height }, 600 )
								    // .repeat( Infinity )
								    // .delay( delayTime )
								    .easing( TWEEN.Easing.Quintic.Out)
								    .onUpdate( function () {
								        com.y = this.y;
								    })
										
								,	fall = new TWEEN.Tween( { y : originHeight - Jump_Height } )
								    .to( { y : originHeight }, 600 )
								    // .repeat( Infinity )
								    // .delay( delayTime )
								    .easing( TWEEN.Easing.Quartic.In)
								    .onUpdate( function () {
								        com.y = this.y;
								        if(com.y == originHeight) {
								        	me.over = true;
								        }
								    })
								;
								jump.chain(fall).start();
								me.over = false;
							}
						}

					,	dieBehavior = {

							over : true,
							jumpHeight : 30,

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
								    })

								,	down = new TWEEN.Tween( { y : originHeight - 30 } )
								    .to( { y : stage.height }, 800 )
								    // .repeat( Infinity )
								    // .delay( delayTime )
								    .easing( TWEEN.Easing.Quartic.In)
								    .onUpdate( function () {
								        com.y = this.y;
								        if(com.y == stage.height) {
								        	me.over = true;
								        	if(callback) callback.call(scene);
								        }
								    })
								;
								up.chain(down).start();
								me.over = false;
							}
						}
					;

					var	bloodSheetPainter = new SpriteSheet({
							image : scene.get('blood'),
							frameData : {
								imgWidth : 450,
								imgHeight : 64,
								frameWidth : 64,
								frameHeight : 64,
								frameNum : 6
							},
						})

					,	spriteSheetPainter = new SpriteSheet({
							image : scene.get('runner'),
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

					sky = new Com({
						width : stage.width,
						height : stage.height - 60,
						backgroundImage : scene.get('sky'),
						imagePositionX : 0,
						backgroundRepeatX : true,
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					});

					ground = new Com({
						y : canvas.height - 60,
						width : canvas.width,
						height : 60,
						backgroundImage : scene.get('ground'),
						imagePositionX : 0,
						backgroundRepeatX : true,
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					});

					hill = new Com({
						x : canvas.width * Math.random(),
						y : canvas.height - 60 - 118,
						width : 564,
						height : 118,
						backgroundImage : scene.get('hill'),
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					});

					startBtn = new Com({
						id : 'start',
						x : canvas.width / 2 - 110 / 2,
						y : 130,
						width : 110,
						height : 60,
						backgroundImage : scene.get('start'),
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					});

					gameover = new Com({
						id : 'gameover',
						x : canvas.width / 2 - 198 / 2,
						y : 70,
						width : 198,
						height : 50,
						visible : false,
						backgroundImage : scene.get('over'),
						shape : Com.Shape.Rect,
						painter : Com.Painter.Bitmap
					});

					blood = new Sprite({
						width : 50,
						height : 50,
						visible : false,
						framerate : 4,
						shape : Com.Shape.Rect,
						painter : bloodSheetPainter
					});

					runner = new Sprite({
						x : 50,
						y : scene.stage.height - 60 - 90,
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
					stage.append(gameover);

					stage.on('touchstart', function(){
						if (runner.die) return;
						runner.framerate = 1;
						scene.Jumping = true;
						runner.play('jump', function(){
							runner.framerate = 0;
							scene.Jumping = false;
							this.play('run'); //console.log( (+new Date) - start );
						});

						jumpBehavior.jump(runner);
					})

					stage.delegate('touchstart', 'start', function(e){
						gameStart();
						startBtn.visible = false;
					});

					var last_update = 0
					,	velocityFly = 0
					,	AccelerationX = 0
					;
					window.addEventListener('devicemotion', function(ev){
						// var acceleration = ev.accelerationIncludingGravity
	                    scene.accelerationX = ev.accelerationIncludingGravity.x;
					});
				},

				update : function(dt){
					var stage = this.stage;

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

					if(rock && !runner.die) {
						calculateAccelerate(scene.accelerationX, dt, runner);

						if(hitTestCircle(runner, rock)) {
							console.log('die');
							runner.die = true;
							blood.x = runner.x - 7;
							blood.y = runner.y + 13;
							blood.visible = true;
							blood.play('', function(){
								blood.visible = false;
							})
							dieBehavior.die(runner, function(){
								runner.visible = false;
								startBtn.visible = true;
							});
						}
					}

					stage.clear();
					stage.render(dt);

					FPS_TOTAL += dt;
					if(FPS_TOTAL > 1) {
						FPS_TOTAL = 0;
						fps.innerHTML = 'FPS:' + Math.floor(1/dt);
					}
				}

			});
	
		}
	}

});	