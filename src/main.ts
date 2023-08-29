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
  addMouseOverListeners(canvas, app);
  addMouseMoveListener(canvas);
  addPointerListeners(canvas, app);
  addDropImageListeners(app);
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

function isImageType(file: File) {
  return file.type === 'image/jpeg' || file.type === 'image/png';
}

function addUploadImageListener(app: App) {
  const uploadInput = document.getElementById('upload-input') as HTMLInputElement | null;
  assertDefined(uploadInput, 'No Upload input found');
  uploadInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files?.length) {
      if (!isImageType(files[0])) return;
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
      pickerButton.classList.remove('active');
    } else {
      app.enablePicker();
      pickerButton.classList.add('active');
    }
  });
}

function addMouseOverListeners(canvas: HTMLCanvasElement, app: App) {
  canvas.addEventListener('mouseenter', () => {
    InputManger.instance.updateMouseOver(true);
    if (app.pickerEnabled) {
      canvas.classList.add('no-cursor');
    }
  });
  canvas.addEventListener('mouseleave', () => {
    InputManger.instance.updateMouseOver(false);
    if (app.pickerEnabled) {
      canvas.classList.remove('no-cursor');
    }
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
      addColorTextListener(colorText, color);
    }
    const colorPreview = existingColorContainer.children.item(1) as HTMLDivElement | null;
    if (colorPreview) {
      colorPreview.style.setProperty('background-color', color);
      colorPreview.classList.remove('first-render');
    }
  }
}

function addColorTextListener(colorText: HTMLSpanElement, color: string) {
  if (!colorText.getAttribute('data-listener') || colorText.getAttribute('data-listener') !== 'enabled') {
    colorText.classList.add('clickable');
    colorText.addEventListener('pointerdown', (e) => {
      const text = e.target as HTMLSpanElement | null;
      text?.setAttribute('data-listener', 'enabled');
      navigator.clipboard.writeText(color);
    });
  }
}

function addDropImageListeners(app: App) {
  const appContainer = document.getElementById('app') as HTMLDivElement | null;
  assertDefined(appContainer, 'App container cannot be located');
  appContainer.addEventListener('dragenter', () => {
    const dropzone = document.getElementById('dropzone') as HTMLDivElement | null;
    if (!dropzone) {
      const newDropzone = constructDropZone();
      appContainer.appendChild(newDropzone);
      addListenersOnDropzone(appContainer, newDropzone, app);
    }
  });
}

function addListenersOnDropzone(appContainer: HTMLDivElement, dropzone: HTMLDivElement, app: App) {
  dropzone.addEventListener('dragleave', () => {
    removeDropZone(appContainer);
  });
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.dropEffect = 'copy';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!e.dataTransfer?.files.length) return;
    const file = e.dataTransfer.files[0];
    if (!isImageType(file)) {
      removeDropZone(appContainer);
      return;
    }
    app.addImageLayer(file);
    removeDropZone(appContainer);
  });
}

function removeDropZone(appContainer: HTMLDivElement) {
  const dropzone = document.getElementById('dropzone') as HTMLDivElement | null;
  if (dropzone) {
    appContainer.removeChild(dropzone);
  }
}

function constructDropZone() {
  const dropzone = document.createElement('div');
  dropzone.setAttribute('id', 'dropzone');
  dropzone.classList.add('dropzone-container');
  const dropzoneDelimiter = document.createElement('div');
  dropzoneDelimiter.classList.add('dropzone-delimiter');
  dropzone.appendChild(dropzoneDelimiter);
  const illustration = document.createElement('img');
  illustration.src = './image-upload.svg';
  dropzone.appendChild(illustration);
  const message = document.createElement('h2');
  message.innerText = 'Drop image here';
  dropzone.appendChild(message);
  return dropzone;
}
