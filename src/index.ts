// three.js
import * as THREE from 'three';

import { Move } from './Game';
import { GameRenderer } from './GameRenderer';

let mouse = new THREE.Vector2();

let raycaster = new THREE.Raycaster();

// create the scene
let scene = new THREE.Scene();

// create the camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer({
	antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.needsUpdate = true;

// set size
renderer.setSize(window.innerWidth, window.innerHeight);

// add canvas to dom
document.body.appendChild(renderer.domElement);

// add lights
let hemisphereLight = new THREE.HemisphereLight(0xfff3cc, 0xff33e4, 1);

scene.add(hemisphereLight);

let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, -7.5);
// directionalLight.position.set(1,1,1);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 512;  // default
directionalLight.shadow.mapSize.height = 512; // default
directionalLight.shadow.camera.near = 0.5;    // default
directionalLight.shadow.camera.far = 500;     // default

scene.add(directionalLight);

// add ground
let groundPlaneGeometry = new THREE.PlaneBufferGeometry(100, 100);
let groundPlaneMaterial = new THREE.MeshStandardMaterial({
	color: 0x161616,
	roughness: 1,
	metalness: 0.64
});

let groundPlane = new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial);
groundPlane.rotateX(-Math.PI / 2);
groundPlane.receiveShadow = true;

scene.add(groundPlane);

let game = new GameRenderer(7);
scene.add(game);

camera.position.x = 0;
camera.position.y = 5;
camera.position.z = 2;

camera.lookAt(scene.position);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );

function hasMove(object: THREE.Object3D): Boolean {
	return object.userData.hasOwnProperty('move') && object.userData['move'] instanceof Move;
}

function onMouseDown(event: MouseEvent) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children, true );

	if (intersects.length > 0) {
		const intersection = intersects.find(e => hasMove(e.object));
		if (intersection == null) return;

		let move: Move = intersection.object.userData['move'];

		console.log(move);

		game.executeMove(move);
		game.generateOptions();
	}
}

window.addEventListener( 'mousedown', onMouseDown, false );

function animate(): void {
	requestAnimationFrame(animate)
	render()
}

function render(): void {
	let timer = 0.002 * Date.now()
	renderer.render(scene, camera)
}

animate()
