export enum GameStatus {
    InProgress,
    CashedOut,
    Busted,
    Idle,
}

export type Block = {
    isBomb: boolean;
    isRevealed: boolean;
};

export type Level = Block[];

export class GameState {
    public layoutBlocks: number[] = [6, 5, 4, 3, 4, 5, 6, 5, 4, 3, 4, 5, 6, 5, 4, 3, 4, 5, 6, 5, 4, 3, 4, 5, 6];
    public multipliers: number[] = [
        1.10, 1.32, 1.59, 1.91, 2.29, 2.74, 3.28, 3.93, 4.71, 5.65,
        6.78, 8.14, 9.77, 11.72, 14.06, 16.87, 20.24, 24.29, 29.15,
        34.98, 41.97, 50.36, 60.43, 72.52, 380.00
    ];
    
    public board: Level[] = [];
    public status: GameStatus = GameStatus.Idle;
    public currentLevel: number = 0;
    public currentMultiplier: number = 1.0;
    public betAmount: number = 1.0;

    constructor(betAmount: number) {
        this.betAmount = betAmount;
        this.start();
    }

    start() {
        this.status = GameStatus.InProgress;
        this.currentLevel = 0;
        this.currentMultiplier = 1.0;
        this.board = this.layoutBlocks.map(numBlocks => {
            const bombIndex = Math.floor(Math.random() * numBlocks);
            return Array.from({ length: numBlocks }, (_, i) => ({ 
                isBomb: i === bombIndex, 
                isRevealed: false 
            }));
        });
    }

    reveal(levelIndex: number, blockIndex: number): boolean {
        if (this.status !== GameStatus.InProgress || levelIndex !== this.currentLevel) {
            return false;
        }

        const block = this.board[levelIndex][blockIndex];
        block.isRevealed = true;

        if (block.isBomb) {
            this.status = GameStatus.Busted;
            this.board.forEach(level => level.forEach(b => { if(b.isBomb) b.isRevealed = true; }));
            return false;
        }

        this.currentMultiplier = this.multipliers[this.currentLevel];
        this.currentLevel++;

        if (this.currentLevel >= this.layoutBlocks.length) {
            this.status = GameStatus.CashedOut;
        }

        return true;
    }

    cashOut() {
        if (this.status !== GameStatus.InProgress) {
            return 0;
        }
        this.status = GameStatus.CashedOut;
        return this.betAmount * this.currentMultiplier;
    }
}