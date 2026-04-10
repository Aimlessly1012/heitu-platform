import { Animate, Circle, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

const StageDemo1 = () => {
  const container = useRef<HTMLElement | null>(null);
  const _stage = new Stage();

  const _circle1 = new Circle({
    x: 100, y: 100, radius: 45,
    fillStyle: '#4F46E5', border: 0,
    shadowColor: 'rgba(79,70,229,0.25)', shadowBlur: 16, shadowOffsetY: 4,
  });

  const _circle2 = new Circle({
    x: 260, y: 80, radius: 20,
    fillStyle: '#F59E0B', border: 0,
    shadowColor: 'rgba(245,158,11,0.25)', shadowBlur: 12, shadowOffsetY: 3,
  });

  const _label1 = new Text({
    content: 'Click me', x: 100, y: 95,
    fontSize: 11, fillStyle: '#fff', textAlign: 'center',
  });

  const _label2 = new Text({
    content: 'Breathing', x: 260, y: 115,
    fontSize: 11, fillStyle: '#64748B', textAlign: 'center',
  });

  _stage.add(_circle1, _circle2, _label1, _label2);

  // Click indigo circle -> move animation
  _circle1.on('click', () => {
    const ani = new Animate(
      { value: 0 },
      { value: 1 },
      { duration: 1000, easing: 'quadraticInOut' },
    );
    const startX = _circle1.x;
    const startY = _circle1.y;
    ani.pushQueue((_, ratio) => {
      _circle1.attr({
        x: startX + (350 - startX) * ratio,
        y: startY + (200 - startY) * ratio,
      });
      _label1.attr({
        x: startX + (350 - startX) * ratio,
        y: startY + (200 - startY) * ratio - 5,
      });
    });
    ani.start();
  });

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
    });

    // Breathing animation for the amber circle
    const breathe = new Animate(
      { value: 0 },
      { value: 1 },
      { duration: 2000, easing: 'sinusoidalInOut', iterationCount: Infinity },
    );
    const baseRadius = _circle2.radius;
    breathe.pushQueue((_, ratio) => {
      _circle2.attr({ radius: baseRadius + 8 * ratio });
    });
    breathe.start();

    return () => {
      breathe.stop();
      _stage.destroy();
    };
  }, []);

  useResizeObserver(container, () => _stage._resizeDOM());

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 16, fontSize: 12, color: '#64748B' }}>
        <span>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4F46E5', marginRight: 6, verticalAlign: 'middle' }} />
          Click to animate
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', marginRight: 6, verticalAlign: 'middle' }} />
          Auto breathing
        </span>
      </div>
      <div ref={container} />
    </div>
  );
};

export default StageDemo1;
