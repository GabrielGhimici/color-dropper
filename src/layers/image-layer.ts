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
      this.computeRenderImageMeta();
    }
  }

  public addImageData(file: File) {
    const img = new Image();
    const imageURL = URL.createObjectURL(file);
    img.src = imageURL;
    img.addEventListener('load', () => {
      this.imageData = img;
      this.computeRenderImageMeta();
    });
  }

  private positionFormula(a: number, b: number) {
    return (a - b) / 2;
  }

  private aspectRatio(width: number, height: number) {
    return width / height;
  }

  private computeScale(canvasSize: number, imageSize1: number, imageSize2: number) {
    const scaleA = canvasSize / imageSize2;
    const scaledDimension = imageSize2 * scaleA * this.aspectRatio(imageSize1, imageSize2);
    const scaleB = scaledDimension / imageSize1;
    return { scaleA, scaleB, scaledDimension };
  }

  private handleAspectRatio(canvasSize1: number, canvasSize2: number, imageSize1: number, imageSize2: number) {
    const result = {
      scale1: 1,
      scale2: 1,
      pos1: 0,
      pos2: 0,
    };
    const { scaleA, scaledDimension } = this.computeScale(canvasSize1, imageSize2, imageSize1);
    result.scale1 = scaleA;
    if (scaledDimension > canvasSize2) {
      const {
        scaleA,
        scaleB,
        scaledDimension: widthAfterScale,
      } = this.computeScale(canvasSize2, imageSize1, imageSize2);
      result.scale2 = scaleA;
      result.scale1 = scaleB;
      result.pos1 = this.positionFormula(canvasSize1, widthAfterScale);
    } else {
      result.scale2 = scaledDimension / imageSize2;
      result.pos2 = this.positionFormula(canvasSize2, scaledDimension);
    }

    return result;
  }

  private computeRenderImageMeta() {
    if (!this.imageData) return;
    const { width: imageWidth, height: imageHeight } = this.imageData;
    const aspectRatio = this.aspectRatio(imageWidth, imageHeight);
    if (imageWidth <= this.width && imageHeight <= this.height) {
      this.renderPositionX = this.positionFormula(this.width, imageWidth);
      this.renderPositionY = this.positionFormula(this.height, imageHeight);
      this.widthScale = 1;
      this.heightScale = 1;
    } else if (imageWidth <= this.width && imageHeight > this.height) {
      const { scaleA, scaleB, scaledDimension } = this.computeScale(this.height, imageWidth, imageHeight);
      this.heightScale = scaleA;
      this.widthScale = scaleB;
      this.renderPositionX = this.positionFormula(this.width, scaledDimension);
      this.renderPositionY = 0;
    } else if (imageWidth > this.width && imageHeight <= this.height) {
      const { scaleA, scaleB, scaledDimension } = this.computeScale(this.width, imageHeight, imageWidth);
      this.heightScale = scaleB;
      this.widthScale = scaleA;
      this.renderPositionX = 0;
      this.renderPositionY = this.positionFormula(this.height, scaledDimension);
    } else {
      if (aspectRatio > 1) {
        const { scale1, scale2, pos1, pos2 } = this.handleAspectRatio(this.width, this.height, imageWidth, imageHeight);
        this.widthScale = scale1;
        this.heightScale = scale2;
        this.renderPositionX = pos1;
        this.renderPositionY = pos2;
      } else {
        const { scale1, scale2, pos1, pos2 } = this.handleAspectRatio(this.height, this.width, imageHeight, imageWidth);
        this.widthScale = scale2;
        this.heightScale = scale1;
        this.renderPositionX = pos2;
        this.renderPositionY = pos1;
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
