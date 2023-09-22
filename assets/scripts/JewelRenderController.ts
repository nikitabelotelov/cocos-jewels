import { _decorator, Animation, AnimationClip, Component, find, instantiate, Node, Prefab, Size, tween, UITransform, Vec3 } from 'cc'
import { TMatrixDiff } from './JewelsMatrix'
import { GameController } from './GameController'
const { ccclass, property } = _decorator

const SPRITE_SIZE = 64

type TJewelNode = {
    onPop: () => void,
    node: Node
}

@ccclass('JewelRenderController')
export class JewelRenderController extends Component {
    protected H: number = 9
    protected W: number = 5
    protected gameController: GameController = null
    @property(Prefab)
    protected jewels: Prefab[] = []
    @property(UITransform)
    protected field: UITransform = null

    private jewelNodes: TJewelNode[][] = []

    public init(gameController: GameController, jewelMatrix: number[][], h: number, w: number) {
        this.H = h
        this.W = w
        this.initField()
        this.gameController = gameController
        this.createMatrix(jewelMatrix)
    }

    private initField() {
        this.field.getComponent(UITransform)
            .setContentSize(new Size(this.W * SPRITE_SIZE + 32, this.H * SPRITE_SIZE + 32))
    }

    private getEmptyJewelNodes() {
        const jewelNodes: TJewelNode[][] = []
        for (let i = 0; i < this.H; i++) {
            jewelNodes[i] = []
        }
        return jewelNodes
    }

    private copyJewelNodes() {
        const jewelNodes = this.getEmptyJewelNodes()
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.W; j++) {
                jewelNodes[i][j] = this.jewelNodes[i][j]
            }
        }
        return jewelNodes
    }

    createMatrix(jewelMatrix: number[][]) {
        this.jewelNodes = this.getEmptyJewelNodes()
        for (let i = this.H - 1; i >= 0; i--) {
            for (let j = 0; j < this.W; j++) {
                const node = instantiate(this.jewels[jewelMatrix[i][j]])
                node.addComponent(Animation)
                node.setPosition(this.getJewelPosition(i, j))
                this.jewelNodes[i][j] = {
                    node: node,
                    onPop: this.getJewelPopHandler(i, j)
                }
                node.on(Node.EventType.MOUSE_DOWN, this.jewelNodes[i][j].onPop)
                this.node.addChild(node)
            }
        }
    }

    public updateMatrix(diff: TMatrixDiff) {
        const promises: Promise<void>[] = []
        const oldJewelNodes = this.jewelNodes
        const newJewelNodes = this.copyJewelNodes()
        diff.poped.forEach(([row, col]) => {
            promises.push(this.tweenJewelPop(oldJewelNodes[row][col].node).then(() => {
                oldJewelNodes[row][col].node.destroy()
            }))
        })
        diff.moved.forEach((el) => {
            const node = oldJewelNodes[el.from[0]][el.from[1]].node
            promises.push(this.tweenJewel(node, el.to[0], el.to[1]))
            newJewelNodes[el.to[0]][el.to[1]] = {
                node: node,
                onPop: this.getJewelPopHandler(el.to[0], el.to[1])
            }
            node.off(Node.EventType.MOUSE_DOWN, oldJewelNodes[el.from[0]][el.from[1]].onPop)
            node.on(Node.EventType.MOUSE_DOWN, newJewelNodes[el.to[0]][el.to[1]].onPop)
        })
        diff.added.forEach((addedJewels) => {
            addedJewels.forEach((addedJewel, i) => {
                const node = instantiate(this.jewels[addedJewel.color])
                node.setPosition(this.getJewelPosition(-addedJewels.length + i, addedJewel.col))
                promises.push(this.tweenJewel(node, addedJewel.row, addedJewel.col))
                newJewelNodes[addedJewel.row][addedJewel.col] = {
                    node: node,
                    onPop: this.getJewelPopHandler(addedJewel.row, addedJewel.col)
                }
                node.on(Node.EventType.MOUSE_DOWN, newJewelNodes[addedJewel.row][addedJewel.col].onPop)
                this.node.addChild(node)
            })
        })
        this.jewelNodes = newJewelNodes
        this.reorderChildren()
        return Promise.all(promises)
    }

    private getJewelPosition(row: number, col: number) {
        return new Vec3(-(this.W * SPRITE_SIZE) / 2 + SPRITE_SIZE * col + SPRITE_SIZE / 2,
            (this.H * SPRITE_SIZE) / 2 - SPRITE_SIZE * row - SPRITE_SIZE / 2,
            0)
    }

    private tweenJewel(node: Node, row: number, col: number): Promise<void> {
        return new Promise(resolve => {
            tween(node)
                .to(0.5, { position: this.getJewelPosition(row, col) }, { easing: "cubicIn" })
                .call(resolve)
                .start()
        })
    }

    private tweenJewelPop(node: Node): Promise<void> {
        return new Promise(resolve => {
            tween(node)
                .to(0.3, { scale: new Vec3(0, 0, 0) })
                .call(resolve)
                .start()
        })
    }

    private getJewelPopHandler(row: number, col: number) {
        return async () => {
            await this.gameController.popJewel(row, col)
        }
    }

    private reorderChildren() {
        for (let i = this.H - 1; i >= 0; i--) {
            for (let j = this.W - 1; j >= 0; j--) {
                this.node.removeChild(this.jewelNodes[i][j].node)
                this.node.addChild(this.jewelNodes[i][j].node)
            }
        }
    }
}

