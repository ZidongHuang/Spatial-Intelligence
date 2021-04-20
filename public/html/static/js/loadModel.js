cameras = ['J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'J07', 'J08', 'J09', 
'J11', 'J12', 'J13', 'J14', 'J15', 'J16', 'J17', 'J18', 'J19', 
'J20', 'J21', 'J22', 'J23', 'J24', 'J25', 'J26', 'J27', 'J28', 
'J29', 'J30', 'J31', 'J32', 'J33', 'J34', 'J35']

stores =  ['2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2011', 
'2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', 
'2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', 
'2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035', 
'2036', '2037', '2038']

stores = []

floorOrder = {
    'B3': -2,
    'B2': -1,
    'B1': 0,
    'L1': 1,
    'L2': 2,
    'L3': 3,
    'L4': 4,
    'L5': 5,
    'L6': 6
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
    // canvas:'myCanvas',
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
camera.look = [150, 7, -170];
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

var lastEntity = null;
var lastColorize = null;
var input = scene.input;

//---------------------------------------------------
// Load the model
//---------------------------------------------------

var floorGroup = new xeogl.GLTFModel({
    id: "floors",
    src: "./static/models/floor5.gltf",
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
    src: "./static/models/env.gltf",
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
    src: "./static/models/stores.gltf",
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
    src: "./static/models/camera.gltf",
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

// initial_centers={};
floorGroup.on("loaded", function(){

    for (const [key, value] of Object.entries(floorGroup.objects)) {
        floors.push(key)
    }

    console.log('model loaded')
    cameraControl.on('picked', function(hit){
        console.log('hit mesh: ',hit.mesh.id)
    if (floors.includes(hit.mesh.id)){
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
                    deltaY=storeGroup.objects[store_id].position[1];
                    storeGroup.objects[store_id].position = [0,deltaY+10,0];
                    var store = new xeogl.Annotation(scene, {
                        mesh: storeGroup.objects[store_id], 
                        id: "Anno"+ store_id,
                        bary: [0.33, 0.33, 0.33],
                        occludable: true,
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
        mesh=scene.components[hit.mesh.id];
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
        object.colorize = [1.0, 0, 0];
        object.labelShown = false;
        // do other things for store
        }
    });

    cameraControl.on("picked", function (hit) {     
        if(stores.includes(hit.mesh.id)){
            if (currentFloorStores.includes(hit.mesh.id)) {
                if (lastStore_id){
                    storeGroup.meshes[lastStore_id].opacity=0.2
                }
                selected_store=hit.mesh.id
                hit.mesh.opacity=1
                lastStore_id=hit.mesh.id
            }
        }     
    });
    
    cameraControl.on("pickedNothing", function (hit) {
        // if (lastStore_id){
        //     storeGroup.meshes[lastStore_id].opacity=0.2
        // }
    });
});