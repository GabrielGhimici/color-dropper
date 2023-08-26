import { Layer } from './layer';

export class BackgroundLayer extends Layer {
  private checkerboardColors = {
    light: '#ffffff',
    dark: '#a4a4a4',
  };
  private squareSize = 10;

  constructor(
    context: CanvasRenderingContext2D,
    private width: number,
    private height: number
  ) {
    super(context, 'Background');
  }

  update(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  render(): void {
    const rowCount = Math.floor(this.height / this.squareSize);
    const colCount = Math.floor(this.width / this.squareSize);
    for (let row = 0; row <= rowCount; row++) {
      for (let col = 0; col <= colCount; col++) {
        if ((row % 2 === 0 && col % 2 === 0) || (row % 2 !== 0 && col % 2 !== 0)) {
          this.context.fillStyle = this.checkerboardColors.dark;
        } else {
          this.context.fillStyle = this.checkerboardColors.light;
        }
        this.context.fillRect(col * this.squareSize, row * this.squareSize, this.squareSize, this.squareSize);
      }
    }
  }
}
