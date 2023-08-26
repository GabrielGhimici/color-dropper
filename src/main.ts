import { App } from './app';
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
