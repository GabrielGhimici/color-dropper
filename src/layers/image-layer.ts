import { Layer } from './layer';

export class ImageLayer extends Layer {
  private imageData: HTMLImageElement | null = null;
  private widthScale: number = 1;
  private heightScale: number = 1;
  private renderPositionX: number = 0;
  private renderPositionY: number = 0;
  constructor(
    context: CanvasRenderingContext2D,
    private width: number,
    private height: number
  ) {
    super(context, 'Image');
  }

  public update(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.imageData) {
      this.computeRenderScale();
    }
  }

  public addImageData(file: File) {
    const img = new Image();
    const imageURL = URL.createObjectURL(file);
    img.src = imageURL;
    img.addEventListener('load', () => {
      this.imageData = img;
      this.computeRenderScale();
    });
  }

  private computeRenderScale() {
    if (!this.imageData) return;
    const { width: imageWidth, height: imageHeight } = this.imageData;
    const aspectRatio = imageWidth / imageHeight;
    if (imageWidth <= this.width && imageHeight <= this.height) {
      this.renderPositionX = (this.width - imageWidth) / 2;
      this.renderPositionY = (this.height - imageHeight) / 2;
      this.widthScale = 1;
      this.heightScale = 1;
    } else if (imageWidth <= this.width && imageHeight > this.height) {
      this.heightScale = this.height / imageHeight;
      const widthAfterScale = imageHeight * this.heightScale * aspectRatio;
      this.widthScale = widthAfterScale / imageWidth;
      this.renderPositionX = (this.width - widthAfterScale) / 2;
      this.renderPositionY = 0;
    } else if (imageWidth > this.width && imageHeight <= this.height) {
      this.widthScale = this.width / imageWidth;
      const heightAfterScale = (imageWidth * this.widthScale) / aspectRatio;
      this.heightScale = heightAfterScale / imageHeight;
      this.renderPositionX = 0;
      this.renderPositionY = (this.height - heightAfterScale) / 2;
    } else {
      if (aspectRatio > 1) {
        this.widthScale = this.width / imageWidth;
        const heightAfterScale = (imageWidth * this.widthScale) / aspectRatio;
        this.heightScale = heightAfterScale / imageHeight;
        this.renderPositionX = 0;
        this.renderPositionY = (this.height - heightAfterScale) / 2;
      } else {
        this.heightScale = this.height / imageHeight;
        const widthAfterScale = imageHeight * this.heightScale * aspectRatio;
        this.widthScale = widthAfterScale / imageWidth;
        this.renderPositionX = (this.width - widthAfterScale) / 2;
        this.renderPositionY = 0;
      }
    }
  }

  public render(): void {
    if (!this.imageData) return;
    this.context.drawImage(
      this.imageData,
      this.renderPositionX,
      this.renderPositionY,
      this.imageData.width * this.widthScale,
      this.imageData.height * this.heightScale
    );
  }
}
