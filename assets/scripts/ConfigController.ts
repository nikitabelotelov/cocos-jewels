import { _decorator, Component, director, EditBoxComponent, Node } from 'cc';
const { ccclass, property } = _decorator;

const MAX_JEWEL_NUMBER = 5

@ccclass('ConfigController')
export class ConfigController extends Component {
    @property(EditBoxComponent)
    protected HeightInput: EditBoxComponent | null = null
    @property(EditBoxComponent)
    protected WidthInput: EditBoxComponent | null = null
    @property(EditBoxComponent)
    protected ColorsInput: EditBoxComponent | null = null

    private height: number = 9
    private width: number = 9
    private colors: number = 5
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
        if (this.ColorsInput) {
            this.ColorsInput.string = this.colors.toString()
            this.ColorsInput.node.on(EditBoxComponent.EventType.EDITING_DID_ENDED, this.onColorsInputEnd, this)
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
    private onColorsInputEnd() {
        if (this.ColorsInput) {
            this.colors = Math.min(MAX_JEWEL_NUMBER, parseInt(this.ColorsInput.string))
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
    public getColorNumber() {
        return this.colors
    }
}

