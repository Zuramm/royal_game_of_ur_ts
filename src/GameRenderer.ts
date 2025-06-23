import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as Game from "./Game";
import { Object3D } from "three";

const models: { [key: string]: THREE.Group } = {
    Board: new THREE.Group(),
    WhitePiece: new THREE.Group(),
    BlackPiece: new THREE.Group(),
};

const PIECES_LEFT_OFFSET: THREE.Vector3 = new THREE.Vector3(0.8, 0, 0);
const PIECES_SAFE_OFFSET: THREE.Vector3 = new THREE.Vector3(0, 0.2, 0);

async function loadObjects(): Promise<void> {
    const loader: GLTFLoader = new GLTFLoader().setPath("models/");

    const modelKeys: string[] = Object.keys(models);

    const objects: GLTF[] = await Promise.all(
        modelKeys.map(
            (name) =>
                new Promise<GLTF>((res, rej) =>
                    loader.load(`${name}.glb`, res, null, rej)
                )
        )
    );

    console.log(objects);

    objects.forEach((gltf, i) => {
        const mesh: THREE.Object3D = gltf.scene.children[0];
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        models[modelKeys[i]].add(mesh);
        models[modelKeys[i]].name = modelKeys[i];
    });
}

const optionMaterial: THREE.Material = new THREE.MeshBasicMaterial({
    color: 0x67eb34,
    transparent: true,
    opacity: 0.5,
});
const optionGeometry: THREE.BufferGeometry = new THREE.PlaneGeometry(1, 1);

function createOption(): THREE.Mesh {
    return new THREE.Mesh(optionGeometry, optionMaterial);
}

function spaceNumberToPosition(
    team: Game.TeamColor,
    space: number
): THREE.Vector3 {
    if (space < 4) {
        return new THREE.Vector3(3 - space, 0, team * 2).multiplyScalar(1.2);
    } else if (space < 12) {
        return new THREE.Vector3(space - 4, 0, 1).multiplyScalar(1.2);
    } else {
        return new THREE.Vector3(7 - (space - 12), 0, team * 2).multiplyScalar(
            1.2
        );
    }
}

function rollDice(): number {
    return (
        Math.round(Math.random()) +
        Math.round(Math.random()) +
        Math.round(Math.random()) +
        Math.round(Math.random())
    );
}

export class GameRenderer extends THREE.Object3D {
    public game: Game.Game;
    public board: THREE.Group;
    public whitePiecesLeft: THREE.Group;
    public whitePiecesSafe: THREE.Group;
    public blackPiecesLeft: THREE.Group;
    public blackPiecesSafe: THREE.Group;
    public options: THREE.Group;
    public whitePieces: THREE.Group;
    public blackPieces: THREE.Group;
    // m TODO: show dice roll
    // m TODO: show current team playing

    private get currentPieces(): THREE.Group {
        return this.game.currentColor === Game.TeamColor.White
            ? this.whitePieces
            : this.blackPieces;
    }
    private get oppositePieces(): THREE.Group {
        return this.game.currentColor !== Game.TeamColor.White
            ? this.whitePieces
            : this.blackPieces;
    }
    private get currentPiecesLeft(): THREE.Group {
        return this.game.currentColor === Game.TeamColor.White
            ? this.whitePiecesLeft
            : this.blackPiecesLeft;
    }
    private get oppositePiecesLeft(): THREE.Group {
        return this.game.currentColor !== Game.TeamColor.White
            ? this.whitePiecesLeft
            : this.blackPiecesLeft;
    }
    private get currentPiecesSafe(): THREE.Group {
        return this.game.currentColor === Game.TeamColor.White
            ? this.whitePiecesSafe
            : this.blackPiecesSafe;
    }
    private get oppositePiecesSafe(): THREE.Group {
        return this.game.currentColor !== Game.TeamColor.White
            ? this.whitePiecesSafe
            : this.blackPiecesSafe;
    }

