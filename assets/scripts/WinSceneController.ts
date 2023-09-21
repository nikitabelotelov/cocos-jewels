import { _decorator, Button, Component, find, Label, Node } from 'cc';
import { GameOverController } from './GameOverController';
const { ccclass, property } = _decorator;

@ccclass('WinSceneController')
export class WinSceneController extends Component {
    @property(Label)
    protected pointsLabel: Label = null
    @property(Label)
    protected movesLabel: Label = null
    @property(Button)
    protected restartButton: Button = null
    start() {
        const gameOverController = find('GameOverController').getComponent<GameOverController>(GameOverController)
        this.pointsLabel.string = gameOverController.getPoints().toString()
        this.movesLabel.string = gameOverController.getMoves().toString()
        this.restartButton.node.on(Node.EventType.MOUSE_UP, () => gameOverController.restart())
    }
}
