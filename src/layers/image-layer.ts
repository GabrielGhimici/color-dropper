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
        const { scaleA, scaledDimension } = this.computeScale(this.width, imageHeight, imageWidth);
        this.widthScale = scaleA;
        if (scaledDimension > this.height) {
          const {
            scaleA,
            scaleB,
            scaledDimension: widthAfterScale,
          } = this.computeScale(this.height, imageWidth, imageHeight);
          this.heightScale = scaleA;
          this.widthScale = scaleB;
          this.renderPositionX = this.positionFormula(this.width, widthAfterScale);
          this.renderPositionY = 0;
        } else {
          this.heightScale = scaledDimension / imageHeight;
          this.renderPositionX = 0;
          this.renderPositionY = this.positionFormula(this.height, scaledDimension);
          console.log(this.heightScale, this.widthScale, this.renderPositionX, this.renderPositionY);
        }
      } else {
        const { scaleA, scaledDimension } = this.computeScale(this.height, imageWidth, imageHeight);
        this.heightScale = scaleA;
        if (scaledDimension > this.width) {
          const {
            scaleA,
            scaleB,
            scaledDimension: heightAfterScale,
          } = this.computeScale(this.width, imageHeight, imageWidth);
          this.heightScale = scaleB;
          this.widthScale = scaleA;
          this.renderPositionX = 0;
          this.renderPositionY = this.positionFormula(this.height, heightAfterScale);
        } else {
          this.widthScale = scaledDimension / imageWidth;
          this.renderPositionX = this.positionFormula(this.width, scaledDimension);
          this.renderPositionY = 0;
        }
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
