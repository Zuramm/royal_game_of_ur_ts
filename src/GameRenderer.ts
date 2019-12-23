import * as THREE from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { MTLLoader, MaterialCreator } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import * as Game from './Game';

const objects = {
    'Board': new THREE.Group(),
    'WhitePiece': new THREE.Group(),
    'BlackPiece': new THREE.Group(),
};

const PIECES_LEFT_OFFSET = new THREE.Vector3(.8, 0, 0);
const PIECES_SAFE_OFFSET = new THREE.Vector3(0, 0.1, 0);

async function loadObjects() {
    const manager = new THREE.LoadingManager();
					manager.addHandler( /\.dds$/i, new DDSLoader() );

	const onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round( percentComplete * 100 ) / 100 + '% downloaded' );
		}
	};

	const mtlLoader = new MTLLoader( manager )
		.setPath( 'models/' );

	await Promise.all(Object.keys(objects).map((name) => new Promise(
		async function (res) {
			const materials: MaterialCreator = await new Promise( (res, rej) => mtlLoader.load( `${name}.mtl`, res, onProgress, rej ) );
			materials.preload();

			const object: THREE.Group = await new Promise((res, rej) => new OBJLoader( manager )
				.setMaterials( materials )
				.setPath( 'models/' )
				.load( `${name}.obj`, res, onProgress, rej ));
		
			object.children.forEach( e => { 
                e.castShadow = true; 
                e.receiveShadow = true; 

                objects[name].add(e);
            } );

			res();
		})));

}

const optionMaterial = new THREE.MeshBasicMaterial({
    color: 0x67eb34,
    transparent: true,
    opacity: 0.5,
});
const optionGeometry = new THREE.PlaneGeometry(0.8, 0.8);

function createOption(): THREE.Mesh {
    return new THREE.Mesh(optionGeometry, optionMaterial);
}

function spaceNumberToPosition(team: Game.TeamColor, space: number): THREE.Vector3 {
    if (space < 4) {
        return new THREE.Vector3(3 - space, 0, team * 2);
    }
    else if (space < 12) {
        return new THREE.Vector3(space - 4, 0, 1);
    }
    else {
        return new THREE.Vector3(6 - (space - 12), 0, team * 2);
    }
}

const rollDice = () => Math.round(Math.random()) + Math.round(Math.random()) + Math.round(Math.random()) + Math.round(Math.random());

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
    // TODO: show dice roll
    // TODO: show current team playing

    private get currentPieces() { return this.game.currentColor == Game.TeamColor.White ? this.whitePieces : this.blackPieces }
    private get oppositePieces() { return this.game.currentColor != Game.TeamColor.White ? this.whitePieces : this.blackPieces }
    private get currentPiecesLeft() { return this.game.currentColor == Game.TeamColor.White ? this.whitePiecesLeft : this.blackPiecesLeft }
    private get currentPiecesSafe() { return this.game.currentColor == Game.TeamColor.White ? this.whitePiecesSafe : this.blackPiecesSafe }

    constructor(startPieces) {
        super();
        this.game = new Game.Game(startPieces);

        this.whitePiecesLeft = new THREE.Group();
        this.whitePiecesLeft.position.set(-4, 0.05, -3);
        this.add(this.whitePiecesLeft);
        
        this.whitePiecesSafe = new THREE.Group();
        this.whitePiecesSafe.position.set(1, 0.05, -1);
        this.add(this.whitePiecesSafe);

        this.blackPiecesLeft = new THREE.Group();
        this.blackPiecesLeft.position.set(3, 0.05, 3);
        this.blackPiecesLeft.rotateY(Math.PI);
        this.add(this.blackPiecesLeft);
        
        this.blackPiecesSafe = new THREE.Group();
        this.blackPiecesSafe.position.set(1, 0.05, 1);
        this.add(this.blackPiecesSafe);

        this.options = new THREE.Group();
        this.options.position.set(-4, 0.65, -1);
        this.add(this.options);

        this.whitePieces = new THREE.Group;
        this.whitePieces.position.set(-4, 0.65, -1);
        this.add(this.whitePieces);

        this.blackPieces = new THREE.Group;
        this.blackPieces.position.set(-4, 0.65, -1);
        this.add(this.blackPieces);

        const self = this;

        loadObjects().then(function () {
            self.board = objects.Board;
            self.add(self.board);

            for (let i = 0; i < startPieces; i++) {
                let whitePiece = objects.WhitePiece.clone();
                whitePiece.position.copy(PIECES_LEFT_OFFSET.clone().multiplyScalar(i));
                self.whitePiecesLeft.add(whitePiece);
    
                let blackPiece = objects.BlackPiece.clone();
                blackPiece.position.copy(PIECES_LEFT_OFFSET.clone().multiplyScalar(i));
                self.blackPiecesLeft.add(blackPiece);
            }            

            self.generateOptions();
        })
    }

    generateOptions() {
        const dice = rollDice();
        console.log(dice);

        const possibleMoves = this.game.getPossibleMoves(dice);

        if (possibleMoves.length == 0) {
            this.executeMove(null);
        }

        for (let i = 0; i < possibleMoves.length; i++) {
            const move = possibleMoves[i];
            const space = (
                move instanceof Game.MoveMove ? this.game.currentTeam.pieces[move.piece] :
                move instanceof Game.KillMove ? this.game.currentTeam.pieces[move.piece] :
                move instanceof Game.SaveMove ? this.game.currentTeam.pieces[move.piece] : 
                -1) + move.distance;
            const position = spaceNumberToPosition(this.game.currentColor, space);

            const option = createOption();
            option.name = 'Option';
            option.userData['move'] = move;
            option.position.copy(position);
            option.rotateX(-Math.PI / 2);

            this.options.add(option);
        }
    }

    executeMove(move?: Game.Move) {
        this.options.remove(...this.options.children);

        if (move == null) {
            this.generateOptions();
            return;
        }

        const space = (
            move instanceof Game.MoveMove ? this.game.currentTeam.pieces[move.piece] :
            move instanceof Game.KillMove ? this.game.currentTeam.pieces[move.piece] :
            move instanceof Game.SaveMove ? this.game.currentTeam.pieces[move.piece] : 
            -1) + move.distance;

        if (move instanceof Game.NewMove) {
            const pieceLeft = this.game.currentColor == Game.TeamColor.White ? this.whitePiecesLeft : this.blackPiecesLeft;
            const piece = this.currentPiecesLeft.children.pop();
            piece.position.copy(spaceNumberToPosition(this.game.currentColor, space));

            this.currentPieces.add(piece);
        }
        else if (move instanceof Game.SaveMove) {
            const piece = this.currentPieces.children.splice(move.piece, 1)[0];
            piece.position.copy(PIECES_SAFE_OFFSET.clone().multiplyScalar(this.currentPieces.children.length));
            piece.position.y = this.currentPiecesSafe.children.length * PIECES_SAFE_OFFSET.y

            this.currentPiecesSafe.add(piece);
        }
        else if (move instanceof Game.KillMove) {
            const piece = this.currentPieces.children[move.piece];
            piece.position.copy(spaceNumberToPosition(this.game.currentColor, space));
            this.oppositePieces.children.splice(move.dyingPiece, 1);
        }
        else if (move instanceof Game.MoveMove) {
            const piece = this.currentPieces.children[move.piece];
            piece.position.copy(spaceNumberToPosition(this.game.currentColor, space));
        }

        this.game.executeMove(move);
    }
}
