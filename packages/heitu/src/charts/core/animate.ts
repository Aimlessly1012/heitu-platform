import { Animate } from '../../canvas';
import type { Stage } from '../../canvas';
import type { IAnimationConfig } from './types';

const DEFAULT_DURATION = 600;
const DEFAULT_EASING = 'cubicOut';

/**
 * 属性过渡动画
 * 从 startProps 平滑过渡到 targetProps，每帧调用 onFrame 更新图元
 */
export function animateProps(
  startProps: Record<string, number>,
  targetProps: Record<string, number>,
  onFrame: (currentProps: Record<string, number>) => void,
  stage: Stage,
  config?: boolean | IAnimationConfig,
  onDone?: () => void,
): Animate | null {
  if (config === false) {
    // 无动画，直接设置最终值
    onFrame(targetProps);
    stage.batchDraw(stage);
    onDone?.();
    return null;
  }

  const duration = typeof config === 'object' ? (config.duration ?? DEFAULT_DURATION) : DEFAULT_DURATION;
  const easing = typeof config === 'object' ? (config.easing ?? DEFAULT_EASING) : DEFAULT_EASING;

  const anim = new Animate(startProps, targetProps, {
    duration,
    easing,
    during: (_percent, newState) => {
      const current: Record<string, number> = {};
      for (const key of Object.keys(targetProps)) {
        current[key] = Number(newState[key]) || 0;
      }
      onFrame(current);
      stage.batchDraw(stage);
    },
    done: () => {
      onFrame(targetProps);
      stage.batchDraw(stage);
      onDone?.();
    },
  });

  anim.start();
  return anim;
}
