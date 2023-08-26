import { Layer } from './layer';

export class ImageLayer extends Layer {
  private imageData: HTMLImageElement | null = null;
  private widthScale: number = 1;
  private heightScale: number = 1;
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
  }

  public addImageData(file: File) {
    const img = new Image();
    const imageURL = URL.createObjectURL(file);
    img.src = imageURL;
    img.addEventListener('load', () => {
      this.imageData = img;
      this.computeRenderScale(img.width, img.height);
    });
  }

  private computeRenderScale(width: number, height: number) {
    this.widthScale = this.width / width;
    this.heightScale = this.height / height;
  }

  public render(): void {
    if (this.imageData) {
      console.log(this.widthScale, this.heightScale);
      this.context.drawImage(
        this.imageData,
        0,
        0,
        this.imageData.width * this.widthScale,
        this.imageData.height * this.heightScale
      );
    }
  }
}
