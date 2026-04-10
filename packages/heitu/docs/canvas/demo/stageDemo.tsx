import { Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

const StageDemo = () => {
  const container = useRef<HTMLElement | null>(null);
  const _stage = new Stage();

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
      height: 200,
    });
    return () => _stage.destroy();
  }, []);

  useResizeObserver(container, () => _stage._resizeDOM());

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', fontSize: 12, color: '#64748B' }}>
        Empty Stage — a blank canvas ready for shapes
      </div>
      <div ref={container} />
    </div>
  );
};

export default StageDemo;
