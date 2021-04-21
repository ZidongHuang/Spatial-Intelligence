
//create scenen object
var scene0 = new xeogl.Scene({
    canvas:'circle',
    transparent: true,
    // backgroundColor: [255, 255, 255]
});

xeogl.setDefaultScene(scene0);
//----------------------------------------------------------------------------------------------------
// Camera
//----------------------------------------------------------------------------------------------------

var camera0 = scene0.camera;
const scale0=0.001

camera0.eye = [100, 100, -100];
camera0.look = [150, 7, -170];
camera0.up = [0,1,0];
camera0.projection = "ortho";

var cameraControl0 = new xeogl.CameraControl({
});

scene0.highlightMaterial.fillAlpha = 1;
scene0.highlightMaterial.edgeAlpha = 0.6;
scene0.highlightMaterial.edgeColor = [0, 0, 0];
scene0.highlightMaterial.edgeWidth = 2;


//---------------------------------------------------
// Load the model
//---------------------------------------------------

var floorGroup0 = new xeogl.GLTFModel({
    id: "floors",
    src: "/static/models/floor.gltf",
    scale: [scale0, scale0, scale0],
    edgeThreshold: 20,
    opacity: 0.9,
    visible: true,
    handleNode: (function(nodeInfo, actions) {
        var objectCount = 0;
        return function (nodeInfo, actions) {
            if (nodeInfo.mesh !== undefined) { // Node has a mesh
                console.log(nodeInfo.name)

                actions.createObject = {
                    id: nodeInfo.name,
                };
            }
            return true;
        };
    })
})


floorGroup0.on("loaded", function(){
    var cameraFlight0 = new xeogl.CameraFlightAnimation();
    cameraFlight0.flyTo(floorGroup0);

    scene0.on('tick',function(){
        scene0.camera.orbitYaw(0.2)
    })

    var button1=$('#home').append($('<button>',{
        id: 'btn-floor',
        class: 'btn btn-primary',
        type: 'button',
        text: '楼层信息'
    }));

    var button2=$('#home').append($('<button>',{
        id: 'btn-store',
        class: 'btn btn-primary',
        type: 'button',
        text: '店铺信息'
    }));

    var button3=$('#home').append($('<button>',{
        id: 'btn-node',
        class: 'btn btn-primary',
        type: 'button',
        text: '节点信息'
    }));

    var button4=$('#home').append($('<button>',{
        id: 'btn-floor-back',
        class: 'btn btn-primary',
        type: 'button',
        text: '返回首页'
    }));

    var button5=$('#home').append($('<button>',{
        id: 'btn-store-back',
        class: 'btn btn-primary',
        type: 'button',
        text: '返回首页'
    }));

    document.getElementById("btn-floor").onclick = function () {
        location.href = "index.html#1";
    };
    document.getElementById("btn-store").onclick = function () {
        location.href = "index.html#2";
    };
    document.getElementById("btn-node").onclick = function () {
        location.href = "index.html#3";
    };

    document.getElementById("btn-floor-back").onclick = function () {
        location.href = "index.html#0";
    };
    document.getElementById("btn-store-back").onclick = function () {
        location.href = "index.html#0";
    };
});