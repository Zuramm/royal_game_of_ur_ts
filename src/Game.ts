export type Field =
    | -1
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14;

export enum TeamColor {
    White = 0,
    Black = 1,
}

export class Team {
    public piecesLeft: number;
    public piecesSafe: number = 0;
    public pieces: Field[] = [];

    constructor(startPieces: number) {
        this.piecesLeft = startPieces;
    }

    public addPiece(piece: Field): void {
        this.piecesLeft--;
        this.pieces.push(piece);
    }

    public killPiece(n: number): void {
        this.piecesLeft++;
        this.pieces.splice(n, 1);
    }

    public safePiece(n: number): void {
        this.piecesSafe++;
        this.pieces.splice(n, 1); // remove piece from board
    }

    public isPieceOnField(field: Field): boolean {
        return this.pieces.indexOf(field) >= 0;
    }

    public getPieceOnField(field: Field): number {
        return this.pieces.indexOf(field);
    }
}

export abstract class Move {
    constructor(public field: Field, public distance: number) {}
}

export class NewMove extends Move {
    constructor(distance: number) {
        super(-1, distance);
    }
}

export class MoveMove extends Move {
    constructor(public field: Field, distance: number, public piece: number) {
        super(field, distance);
    }
}

export class KillMove extends Move {
    constructor(
        public field: Field,
        distance: number,
        public piece: number,
        public dyingPiece: number
    ) {
        super(field, distance);
    }
}

export class SaveMove extends Move {
    constructor(public field: Field, distance: number, public piece: number) {
        super(field, distance);
    }
}

export class Game {
    public static DICE: number = 5;
    public static SAFE_START: number = 4;
    public static COMBAT: number = 12;
    public static SAFE_END: number = 14;

    private static isInCombatZone(field: Field): boolean {
        return field >= this.SAFE_START && field < this.COMBAT;
    }

    private static isFieldStar(field: Field): boolean {
        return field === 3 || field === 7 || field === 13;
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

    public get isOver(): boolean {
        return (
            this.teams[0].piecesSafe === this.startPieces ||
            this.teams[1].piecesSafe === this.startPieces
        );
    }

    constructor(private startPieces: number) {
        this.teams = [new Team(startPieces), new Team(startPieces)];
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

    private isFieldOccupied(field: Field): boolean {
        return this.teams.some((team) => team.isPieceOnField(field));
    }

    public getPossibleMoves(roll: number): Move[] {
        const moves: Move[] = [];

        if (roll === 0 || this.isOver) {
            return moves;
        }

        const team: Team = this.currentTeam;
        const otherTeam: Team = this.oppositeTeam;

        // can you move one piece out?
        const left: number = team.piecesLeft;
        console.log(`left: ${left}`);
        if (left > 0 && !team.isPieceOnField((roll - 1) as Field)) {
            moves.push(new NewMove(roll));
        }

        for (let pieceId: number = 0; pieceId < team.pieces.length; pieceId++) {
            const newSpace: number = team.pieces[pieceId] + roll;

            if (newSpace === 14) {
                moves.push(new SaveMove(team.pieces[pieceId], roll, pieceId));
                continue;
            }

            if (
                newSpace > 14 ||
                (newSpace === 7 && this.oppositeTeam.isPieceOnField(7))
            ) {
                continue;
            }

            if (!team.isPieceOnField(newSpace as Field)) {
                const enemy: number = otherTeam.getPieceOnField(
                    newSpace as Field
                );
                if (Game.isInCombatZone(newSpace as Field) && enemy >= 0) {
                    moves.push(
                        new KillMove(team.pieces[pieceId], roll, pieceId, enemy)
                    );
                } else {
                    moves.push(
                        new MoveMove(team.pieces[pieceId], roll, pieceId)
                    );
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
            team.addPiece((move.distance - 1) as Field);

            if (!Game.isFieldStar((move.distance - 1) as Field)) {
                this.toggleTeam();
            }
        } else {
            if (move instanceof SaveMove) {
                team.safePiece(move.piece);
                this.toggleTeam();
            } else if (move instanceof KillMove) {
                team.pieces[move.piece] += move.distance;
                otherTeam.killPiece(move.dyingPiece);
                this.toggleTeam();
            } else if (move instanceof MoveMove) {
                team.pieces[move.piece] += move.distance;
                if (!Game.isFieldStar(team.pieces[move.piece] as Field)) {
                    this.toggleTeam();
                }
            }
        }
    }
}
