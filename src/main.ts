import { App } from './app';
import { InputManger } from './input-manger';
import './styles.css';
import { assertDefined } from './utils/assert';
import { CANVAS_ADDITIONAL_SPACE, HEADER_HEIGHT } from './utils/constants';

window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
  assertDefined(canvas, 'No canvas found');
  updateSizes(canvas);

  const app = new App(canvas);
  app.init();
  addWindowResizeListener(canvas, app);
  addUploadImageListener(app);
  addEnablePickerListener(app);
  addMouseOverListeners(canvas);
  addMouseMoveListener(canvas);
  addPointerListeners(canvas, app);
  app.run();
});

function updateSizes(canvas: HTMLCanvasElement): { width: number; height: number } {
  const CANVAS_SPACING = 2 * CANVAS_ADDITIONAL_SPACE.BORDER + 2 * CANVAS_ADDITIONAL_SPACE.MARGIN;
  canvas.width = window.innerWidth - CANVAS_SPACING;
  canvas.height = window.innerHeight - (HEADER_HEIGHT + CANVAS_SPACING);
  return {
    width: canvas.width,
    height: canvas.height,
  };
}

function addWindowResizeListener(canvas: HTMLCanvasElement, app: App) {
  window.addEventListener('resize', () => {
    const { width, height } = updateSizes(canvas);
    app.update(width, height);
  });
}

function addUploadImageListener(app: App) {
  const uploadInput = document.getElementById('upload-input') as HTMLInputElement | null;
  assertDefined(uploadInput, 'No Upload input found');
  uploadInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files?.length) {
      app.addImageLayer(files[0]);
    }
  });
}

function addEnablePickerListener(app: App) {
  const pickerButton = document.getElementById('picker-button') as HTMLButtonElement | null;
  assertDefined(pickerButton, 'No Picker control button found');
  pickerButton.addEventListener('click', () => {
    if (app.pickerEnabled) {
      app.disablePicker();
    } else {
      app.enablePicker();
    }
  });
}

function addMouseOverListeners(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mouseenter', () => {
    InputManger.instance.updateMouseOver(true);
  });
  canvas.addEventListener('mouseleave', () => {
    InputManger.instance.updateMouseOver(false);
  });
}

function handlePositioning(e: MouseEvent) {
  const { offsetTop: targetOffsetTop, offsetLeft: targetOffsetLeft } = e.target as HTMLCanvasElement;
  const { clientX, clientY } = e;
  const x = clientX - targetOffsetLeft;
  const y = clientY - targetOffsetTop;
  InputManger.instance.updateMousePosition(x, y);
}

function addMouseMoveListener(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousemove', handlePositioning);
}

function addPointerListeners(canvas: HTMLCanvasElement, app: App) {
  canvas.addEventListener('pointerdown', (e) => {
    handlePositioning(e);
    InputManger.instance.updateMouseActive(true);
  });
  canvas.addEventListener('pointerup', () => {
    if (app.pickerEnabled) {
      app.update(canvas.width, canvas.height);
      renderColor(app.selectedColor);
    }
    InputManger.instance.updateMouseActive(false);
  });
}

function renderColor(color: string | null) {
  if (!color) return;
  const existingColorContainer = document.getElementById('color-container') as HTMLDivElement | null;
  if (existingColorContainer) {
    const colorText = existingColorContainer.children.item(0) as HTMLSpanElement | null;
    if (colorText) {
      colorText.innerText = color;
    }
    const colorPreview = existingColorContainer.children.item(1) as HTMLDivElement | null;
    if (colorPreview) {
      colorPreview.style.setProperty('background-color', color);
      colorPreview.classList.remove('first-render');
    }
  }
}
