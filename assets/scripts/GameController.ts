import { _decorator, Button, Component, director, EditBox, find, Label, Node } from 'cc'
import { JewelRenderController } from './JewelRenderController'
import { ConfigController } from './ConfigController'
import { JewelsMatrix, TMatrixDiff } from './JewelsMatrix'
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
    @property(Label)
    protected bombLabel: Label = null
    @property(Label)
    protected bombActivatedLabel: Label = null
    @property(Number)
    protected bombRadius: number = 3
    @property(Number)
    protected bombNumber: number = 1
    @property(Number)
    protected maxMovesNumber: number = 15
    @property(Number)
    protected colorNumber: number = 5
    @property(Number)
    protected shuffleCount: number = 2
    
    protected pointsToWin: number = 300
    private jewelMatrix: JewelsMatrix = null
    private moves: number = 0
    private bombActivated: boolean = false

    private count: number = 0

    start() {
        const configController = find('ConfigController').getComponent<ConfigController>(ConfigController)
        director.removePersistRootNode(configController.node)
        director.addPersistRootNode(this.gameOverController.node)
        const h = configController.getHeight()
        const w = configController.getWidth()
        this.colorNumber = configController.getColorNumber()
        this.pointsToWin = Math.floor(h * w * 10 / (Math.pow(this.colorNumber, 4) / 125))
        this.updatePoints()
        this.updateMoves()
        this.updateBomb()
        this.jewelMatrix = new JewelsMatrix(h, w, this.colorNumber, MIN_CONNECTED)
        this.jewelRenderController.init(this, this.jewelMatrix.getMatrix(), h, w)
    }

    public addPoints(points: number): void {
        const calculatedPoints = (1 + points) * points / 2
        this.count += calculatedPoints
        this.updatePoints()
    }

    public addMove() {
        this.moves += 1
        this.updateMoves()
    }

    public async popJewel(row: number, col: number) {
        let diff: TMatrixDiff | null = null
        if (this.bombActivated) {
            diff = this.jewelMatrix.popInRadius(row, col, this.bombRadius)
            this.bombNumber -= this.bombNumber
            this.updateBomb()
        } else {
            diff = this.jewelMatrix.popJewel(row, col)
        }
        if (diff) {
            this.addMove()
            if (!this.bombActivated) {
                this.addPoints(diff.poped.length)
            }
            await this.jewelRenderController.updateMatrix(diff)
            await this.fixIfNotSolvable()
            this.checkIfWinOrLose()
        }
        this.bombActivated = false
        this.updateBombActivated()
        return diff
    }

    private updatePoints() {
        this.pointsLabel.string = `${this.count} / ${this.pointsToWin}`
    }

    private updateMoves() {
        this.movesLabel.string = `${this.maxMovesNumber - this.moves}`
    }

    private updateBomb() {
        this.bombLabel.string = `${this.bombNumber}`
    }

    private updateBombActivated() {
        this.bombActivatedLabel.enabled = this.bombActivated
    }

    private async fixIfNotSolvable() {
        let count = 0
        while (count < this.shuffleCount && !this.jewelMatrix.isSolvable()) {
            await this.jewelRenderController.updateMatrix(this.jewelMatrix.shuffle())
            count++
        }
        if (!this.jewelMatrix.isSolvable()) {
            this.loadLoseScreen()
        }
    }

    private checkIfWinOrLose(): void {
        if (this.count >= this.pointsToWin) {
            this.loadWonScreen()
        } else if (this.moves >= this.maxMovesNumber) {
            this.loadLoseScreen()
        }
    }

    public toggleBomb() {
        if (this.bombNumber) {
            this.bombActivated = !this.bombActivated
            this.updateBombActivated()
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

