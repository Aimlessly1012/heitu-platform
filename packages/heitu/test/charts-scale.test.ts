import { describe, it, expect } from 'vitest';
import { linearScale, linearTicks, bandScale, arcScale } from '../src/charts/core/Scale';

describe('linearScale', () => {
  it('maps domain value to range proportionally', () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(250);
    expect(scale(100)).toBe(500);
  });

  it('handles inverted range (y axis: larger value → smaller pixel)', () => {
    const scale = linearScale([0, 200], [400, 0]);
    expect(scale(0)).toBe(400);
    expect(scale(100)).toBe(200);
    expect(scale(200)).toBe(0);
  });

  it('handles equal domain values without NaN', () => {
    const scale = linearScale([50, 50], [0, 300]);
    expect(scale(50)).toBe(0); // ratio is 0, so returns range start
    expect(Number.isNaN(scale(50))).toBe(false);
  });

  it('maps values outside domain (extrapolation)', () => {
    const scale = linearScale([0, 100], [0, 200]);
    expect(scale(150)).toBe(300);
    expect(scale(-50)).toBe(-100);
  });
});

describe('linearTicks', () => {
  it('returns nice tick values covering the domain', () => {
    const ticks = linearTicks([0, 100]);
    expect(ticks[0]).toBeLessThanOrEqual(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
    // ticks should be evenly spaced
    const step = ticks[1] - ticks[0];
    for (let i = 2; i < ticks.length; i++) {
      expect(ticks[i] - ticks[i - 1]).toBeCloseTo(step, 5);
    }
  });

  it('respects custom tickCount', () => {
    const ticks = linearTicks([0, 1000], 3);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks.length).toBeLessThanOrEqual(6);
  });

  it('handles zero span domain', () => {
    const ticks = linearTicks([0, 0]);
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every((t) => Number.isFinite(t))).toBe(true);
  });
});

describe('bandScale', () => {
  it('maps categories to evenly spaced pixel positions', () => {
    const scale = bandScale(['A', 'B', 'C'], [0, 300]);
    const a = scale('A');
    const b = scale('B');
    const c = scale('C');
    // positions should be evenly spaced
    expect(b - a).toBeCloseTo(c - b, 1);
    // all within range
    expect(a).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(300);
  });

  it('returns range start for unknown category', () => {
    const scale = bandScale(['X', 'Y'], [50, 200]);
    expect(scale('Z')).toBe(50);
  });

  it('provides bandwidth function', () => {
    const scale = bandScale(['A', 'B'], [0, 200]);
    expect(typeof scale.bandwidth).toBe('function');
    expect(scale.bandwidth()).toBeGreaterThan(0);
  });

  it('respects padding parameter', () => {
    const noPad = bandScale(['A', 'B'], [0, 200], 0);
    const withPad = bandScale(['A', 'B'], [0, 200], 0.3);
    // bandwidth with padding should be smaller
    expect(withPad.bandwidth()).toBeLessThan(noPad.bandwidth());
  });
});

describe('arcScale', () => {
  it('converts values to arc angles summing to 360 degrees', () => {
    const arcs = arcScale([50, 30, 20]);
    expect(arcs).toHaveLength(3);
    // total angle span should be 360
    const totalAngle = arcs.reduce((s, a) => s + (a.endAngle - a.startAngle), 0);
    expect(totalAngle).toBeCloseTo(360, 5);
  });

  it('starts from -90 degrees (top)', () => {
    const arcs = arcScale([100]);
    expect(arcs[0].startAngle).toBe(-90);
    expect(arcs[0].endAngle).toBeCloseTo(270, 5);
  });

  it('preserves value and index in each arc item', () => {
    const arcs = arcScale([10, 20, 30]);
    arcs.forEach((arc, i) => {
      expect(arc.index).toBe(i);
      expect(arc.value).toBe([10, 20, 30][i]);
    });
  });

  it('consecutive arcs have matching start/end angles', () => {
    const arcs = arcScale([25, 25, 50]);
    for (let i = 1; i < arcs.length; i++) {
      expect(arcs[i].startAngle).toBeCloseTo(arcs[i - 1].endAngle, 5);
    }
  });

  it('handles all zero values without NaN', () => {
    const arcs = arcScale([0, 0, 0]);
    expect(arcs.every((a) => Number.isFinite(a.startAngle) && Number.isFinite(a.endAngle))).toBe(true);
  });
});
