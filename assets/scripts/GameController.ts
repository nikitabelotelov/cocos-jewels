import { _decorator, Component, EditBox, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(EditBox)
    protected editBox: EditBox = null;

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
    }

}

