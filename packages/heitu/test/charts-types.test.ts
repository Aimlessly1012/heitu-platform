import { describe, it, expect } from 'vitest';
import { DEFAULT_COLORS, DEFAULT_PADDING } from '../src/charts/core/types';

describe('Charts constants', () => {
  it('DEFAULT_COLORS has 8 colors', () => {
    expect(DEFAULT_COLORS).toHaveLength(8);
  });

  it('DEFAULT_COLORS are valid hex color strings', () => {
    DEFAULT_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('DEFAULT_PADDING is [top, right, bottom, left] tuple', () => {
    expect(DEFAULT_PADDING).toHaveLength(4);
    DEFAULT_PADDING.forEach((val) => {
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });
});
