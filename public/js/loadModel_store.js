
// glabal variables
const id2floor={
    '_801': 'L7',
    '_800': 'L6',
    '_799': 'L5',
    '_798': 'L4',
    '_797': 'L3',
    '_796': 'L2',
    '_795': 'L1',
    '_802': 'B1',
    '_803': 'B2'
}

var stores = [];
var floors= [];
var currentFloorStores = [];
var storeAnno = [];

//create scenen object
var scene = new xeogl.Scene({
    // canvas:'mycanvas',
    transparent: false,
    backgroundColor: [0.125, 0.125, 0.125]
});

xeogl.setDefaultScene(scene);


//----------------------------------------------------------------------------------------------------
// Camera
//----------------------------------------------------------------------------------------------------

var camera = scene.camera;
var lastStore;
var lastAnnotation;
var selected_store;
var lastStore_id;
const scale=0.001

camera.eye = [100, 100, -100];
camera.look = [150, 5, -170];
camera.up = [0,1,0];
camera.projection = "ortho";

var cameraControl = new xeogl.CameraControl({
    doublePickFlyTo: false
});

var cameraFlight = new xeogl.CameraFlightAnimation();

scene.highlightMaterial.fillAlpha = 1;
scene.highlightMaterial.edgeAlpha = 0.6;
scene.highlightMaterial.edgeColor = [0, 0, 0];
scene.highlightMaterial.edgeWidth = 2;

//---------------------------------------------------
// Load the model
//---------------------------------------------------

var floorGroup = new xeogl.GLTFModel({
    id: "floors",
    src: "/static/models/floor5.gltf",
    scale: [scale, scale, scale],
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

var env = new xeogl.GLTFModel({
    id: "hopson-env",
    src: "/static/models/env.gltf",
    scale: [scale, scale, scale],
    // edgeThreshold: 50,
    edges: false,
    outlined: false,
    pickable: false,
    ghosted: true,
    visible:false,
    handleNode: (function(nodeInfo, actions) {
        var objectCount = 0;
        actions.createObject = {
            id: nodeInfo.name,
        };
        return function (nodeInfo, actions) {
            return true;
        };
    })
});

var storeGroup = new xeogl.GLTFModel({
    id: "storeGroup",
    src: "/static/models/stores.gltf",
    scale: [scale, scale, scale],
    edgeThreshold: 0,
    opacity: 0.2,
    visible: false,
    handleNode: (function(nodeInfo, actions) {
        var objectCount = 0;
        actions.createObject = {
            id: nodeInfo.name,
        };
        return function (nodeInfo, actions) {
            if (nodeInfo.mesh !== undefined) { // Node has a mesh
                actions.createObject = {
                    id: nodeInfo.name,
                };
            }
            return true;
        };
    })
});

var cameraGroup = new xeogl.GLTFModel({
    id: "cameraGroup",
    src: "/static/models/camera.gltf",
    scale: [scale, scale, scale],
    edgeThreshold: 20,
    opacity: 0.4,
    visible: false,
    handleNode: (function(nodeInfo, actions) {
        var objectCount = 0;
        return function (nodeInfo, actions) {
            // if (nodeInfo.mesh !== undefined) { // Node has a mesh
                console.log(nodeInfo.name)
                actions.createObject = {
                    id: nodeInfo.name,
                };
            // }
            return true;
        };
    })
});

storeGroup.on("loaded", function(){
    for (const [key, value] of Object.entries(storeGroup.objects)) {
        stores.push(key)
    }

});

floorGroup.on("loaded", function(){
    var cameraFlight = new xeogl.CameraFlightAnimation();
    cameraFlight.flyTo(floorGroup);
    for (const [key, value] of Object.entries(floorGroup.objects)) {
        floors.push(key)
    }
    console.log('model loaded')
    cameraControl.on('picked', function(hit){
        // console.log('hit mesh: ',hit.mesh.id)
    if (floors.includes(hit.mesh.id)){
        $('#bar-chart').empty();

        picked_center = hit.mesh._aabbCenter[1];
            for (const [key, value] of Object.entries(floorGroup.meshes)) {
                if (value._aabbCenter[1] > picked_center)
                {
                    value.position = [0, 120000, 0];
                }
                else{
                    init=picked_center
                    value.position = [0, 0, 0];
                }
            }
            storeAnno.forEach(storeA => {
                storeA.destroy();
            })
            storeAnno = []
            currentFloorStores=[]
            stores.forEach(store_id => {
    
                if (store_id.slice(0,2)==id2floor[hit.mesh.id]){
                    storeGroup.objects[store_id].visible = true;
                    if(Object.keys(store_names).includes(store_id)){
                        storeGroup.objects[store_id].opacity=0.5
                    }
                    deltaY=storeGroup.objects[store_id].position[1];
                    storeGroup.objects[store_id].position = [0,deltaY+10,0];
                    var store = new xeogl.Annotation(scene, {
                        mesh: storeGroup.objects[store_id], 
                        id: "Anno"+ store_id,
                        bary: [0.33, 0.33, 0.33],
                        occludable: false,
                        glyph: store_id,
                        desc: 'Store ID: ' + store_id,
                        pinShown: false,
                        labelShown: false
                    });
                    storeAnno.push(store)
                    currentFloorStores.push(store_id) // get store id on the selected floor
                }
                else{
                    storeGroup.objects[store_id].visible = false;}
            })
        }
    })


    cameraControl.on("hoverEnter", function (hit) {     
    // ------ for store
    if (stores.includes(hit.mesh.id)) {
        object = scene.components['Anno'+ hit.mesh.id];
        object.mesh.aabbVisible = true;
        object.labelShown = true;
        // do other things for store
        }
    });

    cameraControl.on("hoverOut", function (hit) {
    // ------ for store
    if (stores.includes(hit.mesh.id)) {
        object = scene.components['Anno'+ hit.mesh.id];
        object.mesh.aabbVisible = false;
        object.labelShown = false;
        // do other things for store
        }
    });

    cameraControl.on("picked", function (hit) {
        if(stores.includes(hit.mesh.id)){
            if (currentFloorStores.includes(hit.mesh.id)) {
                if (lastStore_id && Object.keys(store_names).includes(lastStore_id)){
                    storeGroup.meshes[lastStore_id].opacity=0.5
                }
                else if(lastStore_id){
                    storeGroup.meshes[lastStore_id].opacity=0.2
                }
                selected_store=hit.mesh.id
                hit.mesh.opacity=1
                lastStore_id=hit.mesh.id
            }
        }     
    });
    
    cameraControl.on("pickedNothing", function (hit) {
        if (lastStore_id && Object.keys(booth2store).includes(lastStore_id)){
            storeGroup.meshes[lastStore_id].opacity=0.5
        }
        else if(lastStore_id){
            storeGroup.meshes[lastStore_id].opacity=0.2
        }
    });
});
