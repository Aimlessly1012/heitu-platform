import React, { useEffect, useRef } from 'react';
import type { IPieChartProps } from '../core/types';
import { PieChart as PieChartCore } from './PieChart';

const PieChartComponent = <T extends Record<string, any>>(
  props: IPieChartProps<T>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<PieChartCore<T> | null>(null);
  const { style, className, ...chartConfig } = props;

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new PieChartCore<T>({
      ...chartConfig,
      container: containerRef.current,
      width: props.width ?? containerRef.current.clientWidth,
      height: props.height ?? containerRef.current.clientHeight,
    } as any);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({ data: props.data });
    }
  }, [props.data]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: props.width ?? '100%', height: props.height ?? 300, ...style }}
    />
  );
};

export default PieChartComponent;
