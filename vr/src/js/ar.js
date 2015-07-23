window.launch = function(){

    var RAF = window.requestAnimationFrame || 
          window.webkitRequestAnimationFrame || 
          window.MozRequestAnimationFrame || 
          function(callback){
            setTimeout(callback);
          };

    var perspective = 100;

    if(window.useWebGL) {

    	var scene = new THREE.Scene(); 
    	var camera = new THREE.PerspectiveCamera( perspective, 1000 / 1334, 0.1, 1000 ); 
    	var renderer = new THREE.WebGLRenderer();

    	renderer.setPixelRatio( window.devicePixelRatio );
    	renderer.setSize( 1000, 1334 ); 
    	document.getElementById('stage').appendChild( renderer.domElement );

    	camera.position.z = 200;
    	// camera.matrixAutoUpdate = false;

    	THREE.ImageUtils.crossOrigin = 'anonymous';

    	var loader = new THREE.TextureLoader();
    	loader.load('./imgs/world.jpg', function(texture) {

            var geometry = new THREE.SphereGeometry(perspective, 100, 100);

            var material = new THREE.MeshBasicMaterial({
                map: texture,
                overdraw: 1,
                side: THREE.FrontSide
            });
            var mesh = new THREE.Mesh(geometry, material);
    		mesh.applyMatrix( new THREE.Matrix4().makeScale( 0.2, 1, 1 ) );

            scene.add(mesh);
        });

    	function render(){
    		// camera.applyMatrix( new THREE.Matrix4().set(matrix) )
    		var matrix = [
                2.647578,
                0.1251069,
                0.09985533,
                0.09935731,
                -0.09463686,
                2.067234,
                -0.2267985,
                -0.2256673,
                0.2872962,
                -0.4718893,
                -0.9739828,
                -0.969125,
                -232.8791,
                -298.6464,
                364.558,
                372.7148
            ];
    		// camera.matrix.set( matrix );
    		renderer.render( scene, camera );
    		camera.updateProjectionMatrix();

    		RAF(render);
    	}

    	RAF(render);

    } else {

    	var points = [
            [0,0,0],
            [0,1,0],
            [1,1,0],
            [1,0,0],
            [0,0,1],
            [0,1,1],
            [1,1,1],
            [1,0,1]
        ]

        var test_matrix = [
            2.515496,0.05762116,0.2554911,0.2542168,-0.05450489,1.953497,-0.0304786,-0.03032659,0.6447399,-0.05931631,-0.9715169,-0.9666715,-206.8889,-236.6525,297.7981,306.2878
        ];

        function multiply(v, matrix){
            var result = [];

            for(var i = 0; i < 4; i++) {
                var e = v[0] * matrix[i];
                e += v[1] * matrix[i + 4];
                e += v[2] * matrix[i + 4 * 2];
                e +=  1 *   matrix[i + 4 * 3];

                result.push(e);
            }

            return result;
        }

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        document.getElementById('stage').appendChild(canvas);

        var clientHeight = document.body.getBoundingClientRect().height;
        canvas.width = document.body.getBoundingClientRect().width;
        canvas.height = clientHeight;
        context.fillStyle="#0000ff";
        context.strokeStyle="red";

        function render(matrix, viewport){
            // matrix=test_matrix;viewport=[-10,10];

            var projectPoint = [];

            for(var i = 0; i < 8; i++) {

                var m = mat4.create(),
                    vp = multiply(points[i], [30,0,0,0,0,30,0,0,0,0,30,0,0,0,0,1] );
                    // transition_m = mat4.multiply(m, matrix),
                
                vp = multiply(vp, matrix);
                // var vp = multiply(points[i], [50,0,0,-viewport[0],0,50,0,viewport[1],0,0,50,0,0,0,0,1]);
                // vp = multiply(vp, matrix);
                // vp[1] = clientHeight - vp[1];
                var zIndex = (300+vp[2])/20;
// console.log( zIndex );
                context.beginPath();
                context.arc( -vp[0], -vp[1], zIndex, 0, 2*Math.PI);
                context.closePath();
                context.fill();

                projectPoint[i] = vp;
            }

            var p1 = projectPoint[0];
            context.moveTo(p1[0], p1[1]);

            var p2 = projectPoint[1];
            context.lineTo(p2[0], p2[1]);

            var p3 = projectPoint[2];
            context.lineTo(p3[0], p3[1]);

            var p4 = projectPoint[3];
            context.lineTo(p4[0], p4[1]);
            context.lineTo(p1[0], p1[1]);


            var p5 = projectPoint[4];
            context.moveTo(p5[0], p5[1]);

            var p6 = projectPoint[5];
            context.lineTo(p6[0], p6[1]);

            var p7 = projectPoint[6];
            context.lineTo(p7[0], p7[1]);

            var p8 = projectPoint[7];
            context.lineTo(p8[0], p8[1]);
            context.lineTo(p5[0], p5[1]);

            context.stroke();

            context.moveTo(p1[0], p1[1]);
            context.lineTo(p5[0], p5[1]);

            context.moveTo(p2[0], p2[1]);
            context.lineTo(p6[0], p6[1]);

            context.moveTo(p3[0], p3[1]);
            context.lineTo(p7[0], p7[1]);

            context.moveTo(p4[0], p4[1]);
            context.lineTo(p8[0], p8[1]);

            context.stroke();

            // RAF(render);
        }

        // RAF(render)
        document.addEventListener('arpluginupdate', function(e)
        {
            // console.log("arpluginupdate:" + JSON.stringify(e.param));
            var models = e.param.models,
                viewport = e.param.viewport;

            context.clearRect(0,0,canvas.width,canvas.height);

            if(models[0]) {
                var mvprojection = models[0].mvprojection;
                render(mvprojection, viewport);
            }

        }, false);
    		
    }

}