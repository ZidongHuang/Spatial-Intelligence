import * as THREE from 'three';
// import { OBJLoader2 } from "three/loaders/ObjectLoader.js";
// import { MTLLoader } from "three/loaders/MTLLoader.js";

const scene = new THREE.Scene();
// alert(scene)
let loader = new THREE.ObjectLoader.OBJLoader2();

// function called on successful load
function callbackOnLoad ( object3d ) {
	scene.add( object3d );

// load a resource from provided URL synchronously
loader.load( '/static/models/hopson.obj', callbackOnLoad, null, null, null );
