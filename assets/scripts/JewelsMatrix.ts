const NULL_VALUE = -1;

type TAddedJewel = {
  color: number,
  col: number,
  row: number
}

type TMovedJewel = {
  from: [number, number],
  to: [number, number]
}

export type TMatrixDiff = {
  poped: [number, number][],
  added: TAddedJewel[][],
  moved: TMovedJewel[]
}

export class JewelsMatrix {
  private height: number;
  private width: number;
  private colors: number;
  private minConnected: number;
  private matrix: number[][];
  constructor(height: number, width: number, colors: number, minConnected: number) {
    this.height = height;
    this.width = width;
    this.colors = colors;
    this.minConnected = minConnected;
    this.generateMatrix();
  }
  private generateMatrix(): void {
    this.matrix = [];
    for (let i = 0; i < this.height; i++) {
      this.matrix[i] = [];
      for (let j = 0; j < this.width; j++) {
        this.matrix[i][j] = this.getRandomColor();
      }
    }
  }
  private needAddToQueue(currentColor: number, row: number, col: number) {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return false;
    }
    if (this.matrix[row][col] !== currentColor) {
      return false;
    }
    return true;
  }
  private getConnected(row: number, col: number) {
    let connected: [number, number][] = [];
    let color = this.matrix[row][col];
    let visited: boolean[][] = [];
    for (let i = 0; i < this.height; i++) {
      visited[i] = [];
      for (let j = 0; j < this.width; j++) {
        visited[i][j] = false;
      }
    }
    let queue: [number, number][] = [];
    queue.push([row, col]);
    while (queue.length > 0) {
      let [r, c] = queue.shift();
      if (r < 0 || r >= this.height || c < 0 || c >= this.width) {
        continue;
      }
      if (visited[r][c] || this.matrix[r][c] !== color) {
        continue;
      }
      visited[r][c] = true;
      connected.push([r, c]);
      if (this.needAddToQueue(color, r - 1, c)) {
        queue.push([r - 1, c]);
      }
      if (this.needAddToQueue(color, r + 1, c)) {
        queue.push([r + 1, c]);
      }
      if (this.needAddToQueue(color, r, c - 1)) {
        queue.push([r, c - 1]);
      }
      if (this.needAddToQueue(color, r, c + 1)) {
        queue.push([r, c + 1]);
      }
    }
    return connected;
  }
  public canPop(row: number, col: number): boolean {
    const connected = this.getConnected(row, col);
    return connected.length >= this.minConnected;
  }
  public popJewel(row: number, col: number): TMatrixDiff | undefined {
    const connected = this.getConnected(row, col);
    if (connected.length < this.minConnected) {
      return;
    }
    for (let [r, c] of connected) {
      this.matrix[r][c] = NULL_VALUE;
    }
    const moved =this.moveJewelsDown();
    const added = this.fillGaps();
    return {
      poped: connected,
      added,
      moved
    }
  }
  private moveJewelsDown() {
    const moved: TMovedJewel[] = [];
    for (let j = 0; j < this.width; j++) {
      for (let i = this.height - 1; i > 0; i--) {
        if (this.matrix[i][j] === NULL_VALUE) {
          let matched: [number, number] | null = null;
          let k = i - 1;
          while (!matched && k >= 0) {
            if (this.matrix[k][j] !== NULL_VALUE) {
              matched = [k, j];
            }
            k--;
          }
          if (matched) {
            this.matrix[i][j] = this.matrix[matched[0]][matched[1]];
            this.matrix[matched[0]][matched[1]] = NULL_VALUE;
            moved.push({
              from: [matched[0], matched[1]],
              to: [i, j]
            });
          }
        }
      }
    }
    return moved;
  }
  private fillGaps(): TAddedJewel[][] {
    const added: TAddedJewel[][] = [];
    for (let i = 0; i < this.width; i++) {
      added[i] = [];
    }
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.matrix[i][j] === NULL_VALUE) {
          this.matrix[i][j] = this.getRandomColor();
          added[j].push({
            color: this.matrix[i][j],
            col: j,
            row: i
          });
        }
      }
    }
    return added;
  }
  private getRandomColor(): number {
    return Math.floor(Math.random() * this.colors);
  }
  public getMatrix(): number[][] {
    return this.matrix;
  }
}
