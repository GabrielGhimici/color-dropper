import type { App } from '../app';
import { InputManger } from '../input-manger';
import { rgbToHex } from '../utils/rgb-to-hex';
import { Color } from '../utils/types';
import { Layer } from './layer';

export class UiLayer extends Layer {
  private positionX = 0;
  private positionY = 0;
  private circleImage: HTMLImageElement | null = null;
  private inputManager: InputManger;
  private maxPixelCount = 13;
  private strokeSize = 11;
  private separatorSize = 1;
  private pixelsGrid: Array<Array<Color>> = [];

  constructor(context: CanvasRenderingContext2D) {
    super(context, 'UI');
    this.inputManager = InputManger.create();
    const img = new Image(10, 20);
    img.src = './color-circle.svg';
    img.addEventListener('load', () => {
      this.circleImage = img;
    });
  }

  update(app: App): void {
    if (this.pixelsGrid.length > 0 && this.inputManager.isMouseActive) {
      app.selectedColor = rgbToHex(
        this.pixelsGrid[Math.trunc(this.maxPixelCount / 2)][Math.trunc(this.maxPixelCount / 2)]
      );
    }
  }

  private getPixelsData() {
    const { mousePosition } = this.inputManager;
    const halfPixels = Math.trunc(this.maxPixelCount / 2);
    const leftPixelBoundary = mousePosition.x - halfPixels;
    const topPixelBoundary = mousePosition.y - halfPixels;
    return this.context.getImageData(leftPixelBoundary, topPixelBoundary, this.maxPixelCount, this.maxPixelCount).data;
  }

  private computePixelsGrid(rawData: Uint8ClampedArray) {
    const colorItems = 4;
    let row = 0;
    this.pixelsGrid = rawData.reduce((grid: Array<Array<Color>>, item, index) => {
      if (index === row * this.maxPixelCount * colorItems) {
        grid.push([]);
        row++;
      }
      if (index % colorItems === 0) {
        grid[row - 1].push({
          r: item,
          g: rawData[index + 1],
          b: rawData[index + 2],
          gamut: rawData[index + 3],
        });
      }
      return grid;
    }, []);
  }

  private renderBackground() {
    if (!this.circleImage) return;
    const { mousePosition } = this.inputManager;
    const { naturalWidth } = this.circleImage;
    this.context.beginPath();
    this.context.arc(mousePosition.x, mousePosition.y, naturalWidth / 2 - this.strokeSize, 0, 2 * Math.PI);
    this.context.fillStyle = '#fff';
    this.context.fill();
  }

  private renderPixelsGrid() {
    if (!this.circleImage) return;
    const { naturalWidth } = this.circleImage;
    const pixelSize = (naturalWidth - 2 * this.strokeSize) / this.maxPixelCount;
    this.pixelsGrid.forEach((row, rIndex) => {
      row.forEach((column, cIndex) => {
        this.context.fillStyle = rgbToHex(column);
        this.context.fillRect(
          this.positionX + this.strokeSize + cIndex * pixelSize + this.separatorSize,
          this.positionY + this.strokeSize + rIndex * pixelSize + this.separatorSize,
          pixelSize,
          pixelSize
        );
      });
    });
    this.context.strokeStyle = '#000';
    this.context.lineWidth = this.separatorSize;
    this.context.strokeRect(
      this.positionX + this.strokeSize + Math.trunc(this.maxPixelCount / 2) * pixelSize + this.separatorSize,
      this.positionY + this.strokeSize + Math.trunc(this.maxPixelCount / 2) * pixelSize + this.separatorSize,
      pixelSize,
      pixelSize
    );
  }

  render(): void {
    if (!this.circleImage || !this.inputManager.isMouseOver) return;
    const { mousePosition } = this.inputManager;
    const { naturalWidth, naturalHeight } = this.circleImage;
    this.positionX = mousePosition.x - naturalWidth / 2;
    this.positionY = mousePosition.y - naturalHeight / 2;
    this.computePixelsGrid(this.getPixelsData());
    this.renderBackground();
    this.renderPixelsGrid();
    this.context.drawImage(this.circleImage, this.positionX, this.positionY);
  }
}
