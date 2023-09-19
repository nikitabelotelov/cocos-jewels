import { _decorator, Component, EditBox, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(EditBox)
    protected editBox: EditBox = null;
    @property(Number)
    protected movesNumber: number = 15;
    @property(Number)
    protected pointsToWin: number = 300;
    @property(Number)
    protected colorNumber: number = 5;

    private count: number = 0;

    start() {
        this.editBox.string = this.count.toString();
    }

    update(deltaTime: number) {
        
    }

    public addPoints(points: number): void {
        const calculatedPoints = (1 + points) * points / 2;
        this.count += calculatedPoints;
        this.editBox.string = this.count.toString();
        this.checkIfWin();
    }

    private checkIfWin(): void {
        if (this.count >= this.pointsToWin) {
            console.log('You win!');
        }
    }
}

