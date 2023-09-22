import { _decorator, Button, Component, director, find, Label, Node } from 'cc';
import { GameOverController } from './GameOverController';
const { ccclass, property } = _decorator;

@ccclass('LoseSceneController')
export class LoseSceneController extends Component {
    @property(Label)
    protected pointsLabel: Label = null
    @property(Button)
    protected restartButton: Button = null
    start() {
        const gameOverController = find('GameOverController').getComponent<GameOverController>(GameOverController)
        director.removePersistRootNode(gameOverController.node)
        this.pointsLabel.string = gameOverController.getPoints().toString()
        this.restartButton.node.on(Node.EventType.MOUSE_UP, () => gameOverController.restart())
    }
}

