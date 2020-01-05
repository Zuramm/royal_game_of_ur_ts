// three.js
import * as THREE from "three";

import { Move, NewMove, MoveMove, KillMove, SaveMove, Field, Game, TeamColor, Team } from "./Game";
import { GameRenderer } from "./GameRenderer";
import { generateMovePath } from "./generateMovePath";

let mouse: THREE.Vector2 = new THREE.Vector2();
let mouseOverMove: Move;

let raycaster: THREE.Raycaster = new THREE.Raycaster();

// create the scene
let scene: THREE.Scene = new THREE.Scene();

// create the camera
let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
	antialias: true,
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.BasicShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.needsUpdate = true;

// set size
renderer.setSize(window.innerWidth, window.innerHeight);

// add canvas to dom
document.body.appendChild(renderer.domElement);

// add lights
let hemisphereLight: THREE.HemisphereLight = new THREE.HemisphereLight(0xfff3cc, 0xff33e4, 1);

scene.add(hemisphereLight);

let directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, -7.5);
// directionalLight.position.set(1,1,1);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 1024;  // default
directionalLight.shadow.mapSize.height = 1024; // default
directionalLight.shadow.camera.near = 0.5;    // default
directionalLight.shadow.camera.far = 500;     // default
directionalLight.shadow.bias = -0.0001;

scene.add(directionalLight);

// add ground
let groundPlaneGeometry: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(100, 100);
let groundPlaneMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
	color: 0x161616,
	roughness: 1,
	metalness: 0.64
});

let groundPlane: THREE.Mesh = new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial);
groundPlane.rotateX(-Math.PI / 2);
groundPlane.receiveShadow = true;

scene.add(groundPlane);

let game: GameRenderer = new GameRenderer(7);

scene.add(game);

let pathArrow: THREE.Group = new THREE.Group();
pathArrow.position.set(-4.8, 0.65, 1.2);
pathArrow.rotation.x = Math.PI * 3 / 2;
pathArrow.scale.set(1.2, 1.2, 1.2);
pathArrow.name = "PathArrow";

scene.add(pathArrow);

camera.position.set(0, 5, 2);

camera.lookAt(scene.position);

camera.position.x -= 0.6;
camera.position.z += 0.8;

function onWindowResize(): void {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( "resize", onWindowResize, false );

function hasMove(object: THREE.Object3D): Boolean {
	return object.userData.hasOwnProperty("move") && object.userData.move instanceof Move;
}

function onMouseDown(event: MouseEvent): void {
	event.preventDefault();

	if (mouseOverMove !== null) {
		if (mouseOverMove instanceof NewMove) {
			console.log(`Moved new piece to the field ${mouseOverMove.distance}`);
		} else if (mouseOverMove instanceof MoveMove) {
			const newField: number = game.game.currentTeam.pieces[mouseOverMove.piece] + mouseOverMove.distance;
			console.log(`Moved piece ${mouseOverMove.piece} ${mouseOverMove.distance} spaces forward to ${newField}`);
		} else if (mouseOverMove instanceof KillMove) {
			const newField: number = game.game.currentTeam.pieces[mouseOverMove.piece] + mouseOverMove.distance;
			console.log(`Moved piece ${mouseOverMove.piece} ${mouseOverMove.distance} spaces forward to ${newField} and killed ${mouseOverMove.dyingPiece}`);
		} else if (mouseOverMove instanceof SaveMove) {
			console.log(`Saved piece ${mouseOverMove.piece}`);
		}

		pathArrow.remove(...pathArrow.children);

		game.executeMove(mouseOverMove);
		game.generateOptions();
	}
}

window.addEventListener( "mousedown", onMouseDown, false );

function onMouseMove(event: MouseEvent): void {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );
	var intersects: THREE.Intersection[] = raycaster.intersectObjects( scene.children, true );

	if (intersects.length > 0) {
		const intersection: THREE.Intersection = intersects.find(e => hasMove(e.object));
		if (intersection == null) {
			if (mouseOverMove !== null) {
				console.log("mouse exit", mouseOverMove);
				pathArrow.remove(...pathArrow.children);
				mouseOverMove = null;
			}
			return;
		}

		if (mouseOverMove !== intersection.object.userData.move) {
			mouseOverMove = intersection.object.userData.move;
			console.log("mouse enter", mouseOverMove);
			pathArrow.add(generateMovePath(mouseOverMove.field, mouseOverMove.field + mouseOverMove.distance as Field, game.game.currentColor));
		}
	}
}

window.addEventListener( "mousemove", onMouseMove, false );

function animate(): void {
	requestAnimationFrame(animate);
	render();
}

function render(): void {
	renderer.render(scene, camera);
}

animate();