    constructor(startPieces: number) {
        super();
        this.game = new Game.Game(startPieces);

        this.name = "Game";

        this.whitePiecesLeft = new THREE.Group();
        this.whitePiecesLeft.name = "WhitePiecesLeft";
        this.whitePiecesLeft.position.set(-4, 0.05, -3);
        this.add(this.whitePiecesLeft);

        this.whitePiecesSafe = new THREE.Group();
        this.whitePiecesSafe.name = "WhitePieceSafe";
        this.whitePiecesSafe.position.set(1, 0.05, -1.6);
        this.add(this.whitePiecesSafe);

        this.blackPiecesLeft = new THREE.Group();
        this.blackPiecesLeft.name = "BlackPieceLeft";
        this.blackPiecesLeft.position.set(3, 0.05, 3);
        this.blackPiecesLeft.rotateY(Math.PI);
        this.add(this.blackPiecesLeft);

        this.blackPiecesSafe = new THREE.Group();
        this.blackPiecesSafe.name = "BlackPieceSafe";
        this.blackPiecesSafe.position.set(1, 0.05, 1.6);
        this.add(this.blackPiecesSafe);

        this.options = new THREE.Group();
        this.options.name = "Options";
        this.options.position.set(-4 * 1.2, 0.65, -1 * 1.2);
        this.add(this.options);

        this.whitePieces = new THREE.Group();
        this.whitePieces.name = "WhitePieces";
        this.whitePieces.position.set(-4 * 1.2, 0.65, -1 * 1.2);
        this.add(this.whitePieces);

        this.blackPieces = new THREE.Group();
        this.blackPieces.name = "BlackPieces";
        this.blackPieces.position.set(-4 * 1.2, 0.65, -1 * 1.2);
        this.add(this.blackPieces);

        const self: GameRenderer = this;

        loadObjects().then(function (): void {
            self.board = models.Board;
            self.add(self.board);

            for (let i: number = 0; i < startPieces; i++) {
                let whitePiece: THREE.Group = models.WhitePiece.clone();
                whitePiece.position.copy(
                    PIECES_LEFT_OFFSET.clone().multiplyScalar(i)
                );
                self.whitePiecesLeft.add(whitePiece);

                let blackPiece: THREE.Group = models.BlackPiece.clone();
                blackPiece.position.copy(
                    PIECES_LEFT_OFFSET.clone().multiplyScalar(i)
                );
                self.blackPiecesLeft.add(blackPiece);
            }

            self.generateOptions();
        });
    }

    generateOptions(): void {
        if (this.game.isOver) {
            return;
        }

        const dice: number = rollDice();
        console.log(
            `Player ${
                this.game.currentColor ? "Black" : "White"
            } rolled a ${dice}`
        );

        const possibleMoves: Game.Move[] = this.game.getPossibleMoves(dice);

        if (possibleMoves.length === 0) {
            this.executeMove(null);
        }

        if (this.game.currentColor === Game.TeamColor.White) {
            this.executeMove(
                possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
            );
            this.generateOptions();
            return;
        }

        for (let i: number = 0; i < possibleMoves.length; i++) {
            const move: Game.Move = possibleMoves[i];
            const space: number = move.field;
            const position: THREE.Vector3 = spaceNumberToPosition(
                this.game.currentColor,
                space
            );

            const option: THREE.Mesh = createOption();
            option.name = "Option";
            option.userData.move = move;
            option.position.copy(position);
            option.rotateX(-Math.PI / 2);

            this.options.add(option);
        }
    }

    executeMove(move?: Game.Move): void {
        this.options.remove(...this.options.children);

        if (move == null) {
            this.generateOptions();
            return;
        }

        const space: number =
            (move instanceof Game.MoveMove
                ? this.game.currentTeam.pieces[move.piece]
                : move instanceof Game.KillMove
                ? this.game.currentTeam.pieces[move.piece]
                : move instanceof Game.SaveMove
                ? this.game.currentTeam.pieces[move.piece]
                : -1) + move.distance;

        if (move instanceof Game.NewMove) {
            // take piece from current left stack
            const piece: THREE.Object3D = this.currentPiecesLeft.children.pop();
            piece.parent = null;
            piece.dispatchEvent({ type: "removed" });

            // put that piece on the board
            this.currentPieces.add(piece);
            piece.position.copy(
                spaceNumberToPosition(this.game.currentColor, space)
            );
        } else if (move instanceof Game.SaveMove) {
            // take piece from board
            const piece: THREE.Object3D = this.currentPieces.children.splice(
                move.piece,
                1
            )[0];
            piece.parent = null;
            piece.dispatchEvent({ type: "removed" });

            // put piece on top the current safe stack
            piece.position
                .copy(PIECES_SAFE_OFFSET)
                .multiplyScalar(this.currentPiecesSafe.children.length);
            this.currentPiecesSafe.add(piece);
        } else if (move instanceof Game.KillMove) {
            // move piece forward
            const piece: THREE.Object3D =
                this.currentPieces.children[move.piece];
            piece.position.copy(
                spaceNumberToPosition(this.game.currentColor, space)
            );

            // take dead piece from the board
            const deadPiece: THREE.Object3D =
                this.oppositePieces.children.splice(move.dyingPiece, 1)[0];
            deadPiece.parent = null;
            deadPiece.dispatchEvent({ type: "removed" });

            // put the dead piece on the left stack
            deadPiece.position
                .copy(PIECES_LEFT_OFFSET)
                .multiplyScalar(this.currentPiecesLeft.children.length);
            deadPiece.parent = this.oppositePiecesLeft;
            this.oppositePiecesLeft.children.unshift(deadPiece);
            deadPiece.dispatchEvent({ type: "added" });
        } else if (move instanceof Game.MoveMove) {
            // move piece forward
            const piece: THREE.Object3D =
                this.currentPieces.children[move.piece];
            piece.position.copy(
                spaceNumberToPosition(this.game.currentColor, space)
            );
        }

        this.game.executeMove(move);
    }
}
