import { _decorator, Animation, AnimationClip, Component, find, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
import { JewelsMatrix, TMatrixDiff } from './JewelsMatrix';
import { ConfigController } from './ConfigController';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

const SPRITE_SIZE = 64
const MIN_CONNECTED = 2

type TJewelNode = {
    onPop: () => void,
    node: Node
}

@ccclass('JewelRenderController')
export class JewelRenderController extends Component {
    @property(Number)
    protected H: number = 9
    @property(Number)
    protected W: number = 5
    protected shuffleCount: number = 2
    @property(Prefab)
    protected jewels: Prefab[] = [];
    @property(GameController)
    protected gameController: GameController = null;

    private jewelMatrix: JewelsMatrix;
    private jewelNodes: TJewelNode[][] = [];

    start() {
        const configController = find('ConfigController').getComponent<ConfigController>(ConfigController)
        this.H = configController.getHeight()
        this.W = configController.getWidth()
        this.jewelMatrix = new JewelsMatrix(this.H, this.W, this.jewels.length, MIN_CONNECTED);
        this.createMatrix();
    }

    private getEmptyJewelNodes() {
        const jewelNodes: TJewelNode[][] = [];
        for (let i = 0; i < this.H; i++) {
            jewelNodes[i] = [];
        }
        return jewelNodes;
    }

    private copyJewelNodes() {
        const jewelNodes = this.getEmptyJewelNodes();
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.W; j++) {
                jewelNodes[i][j] = this.jewelNodes[i][j];
            }
        }
        return jewelNodes;
    }

    createMatrix() {
        this.jewelNodes = this.getEmptyJewelNodes();
        const renderMatrix = this.jewelMatrix.getMatrix();
        for (let i = this.H - 1; i >= 0; i--) {
            for (let j = 0; j < this.W; j++) {
                const node = instantiate(this.jewels[renderMatrix[i][j]])
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

    updateMatrix(diff: TMatrixDiff) {
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
            0);
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
            const diff = this.jewelMatrix.popJewel(row, col)
            if (diff) {
                this.gameController.addPoints(diff.poped.length)
                await this.updateMatrix(diff)
                await this.fixIfNotSolvable();
            }
        }
    }

    private async fixIfNotSolvable() {
        let count = 0;
        while (count < this.shuffleCount && !this.jewelMatrix.isSolvable()) {
            await this.updateMatrix(this.jewelMatrix.shuffle())
            count++;
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

    update(deltaTime: number) {

    }
}

