import { _decorator, Component, director, EditBoxComponent, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ConfigController')
export class ConfigController extends Component {
    @property(EditBoxComponent)
    protected HeightInput: EditBoxComponent | null = null
    @property(EditBoxComponent)
    protected WidthInput: EditBoxComponent | null = null

    private height: number = 9
    private width: number = 9
    start() {
        director.addPersistRootNode(this.node)
        if (this.HeightInput) {
            this.HeightInput.string = this.height.toString()
            this.HeightInput.node.on(EditBoxComponent.EventType.EDITING_DID_ENDED, this.onHeightInputEnd, this)
        }
        if (this.WidthInput) {
            this.WidthInput.string = this.width.toString()
            this.WidthInput.node.on(EditBoxComponent.EventType.EDITING_DID_ENDED, this.onWidthInputEnd, this)
        }
    }
    private onHeightInputEnd() {
        if (this.HeightInput) {
            this.height = parseInt(this.HeightInput.string)
        }
    }
    private onWidthInputEnd() {
        if (this.WidthInput) {
            this.width = parseInt(this.WidthInput.string)
        }
    }
    public startGame() {
        director.loadScene('GameScene')
    }
    public getHeight() {
        return this.height
    }
    public getWidth() {
        return this.width
    }

}

