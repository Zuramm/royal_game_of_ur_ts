import * as THREE from "three";
import { SVGLoader, StrokeStyle } from "three/examples/jsm/loaders/SVGLoader.js";
import { Field, TeamColor } from "./Game";
import { Vector3 } from "three";

type Section = 0 | 1 | 2;

function getSection(field: Field): Section {
    return field < 4 ? 0 : field < 12 ? 1 : 2;
}

function getY(field: Field): number {
    return field < 4 || field >= 12 ? 0 : 1;
}

function getX(field: Field): number {
    return field < 4 ? 3 - field : field < 12 ? field - 4 : 7 - (field - 12);
}

export function generateMovePath(from: Field, to: Field, team: TeamColor): THREE.Object3D {
    const fromSection: Section = getSection(from);
    const toSection: Section = getSection(to);

    console.log(from, to);

    // generate path
    const path: THREE.Path = new THREE.Path();
    path.moveTo(getX(from), getY(from));
    path.lineTo(getX(from), getY(from));

    if (fromSection === 0 && toSection > 0) {
        if (from < 3) {
            path.absarc(0.5, 0.5, 0.5, Math.PI * 3 / 2, Math.PI, true);
        }
        if (to > 4) {
            path.absarc(0.5, 0.5, 0.5, Math.PI, Math.PI / 2, true);
        }
    }

    if (fromSection <= 1 && toSection > 1) {
        if (from < 11) {
            path.absarc(6.5, 0.5, 0.5, Math.PI / 2, 0, true);
        }
        if (to > 12) {
            path.absarc(6.5, 0.5, 0.5, 0, Math.PI * 3 / 2, true);
        }
    }

    path.lineTo(getX(to), getY(to));

    const arrowPath: THREE.Path = new THREE.Path();

    const dir: -1 | 1 = toSection === 1 ? 1 : -1;
    const arrowSize: number = 0.2;

    if (to === 4 || to === 12) {
    	arrowPath.moveTo(getX(to) - arrowSize, getY(to) - dir * arrowSize);
    	arrowPath.lineTo(getX(to), getY(to));
    	arrowPath.lineTo(getX(to) + arrowSize, getY(to) - dir * arrowSize);
    } else {
    	arrowPath.moveTo(getX(to) - dir * arrowSize, getY(to) - arrowSize);
    	arrowPath.lineTo(getX(to), getY(to));
    	arrowPath.lineTo(getX(to) - dir * arrowSize, getY(to) + arrowSize);
    }

    // render
    const points: THREE.Vector3[] = path.getPoints().map(v => new Vector3(v.x, team === TeamColor.Black ? v.y : 2 - v.y, 0));
    const style: StrokeStyle = SVGLoader.getStrokeStyle(0.1, "#000000");
    console.log(points);

    const strokeGeometry: THREE.BufferGeometry = SVGLoader.pointsToStroke(points, style, 12, 0.0001);
    const material: THREE.Material = new THREE.LineBasicMaterial({
        color: 0xffffff
    });

    const arrowPoints: THREE.Vector3[] = arrowPath.getPoints().map(v => new Vector3(v.x, team === TeamColor.Black ? v.y : 2 - v.y, 0));
    const arrowStyle: StrokeStyle = SVGLoader.getStrokeStyle(0.1, "#000000");
    console.log(points);

    const arrowStrokeGeometry: THREE.BufferGeometry = SVGLoader.pointsToStroke(arrowPoints, arrowStyle, 12, 0.0001);

    const pathMesh: THREE.Mesh = new THREE.Mesh(strokeGeometry, material);
    const arrowPathMesh: THREE.Mesh = new THREE.Mesh(arrowStrokeGeometry, material);

    const pathGroup: THREE.Group = new THREE.Group();
    pathGroup.add(pathMesh);
    pathGroup.add(arrowPathMesh);

    return pathGroup;
}