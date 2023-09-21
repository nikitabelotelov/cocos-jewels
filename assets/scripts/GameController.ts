import { _decorator, Component, director, EditBox, find, Node } from 'cc'
import { JewelRenderController } from './JewelRenderController'
import { ConfigController } from './ConfigController'
import { JewelsMatrix } from './JewelsMatrix'
const { ccclass, property } = _decorator

const MIN_CONNECTED = 5

@ccclass('GameController')
export class GameController extends Component {
    @property(JewelRenderController)
    protected jewelRenderController: JewelRenderController = null
    @property(EditBox)
    protected editBox: EditBox = null
    @property(Number)
    protected movesNumber: number = 15
    @property(Number)
    protected pointsToWin: number = 300
    @property(Number)
    protected colorNumber: number = 5
    @property(Number)
    protected shuffleCount: number = 2

    private jewelMatrix: JewelsMatrix = null
    private moves: number = 0

    private count: number = 0

    start() {
        const configController = find('ConfigController').getComponent<ConfigController>(ConfigController)
        const h = configController.getHeight()
        const w = configController.getWidth()
        this.colorNumber = configController.getColorNumber()
        this.editBox.string = this.count.toString()
        this.jewelMatrix = new JewelsMatrix(h, w, this.colorNumber, MIN_CONNECTED)
        this.jewelRenderController.init(this, this.jewelMatrix.getMatrix(), h, w)
    }

    public addPoints(points: number): void {
        const calculatedPoints = (1 + points) * points / 2
        this.count += calculatedPoints
        this.editBox.string = this.count.toString()
        this.checkIfWin()
    }

    public async popJewel(row: number, col: number) {
        const diff = this.jewelMatrix.popJewel(row, col)
        if (diff) {
            this.moves += 1
            this.addPoints(diff.poped.length)
            await this.jewelRenderController.updateMatrix(diff)
            await this.fixIfNotSolvable()
        }
        return diff
    }

    private async fixIfNotSolvable() {
        let count = 0
        while (count < this.shuffleCount && !this.jewelMatrix.isSolvable()) {
            await this.jewelRenderController.updateMatrix(this.jewelMatrix.shuffle())
            count++
        }
    }

    private checkIfWin(): void {
        if (this.count >= this.pointsToWin) {
            console.log('You win!')
        }
    }
    private loadWonScreen(): void {
        director.loadScene('WonScene')
    }
    private loadLoseScreen(): void {
        director.loadScene('LoseScene')
    }
}

