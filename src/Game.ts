export enum TeamColor {
    White = 0,
    Black = 1
}

export class Team {
    public piecesLeft: number;
    public piecesSafe: number = 0;
    public pieces: number[] = [];

    constructor(startPieces: number) {
        this.piecesLeft = startPieces;
    }

    public addPiece(piece: number): void {
        this.pieces.push(piece);
    }

    public killPiece(n: number): void {
        this.pieces.splice(n, 1);
    }

    public isPieceOnSpace(space: number): boolean {
        return this.pieces.indexOf(space) >= 0;
    }

    public getPieceOnSpace(space: number): number {
        return this.pieces.indexOf(space);
    }
}

export abstract class Move {
    constructor(public distance: number) {}
}

export class NewMove extends Move {
    constructor(distance: number) {
        super(distance);
    }
}

export class MoveMove extends Move {
    constructor(distance: number, public piece: number) {
        super(distance);
    }
}

export class KillMove extends Move {
    constructor(distance: number, public piece: number, public dyingPiece: number) {
        super(distance);
    }
}

export class SaveMove extends Move {
    constructor(distance: number, public piece: number) {
        super(distance);
    }
}

export class Game {
    public static DICE: number = 5;
    public static SAFE_START: number = 4;
    public static COMBAT: number = 12;
    public static SAFE_END: number = 14;

    private static isInCombatZone(space: number): boolean {
        return space >= this.SAFE_START && space < this.COMBAT;
    }

    private static isSpaceStar(space: number): boolean {
        return space === 3 || space === 7 || space === 13;
    }

    public currentColor: TeamColor = TeamColor.White;
    public teams: Team[];

    public get currentTeam(): Team {
        return this.teams[this.currentColor];
    }

    public set currentTeam(value: Team) {
        this.teams[this.currentColor] = value;
    }

    public get oppositeTeam(): Team {
        return this.teams[this.currentColor === 1 ? 0 : 1];
    }

    public set oppositeTeam(value: Team) {
        this.teams[this.currentColor === 1 ? 0 : 1] = value;
    }

    constructor(private startPieces: number) {
        this.teams = [
            new Team(startPieces),
            new Team(startPieces)
        ];
    }

    public isGameOver(): boolean {
        return this.teams[0].piecesSafe === this.startPieces || this.teams[1].piecesSafe === this.startPieces;
    }

    private toggleTeam(): void {
        switch (this.currentColor) {
            case TeamColor.White:
                this.currentColor = TeamColor.Black;
                break;
            case TeamColor.Black:
                this.currentColor = TeamColor.White;
                break;
        }
    }

    private isFieldOccupied(space: number): boolean {
        return this.teams.some(team => team.isPieceOnSpace(space));
    }

    public getPossibleMoves(roll: number): Move[] {
        const moves: Move[] = [];

        if (roll === 0) {
            return moves;
        }

        const team: Team = this.currentTeam;
        const otherTeam: Team = this.oppositeTeam;

        // can you move one piece out?
        const left: number = team.piecesLeft;
        if (left > 0 && !team.isPieceOnSpace(roll - 1)) {
            moves.push(new NewMove(roll));
        }

        for (let pieceId: number = 0; pieceId < team.pieces.length; pieceId++) {
            const newSpace: number = team.pieces[pieceId] + roll;

            if (newSpace === 14) {
                moves.push(new SaveMove(roll, pieceId));
            }

            if (newSpace >= 13 || newSpace === 7 && this.oppositeTeam.isPieceOnSpace(7)) {
                continue;
            }

            if (!team.isPieceOnSpace(newSpace)) {
                const enemy: number = otherTeam.getPieceOnSpace(newSpace);
                if (Game.isInCombatZone(newSpace) && enemy >= 0) {
                    moves.push(new KillMove(roll, pieceId, enemy));
                } else {
                    moves.push(new MoveMove(roll, pieceId));
                }
            }
        }

        return moves;
    }

    public executeMove(move?: Move): void {
        if (move == null) {
            this.toggleTeam();
            return;
        }

        const team: Team = this.currentTeam;
        const otherTeam: Team = this.oppositeTeam;

        if (move instanceof NewMove) {
            team.addPiece(move.distance - 1);

            if (!Game.isSpaceStar(move.distance - 1)) {
                this.toggleTeam();
            }

        } else {
            if (move instanceof SaveMove) {
                team.killPiece(move.piece);
                team.piecesSafe++;
                this.toggleTeam();
            } else if (move instanceof KillMove) {
                team.pieces[move.piece] += move.distance;
                otherTeam.killPiece(move.dyingPiece);
                this.toggleTeam();
            } else if (move instanceof MoveMove) {
                team.pieces[move.piece] += move.distance;
                if (!Game.isSpaceStar(team.pieces[move.piece])) {
                    this.toggleTeam();
                }
            }
        }
    }
}