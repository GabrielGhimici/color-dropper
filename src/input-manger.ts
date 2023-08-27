export interface MousePosition {
  x: number;
  y: number;
}

export class InputManger {
  private static _instance: InputManger;
  private _isMouseOver: boolean = false;
  private _mousePosition: MousePosition = { x: 0, y: 0 };
  private _iMouseActive: boolean = false;

  private constructor() {}

  public static create() {
    if (!this._instance) {
      this._instance = new InputManger();
    }

    return this._instance;
  }

  public static get instance() {
    return this._instance;
  }

  public get isMouseOver() {
    return this._isMouseOver;
  }

  public get mousePosition() {
    return this._mousePosition;
  }

  public get isMouseActive() {
    return this._iMouseActive;
  }

  public updateMouseOver(value: boolean) {
    this._isMouseOver = value;
  }

  public updateMouseActive(value: boolean) {
    this._iMouseActive = value;
  }

  public updateMousePosition(x: number, y: number) {
    this._mousePosition.x = x < 0 ? 0 : x;
    this._mousePosition.y = y < 0 ? 0 : y;
  }
}
