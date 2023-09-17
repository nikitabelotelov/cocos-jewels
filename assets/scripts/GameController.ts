import { _decorator, Animation, AnimationClip, Component, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
import { JewelsMatrix, TMatrixDiff } from './JewelsMatrix';
const { ccclass, property } = _decorator;

const SPRITE_SIZE = 64

@ccclass('GameController')
export class GameController extends Component {
    @property(Number)
    protected H: number = 9
    @property(Number)
    protected W: number = 5
    @property(Prefab)
    protected jewels: Prefab[] = [];

    private jewelMatrix: JewelsMatrix;
    private jewelNodes: { onPop: () => void, node: Node }[][] = [];

    start() {
        this.jewelMatrix = new JewelsMatrix(this.H, this.W, this.jewels.length, this.jewels.length);
        this.createMatrix();
    }

    createMatrix() {
        this.jewelNodes = [];
        for (let i = 0; i < this.H; i++) {
            this.jewelNodes[i] = [];
        }
        const renderMatrix = this.jewelMatrix.getMatrix();
        for (let i = this.H - 1; i >= 0; i--) {
            for (let j = 0; j < this.W; j++) {
                const node = instantiate(this.jewels[renderMatrix[i][j]])
                node.addComponent(Animation)
                node.setPosition(this.getJewelPosition(i, j))
                this.jewelNodes[i][j] = {
                    node: node,
                    onPop: () => {
                        const diff = this.jewelMatrix.popJewel(i, j)
                        this.updateMatrix(diff)
                    }
                }
                node.on(Node.EventType.MOUSE_DOWN, this.jewelNodes[i][j].onPop)
                this.node.addChild(node)
            }
        }
    }

    updateMatrix(diff: TMatrixDiff) {
        diff.poped.forEach(([row, col]) => {
            this.jewelNodes[row][col].node.destroy()
        })
        diff.moved.forEach((el) => {
            const node = this.jewelNodes[el.from[0]][el.from[1]].node
            tween(node).to(0.5, { position: this.getJewelPosition(el.to[0], el.to[1]) }).start()
            this.jewelNodes[el.to[0]][el.to[1]].node = node
            this.jewelNodes[el.to[0]][el.to[1]].onPop = this.getJewelPopHandler(el.to[0], el.to[1])
            node.off(Node.EventType.MOUSE_DOWN, this.jewelNodes[el.from[0]][el.from[1]].onPop)
            node.on(Node.EventType.MOUSE_DOWN, this.jewelNodes[el.to[0]][el.to[1]].onPop)
        })
        diff.added.forEach((addedJewels) => {
            addedJewels.forEach((addedJewel, i) => {
                const node = instantiate(this.jewels[addedJewel.color])
                node.setPosition(this.getJewelPosition(-addedJewels.length + i, addedJewel.col))
                tween(node).to(0.5, { position: this.getJewelPosition(addedJewel.row, addedJewel.col) }).start()
                this.jewelNodes[addedJewel.row][addedJewel.col].onPop = this.getJewelPopHandler(addedJewel.row, addedJewel.col)
                node.on(Node.EventType.MOUSE_DOWN, this.jewelNodes[addedJewel.row][addedJewel.col].onPop)
                this.jewelNodes[addedJewel.row][addedJewel.col].node = node;
                this.node.addChild(node)
            })
        })
    }

    private getJewelPosition(row: number, col: number) {
        return new Vec3(-(this.W * SPRITE_SIZE) / 2 + SPRITE_SIZE * col + SPRITE_SIZE / 2,
            (this.H * SPRITE_SIZE) / 2 - SPRITE_SIZE * row - SPRITE_SIZE / 2,
            0);
    }

    private getJewelPopHandler(row: number, col: number) {
        return () => {
            const diff = this.jewelMatrix.popJewel(row, col)
            this.updateMatrix(diff)
        }
    }

    update(deltaTime: number) {

    }
}

