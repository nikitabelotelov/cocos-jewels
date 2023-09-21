import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameOverController')
export class GameOverController extends Component {
    private points: number = 0
    private moves: number = 0
    public setPoints(points: number) {
        this.points = points
    }
    public setMoves(moves: number) {
        this.moves = moves
    }
    public getPoints() {
        return this.points
    }
    public getMoves() {
        return this.moves
    }
    public restart() {
        director.loadScene('MenuScene')
    }
}

