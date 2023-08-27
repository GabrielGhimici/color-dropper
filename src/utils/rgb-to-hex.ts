import { Color } from './types';

export function rgbToHex(color: Color): string {
  const { r, g, b } = color;
  return `#${[r, g, b]
    .map((colorComponent) => {
      return colorComponent.toString(16).padStart(2, '0');
    })
    .join('')}`;
}
