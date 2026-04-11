import React, { useEffect, useRef } from 'react';
import type { ILineChartProps } from '../core/types';
import { LineChart as LineChartCore } from './LineChart';

const LineChartComponent = <T extends Record<string, any>>(
  props: ILineChartProps<T>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<LineChartCore<T> | null>(null);
  const { style, className, ...chartConfig } = props;

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new LineChartCore<T>({
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

  // data 变化时更新
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

export default LineChartComponent;
