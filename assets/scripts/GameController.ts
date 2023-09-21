import { _decorator, Component, director, EditBox, find, Label, Node } from 'cc'
import { JewelRenderController } from './JewelRenderController'
import { ConfigController } from './ConfigController'
import { JewelsMatrix } from './JewelsMatrix'
import { GameOverController } from './GameOverController'
const { ccclass, property } = _decorator

const MIN_CONNECTED = 2

@ccclass('GameController')
export class GameController extends Component {
    @property(JewelRenderController)
    protected jewelRenderController: JewelRenderController = null
    @property(GameOverController)
    protected gameOverController: GameOverController = null
    @property(Label)
    protected pointsLabel: Label = null
    @property(Label)
    protected movesLabel: Label = null
    @property(Number)
    protected maxMovesNumber: number = 15
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
        director.removePersistRootNode(configController.node)
        director.addPersistRootNode(this.gameOverController.node)
        const h = configController.getHeight()
        const w = configController.getWidth()
        this.colorNumber = configController.getColorNumber()
        this.updatePoints()
        this.updateMoves()
        this.jewelMatrix = new JewelsMatrix(h, w, this.colorNumber, MIN_CONNECTED)
        this.jewelRenderController.init(this, this.jewelMatrix.getMatrix(), h, w)
    }

    public addPoints(points: number): void {
        const calculatedPoints = (1 + points) * points / 2
        this.count += calculatedPoints
        this.updatePoints()
    }

    public async popJewel(row: number, col: number) {
        const diff = this.jewelMatrix.popJewel(row, col)
        if (diff) {
            this.moves += 1
            this.updateMoves()
            this.addPoints(diff.poped.length)
            this.checkIfWinOrLose()
            await this.jewelRenderController.updateMatrix(diff)
            await this.fixIfNotSolvable()
        }
        return diff
    }

    private updatePoints() {
        this.pointsLabel.string = `${this.count} / ${this.pointsToWin}`
    }

    private updateMoves() {
        this.movesLabel.string = `${this.maxMovesNumber - this.moves}`
    }

    private async fixIfNotSolvable() {
        let count = 0
        while (count < this.shuffleCount && !this.jewelMatrix.isSolvable()) {
            await this.jewelRenderController.updateMatrix(this.jewelMatrix.shuffle())
            count++
        }
    }

    private checkIfWinOrLose(): void {
        if (this.count >= this.pointsToWin) {
            this.loadWonScreen()
        } else if (this.moves >= this.maxMovesNumber) {
            this.loadLoseScreen()
        }
    }

    private updateGameOverController(): void {
        this.gameOverController.setPoints(this.count)
        this.gameOverController.setMoves(this.moves)
    }

    private loadWonScreen(): void {
        this.updateGameOverController()
        director.loadScene('WinScene')
    }
    private loadLoseScreen(): void {
        this.updateGameOverController()
        director.loadScene('LoseScene')
    }
}

