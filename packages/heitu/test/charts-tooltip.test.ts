import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Tooltip } from '../src/charts/core/Tooltip';

describe('Tooltip', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('creates a tooltip element inside container', () => {
    const tooltip = new Tooltip(container);
    expect(container.querySelector('div')).not.toBeNull();
    tooltip.destroy();
  });

  it('starts hidden (opacity 0)', () => {
    const tooltip = new Tooltip(container);
    const el = container.querySelector('div') as HTMLDivElement;
    expect(el.style.opacity).toBe('0');
    tooltip.destroy();
  });

  it('shows with text content and opacity 1', () => {
    const tooltip = new Tooltip(container);
    tooltip.show(100, 50, 'hello');
    const el = container.querySelector('div') as HTMLDivElement;
    expect(el.style.opacity).toBe('1');
    expect(el.textContent).toBe('hello');
    tooltip.destroy();
  });

  it('uses custom formatter when provided', () => {
    const formatter = (item: any) => `Value: ${item.val}`;
    const tooltip = new Tooltip(container, formatter);
    tooltip.show(100, 50, { val: 42 });
    const el = container.querySelector('div') as HTMLDivElement;
    expect(el.textContent).toBe('Value: 42');
    tooltip.destroy();
  });

  it('hides tooltip by setting opacity to 0', () => {
    const tooltip = new Tooltip(container);
    tooltip.show(100, 50, 'data');
    tooltip.hide();
    const el = container.querySelector('div') as HTMLDivElement;
    expect(el.style.opacity).toBe('0');
    tooltip.destroy();
  });

  it('removes element from DOM on destroy', () => {
    const tooltip = new Tooltip(container);
    expect(container.childElementCount).toBe(1);
    tooltip.destroy();
    expect(container.childElementCount).toBe(0);
  });

  it('sets container to position relative if static', () => {
    container.style.position = 'static';
    const tooltip = new Tooltip(container);
    expect(container.style.position).toBe('relative');
    tooltip.destroy();
  });

  it('does not change container position if already non-static', () => {
    container.style.position = 'absolute';
    const tooltip = new Tooltip(container);
    expect(container.style.position).toBe('absolute');
    tooltip.destroy();
  });
});
