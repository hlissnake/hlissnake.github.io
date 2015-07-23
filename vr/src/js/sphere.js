KISSY.add('vr/sphere', function(S, D, Touch, Orientation){

	var $ = D.get;
	var Degree = Math.PI/180;

	var Sphere = function(options){

		var stage = options.el,
			perspective = options.fv,
			textures = options.textures,
			cubeWidth = stage.getBoundingClientRect().width;

		this.cameraPositionZ = options.cameraPosition || 0;
		this.fv = perspective;
		this.side = options.side || 'FrontSide';

		this._initialize(stage, perspective, textures, cubeWidth, options.type);

		if(options.type == 'touch') {
			Touch.bindEvent(stage, this);
		} else {
			Orientation.bindEvent(stage, this, false);
		}
	}

	Sphere.prototype = {

		_initialize : function(stage, perspective, texture, cubeWidth, type){

			var me = this,
				clientWidth = stage.getBoundingClientRect().width,
				clientHeight = stage.getBoundingClientRect().height;

			var scene = new THREE.Scene(); 
			var camera = new THREE.PerspectiveCamera( perspective, clientWidth / clientHeight, 0.1, 1000 ); 
			var renderer = new THREE.WebGLRenderer();

			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( clientWidth, clientHeight ); 
			stage.appendChild( renderer.domElement );

			THREE.ImageUtils.crossOrigin = 'anonymous';

			// var geometry = new THREE.BoxGeometry( clientWidth, clientWidth, clientWidth ); 
			// var material = new THREE.MeshBasicMaterial( { color: 0x00ffcc } ); 

			// var texture = THREE.ImageUtils.loadTexture( image_list.front );
			// texture.magFilter = THREE.NearestFilter;
			// texture.minFilter = THREE.NearestFilter;
			// var material = new THREE.MeshLambertMaterial({
		 //        map: texture
		 //    });
			// var cube = new THREE.Mesh( geometry, material );
			// scene.add( cube );

			camera.position.z = this.cameraPositionZ;

			this.scene = scene;
			this.camera = camera;
			this.renderer = renderer;
			// this.cube = cube;

			// this.render(0,0,1);

			this.loader = new THREE.TextureLoader();
            // max width<=3238
            this.loader.load(texture, function(texture) {

                var geometry = new THREE.SphereGeometry(perspective, 100, 100);
				if(me.side == 'BackSide') {
					geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
				}
				// for ( var i = 0; i < geometry.faces.length; i ++ ) {
				//     var face = geometry.faces[ i ];
				//     var temp = face.a;
				//     face.a = face.c;
				//     face.c = temp;
				// }

				// geometry.computeFaceNormals();
				// geometry.computeVertexNormals();

				// var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
				// for ( var i = 0; i < faceVertexUvs.length; i ++ ) {
				//     var temp = faceVertexUvs[ i ][ 0 ];
				//     faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
				//     faceVertexUvs[ i ][ 2 ] = temp;
				// }

                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    overdraw: 1,
                    side: THREE.FrontSide
                });
                var mesh = new THREE.Mesh(geometry, material);
				// mesh.applyMatrix( new THREE.Matrix4().makeScale( 0.2, 1, 1 ) );

                me.scene.add(mesh);
                me.object = mesh;
				me.render(0,0,1);
            });
		},

		render : function(x, y, scale){

			this.object.rotation.x = -x * Degree; 
			this.object.rotation.y = y * Degree;

			if(scale > 1.5) scale = 1.5;
			if(scale < 0.5) scale = 0.5;//   scale = -1;
			// this.camera.position.z = 100 - scale * 100 + this.cameraPositionZ;

			this.camera.fov = scale * this.fv;
			this.camera.updateProjectionMatrix();

			// var matrix = new THREE.Matrix4();
			// matrix.scale(new THREE.Vector3( scale, scale, scale ));
			// matrix.multiply( new THREE.Matrix4().makeRotationY(y * Degree) );
			// matrix.multiply( new THREE.Matrix4().makeRotationX(-x * Degree) );
			// this.object.applyMatrix(matrix);
			// this.object.updateMatrix();

			this.renderer.render( this.scene, this.camera );
		},

		renderByOrientation : function(){

			var euler = new THREE.Euler();
			var qx = new THREE.Quaternion( -Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
			var qz = new THREE.Quaternion( 0, 0, -Math.sqrt( 0.5 ), Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
			// var q0 = new THREE.Quaternion();

			return function(x, y, z, scale){

				if(scale > 1.5) scale = 1.5;
				if(scale < 0.5) scale = 0.5;
				this.camera.fov = scale * this.fv;
				this.camera.updateProjectionMatrix();
				// this.camera.position.z = scale * 100 - 100;
				// var matrix = new THREE.Matrix4();
				// matrix.scale(new THREE.Vector3( scale, scale, scale ));
				// this.object.applyMatrix(matrix);
				// this.object.updateMatrix();

				// this.camera.position.z = 100 - scale * 100;
				// this.camera.translateZ( scale );

				euler.set( x * Degree, z * Degree, y * Degree,'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us
				this.camera.quaternion.setFromEuler( euler );  // orient the device
				this.camera.quaternion.multiply( qx );
				// this.camera.quaternion.multiply( qz );

				this.renderer.render( this.scene, this.camera );
			}
		}()

	}

	return Sphere;

}, {
	requires : [
		'dom',
		'vr/touch',
		'vr/orientation'
	]
});