// glabal variables
const apisUrl='http://161.189.24.17:3005'
var stores = [];
var floors= [];
var selected_floor;
var lastfloor_id;
var stores_on_floor=[]
var display_data={}

//create scenen object
var scene = new xeogl.Scene({
    transparent: false,
    backgroundColor: [0.125, 0.125, 0.125]
});

xeogl.setDefaultScene(scene);

//----------------------------------------------------------------------------------------------------
// Camera
//----------------------------------------------------------------------------------------------------

var camera = scene.camera;
const scale=0.001

camera.eye = [100, 110, -100];
camera.look = [150, 5, -170];
camera.up = [0,1,0];
camera.projection = "ortho";

var cameraControl = new xeogl.CameraControl();

scene.highlightMaterial.fillAlpha = 1;
scene.highlightMaterial.edgeAlpha = 0.6;
scene.highlightMaterial.edgeColor = [0, 0, 0];
scene.highlightMaterial.edgeWidth = 2;

//---------------------------------------------------
// Load the model
//---------------------------------------------------

var floorGroup2 = new xeogl.GLTFModel({
    id: "floors",
    src: "/static/models/floor.gltf",
    scale: [scale, scale, scale],
    edgeThreshold: 20,
    opacity: 1.0,
    visible: true,
    handleNode: (function(nodeInfo, actions) {
        return function (nodeInfo, actions) {
            if (nodeInfo.mesh !== undefined) { // Node has a mesh
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
    visible:true,
    handleNode: (function(nodeInfo, actions) {
        actions.createObject = {
            id: nodeInfo.name,
        };
        return function (nodeInfo, actions) {
            return true;
        };
    })
});

floorGroup2.on("loaded", function(){
    var cameraFlight = new xeogl.CameraFlightAnimation();
    cameraFlight.flyTo(env);

    for (const [key, value] of Object.entries(floorGroup2.objects)) {
        floors.push(key)
    }
    cameraControl.on("picked", function (hit) {     
        // ------ for store
        if (floors.includes(hit.mesh.id)) {
            $('#panel-body1').empty()
            console.log(lastfloor_id)
            if (lastfloor_id){
                floorGroup2.meshes[lastfloor_id].colorize=[1,1,1]
                floorGroup2.meshes[lastfloor_id].opacity=1
            }
            selected_floor=hit.mesh.id
            hit.mesh.colorize=[255,0,255]
            hit.mesh.opacity=0.5
            lastfloor_id=hit.mesh.id

            // prepare the data for ranking bar chart
            stores_on_floor=[]
            display_data={}
            $.post(apisUrl + '/get_store_id_of_one_floor_id', {'floor_id': id2fl[selected_floor]}, function(data, textStatus, jqXHR){
                if (textStatus=='success'){
                    data.forEach(function(d){
                        stores_on_floor.push(d.store_name)
                        $.post(apisUrl + '/get_store_kpis2', {'start_time': startDateTime, 'end_time': endDateTime, 'store_id': d.store_name}, function(data, textStatus){
                            if(textStatus=='success'){
                                display_data[d.store_name]=data
                                // display_data.push(data)
                            }
                        })
                    })
                    console.log(display_data)
                }
            });
            }
        });
    
    cameraControl.on("pickedNothing", function (hit) {
        // ------ for store
        if (lastfloor_id){
            floorGroup2.meshes[lastfloor_id].colorize=[1,1,1]
            floorGroup2.meshes[lastfloor_id].opacity=1
        }
        selected_floor=''
        $('#panel-body1').empty()
        });
});
