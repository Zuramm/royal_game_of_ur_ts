// three.js
import * as THREE from "three";

import { Move, NewMove, MoveMove, KillMove, SaveMove, Field } from "./Game";
import { GameRenderer } from "./GameRenderer";
import { generateMovePath } from "./generateMovePath";

const mouse: THREE.Vector2 = new THREE.Vector2();
let mouseOverMove: Move;

const raycaster: THREE.Raycaster = new THREE.Raycaster();

// create the scene
const scene: THREE.Scene = new THREE.Scene();

// create the camera
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.BasicShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.needsUpdate = true;

// set size
renderer.setSize(window.innerWidth, window.innerHeight);

// add canvas to dom
document.body.appendChild(renderer.domElement);

// add lights
const hemisphereLight: THREE.HemisphereLight = new THREE.HemisphereLight(
    0xfff3cc,
    0xff33e4,
    1
);

scene.add(hemisphereLight);

const directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(
    0xffffff,
    1
);
directionalLight.position.set(5, 10, -7.5);
// directionalLight.position.set(1,1,1);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 1024; // default
directionalLight.shadow.mapSize.height = 1024; // default
directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 500; // default
directionalLight.shadow.bias = -0.0001;

scene.add(directionalLight);

// add ground
const groundPlaneGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(
    100,
    100
);
const groundPlaneMaterial: THREE.MeshStandardMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x161616,
        roughness: 1,
        metalness: 0.64,
    });

const groundPlane: THREE.Mesh = new THREE.Mesh(
    groundPlaneGeometry,
    groundPlaneMaterial
);
groundPlane.rotateX(-Math.PI / 2);
groundPlane.receiveShadow = true;

scene.add(groundPlane);

const game: GameRenderer = new GameRenderer(7);

scene.add(game);

const pathArrow: THREE.Group = new THREE.Group();
pathArrow.position.set(-4.8, 0.65, 1.2);
pathArrow.rotation.x = (Math.PI * 3) / 2;
pathArrow.scale.set(1.2, 1.2, 1.2);
pathArrow.name = "PathArrow";

scene.add(pathArrow);

function onWindowResize(): void {
    const cameraDist = new THREE.Vector3(0, 5, 2.8).distanceTo(
        new THREE.Vector3(0, 0, 0)
    );

    let minFov: number;
    let mapWidth: number;

    if (window.innerWidth > window.innerHeight) {
        minFov = 65;
        mapWidth = 7;

        camera.position.set(-0.6, 5, 2.8);

        camera.lookAt(new THREE.Vector3(-0.6, 0, 0.8));
    } else {
        minFov = 98;
        mapWidth = 4.5;

        camera.position.set(0.5, 5, 0);

        camera.lookAt(new THREE.Vector3(-0.1, 0, 0));
    }

    const fov = Math.max(
        minFov,
        2 *
            THREE.MathUtils.radToDeg(
                Math.atan(
                    ((mapWidth / window.innerWidth) * window.innerHeight) /
                        cameraDist
                )
            )
    );

    console.log(fov);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = fov;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

onWindowResize();

window.addEventListener("resize", onWindowResize, false);

function hasMove(object: THREE.Object3D): boolean {
    return (
        object.userData.hasOwnProperty("move") &&
        object.userData.move instanceof Move
    );
}

function onMouseDown(event: MouseEvent): void {
    event.preventDefault();

    if (mouseOverMove !== null) {
        if (mouseOverMove instanceof NewMove) {
            console.log(
                `Moved new piece to the field ${mouseOverMove.distance}`
            );
        } else if (mouseOverMove instanceof MoveMove) {
            const newField: number =
                game.game.currentTeam.pieces[mouseOverMove.piece] +
                mouseOverMove.distance;
            console.log(
                `Moved piece ${mouseOverMove.piece} ${mouseOverMove.distance} spaces forward to ${newField}`
            );
        } else if (mouseOverMove instanceof KillMove) {
            const newField: number =
                game.game.currentTeam.pieces[mouseOverMove.piece] +
                mouseOverMove.distance;
            console.log(
                `Moved piece ${mouseOverMove.piece} ${mouseOverMove.distance} spaces forward to ${newField} and killed ${mouseOverMove.dyingPiece}`
            );
        } else if (mouseOverMove instanceof SaveMove) {
            console.log(`Saved piece ${mouseOverMove.piece}`);
        }

        pathArrow.remove(...pathArrow.children);

        game.executeMove(mouseOverMove);
        game.generateOptions();
    }
}

window.addEventListener("mousedown", onMouseDown, false);

function onMouseMove(event: MouseEvent): void {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects: THREE.Intersection[] = raycaster.intersectObjects(
        scene.children,
        true
    );

    if (intersects.length > 0) {
        const intersection: THREE.Intersection = intersects.find((e) =>
            hasMove(e.object)
        );
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
            pathArrow.add(
                generateMovePath(
                    mouseOverMove.field,
                    (mouseOverMove.field + mouseOverMove.distance) as Field,
                    game.game.currentColor
                )
            );
        }
    }
}

window.addEventListener("mousemove", onMouseMove, false);

function animate(): void {
    requestAnimationFrame(animate);
    render();
}

function render(): void {
    renderer.render(scene, camera);
}

animate();
