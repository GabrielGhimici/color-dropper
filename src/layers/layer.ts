export abstract class Layer {
  constructor(
    protected context: CanvasRenderingContext2D,
    protected name: string
  ) {}

  abstract render(): void;
  abstract update(...args: Array<any>): void;
}
