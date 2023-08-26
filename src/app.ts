import { BackgroundLayer } from './layers/background-layer';
import { ImageLayer } from './layers/image-layer';
import { Layer } from './layers/layer';
import { assertDefined } from './utils/assert';

export class App {
  private width: number;
  private height: number;
  private context: CanvasRenderingContext2D | null;
  private backgroundLayer: Layer | null = null;
  private imageLayer: ImageLayer | null = null;
  private uiLayer: Layer | null = null;
  private enableUI: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext('2d');
  }

  public init() {
    assertDefined(this.context, 'The context is not defined');
    this.backgroundLayer = new BackgroundLayer(this.context, this.width, this.height);
    this.imageLayer = new ImageLayer(this.context, this.width, this.height);
  }

  public addImageLayer(file: File) {
    assertDefined(this.imageLayer, 'No image layer built');
    this.imageLayer.addImageData(file);
  }

  public enablePicker() {
    this.enableUI = true;
  }

  public disablePicker() {
    this.enableUI = false;
  }

  public update(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.backgroundLayer?.update(width, height);
  }

  public run() {
    const runLoop = () => {
      assertDefined(this.context, 'The context is not defined');
      this.context.clearRect(0, 0, this.width, this.height);
      this.backgroundLayer?.render();
      this.imageLayer?.render();
      if (this.enableUI) {
        this.uiLayer?.render();
      }
      requestAnimationFrame(runLoop);
    };
    runLoop();
  }
}
