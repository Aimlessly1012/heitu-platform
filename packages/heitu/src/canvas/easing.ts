/**
 * 缓动函数集合 + 动画插值计算
 * 从 utils.ts 中独立出来,仅被 Animate 消费。
 */

export const easingFuncs = {
  linear: (k: number) => k,
  quadraticIn: (k: number) => k * k,
  quadraticOut: (k: number) => k * (2 - k),
  quadraticInOut: (k: number) => {
    let k1 = k;
    if ((k1 *= 2) < 1) return 0.5 * k1 * k1;
    return -0.5 * (--k1 * (k1 - 2) - 1);
  },
  cubicIn: (k: number) => k * k * k,
  cubicOut: (k: number) => {
    let k1 = k;
    return --k1 * k1 * k1 + 1;
  },
  cubicInOut: (k: number) => {
    let k1 = k;
    if ((k1 *= 2) < 1) return 0.5 * k1 * k1 * k1;
    return 0.5 * ((k1 -= 2) * k1 * k1 + 2);
  },
  quarticIn: (k: number) => k * k * k * k,
  quarticOut: (k: number) => {
    let k1 = k;
    return 1 - --k1 * k1 * k1 * k1;
  },
  quarticInOut: (k: number) => {
    let k1 = k;
    if ((k1 *= 2) < 1) return 0.5 * k1 * k1 * k1 * k1;
    return -0.5 * ((k1 -= 2) * k1 * k1 * k1 - 2);
  },
  quinticIn: (k: number) => k * k * k * k * k,
  quinticOut: (k: number) => {
    let k1 = k;
    return --k1 * k1 * k1 * k1 * k1 + 1;
  },
  quinticInOut: (k: number) => {
    let k1 = k;
    if ((k1 *= 2) < 1) return 0.5 * k1 * k1 * k1 * k1 * k1;
    return 0.5 * ((k1 -= 2) * k1 * k1 * k1 * k1 + 2);
  },
  sinusoidalIn: (k: number) => 1 - Math.cos((k * Math.PI) / 2),
  sinusoidalOut: (k: number) => Math.sin((k * Math.PI) / 2),
  sinusoidalInOut: (k: number) => 0.5 * (1 - Math.cos(Math.PI * k)),
  exponentialIn: (k: number) => (k === 0 ? 0 : Math.pow(1024, k - 1)),
  exponentialOut: (k: number) => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  exponentialInOut: (k: number) => {
    if (k === 0) return 0;
    if (k === 1) return 1;
    let k1 = k;
    if ((k1 *= 2) < 1) return 0.5 * Math.pow(1024, k1 - 1);
    return 0.5 * (-Math.pow(2, -10 * (k1 - 1)) + 2);
  },
  circularIn: (k: number) => 1 - Math.sqrt(1 - k * k),
  circularOut: (k: number) => {
    let k1 = k;
    return Math.sqrt(1 - --k1 * k1);
  },
  circularInOut: (k: number) => {
    let k1 = k;
    if ((k1 *= 2) < 1) return -0.5 * (Math.sqrt(1 - k1 * k1) - 1);
    return 0.5 * (Math.sqrt(1 - (k1 -= 2) * k1) + 1);
  },
  elasticIn: (k: number) => {
    if (k === 0) return 0;
    if (k === 1) return 1;
    let a = 0.1;
    const p = 0.4;
    let s: number;
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    let k1 = k;
    return -(
      a *
      Math.pow(2, 10 * (k1 -= 1)) *
      Math.sin(((k1 - s) * (2 * Math.PI)) / p)
    );
  },
  elasticOut: (k: number) => {
    if (k === 0) return 0;
    if (k === 1) return 1;
    let a = 0.1;
    const p = 0.4;
    let s: number;
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    return (
      a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1
    );
  },
  elasticInOut: (k: number) => {
    if (k === 0) return 0;
    if (k === 1) return 1;
    let a = 0.1;
    const p = 0.4;
    let s: number;
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    let k1 = k;
    if ((k1 *= 2) < 1) {
      return (
        -0.5 *
        (a *
          Math.pow(2, 10 * (k1 -= 1)) *
          Math.sin(((k1 - s) * (2 * Math.PI)) / p))
      );
    }
    return (
      a *
        Math.pow(2, -10 * (k1 -= 1)) *
        Math.sin(((k1 - s) * (2 * Math.PI)) / p) *
        0.5 +
      1
    );
  },
  backIn: (k: number) => {
    const s = 1.70158;
    return k * k * ((s + 1) * k - s);
  },
  backOut: (k: number) => {
    let k1 = k;
    const s = 1.70158;
    return --k1 * k1 * ((s + 1) * k1 + s) + 1;
  },
  backInOut: (k: number) => {
    let k1 = k;
    const s = 1.70158 * 1.525;
    if ((k1 *= 2) < 1) return 0.5 * (k1 * k1 * ((s + 1) * k1 - s));
    return 0.5 * ((k1 -= 2) * k1 * ((s + 1) * k1 + s) + 2);
  },
  bounceIn: (k: number) => 1 - easingFuncs.bounceOut(1 - k),
  bounceOut: (k: number) => {
    let k1 = k;
    if (k1 < 1 / 2.75) return 7.5625 * k1 * k1;
    if (k1 < 2 / 2.75) return 7.5625 * (k1 -= 1.5 / 2.75) * k1 + 0.75;
    if (k1 < 2.5 / 2.75) return 7.5625 * (k1 -= 2.25 / 2.75) * k1 + 0.9375;
    return 7.5625 * (k1 -= 2.625 / 2.75) * k1 + 0.984375;
  },
  bounceInOut: (k: number) => {
    if (k < 0.5) return easingFuncs.bounceIn(k * 2) * 0.5;
    return easingFuncs.bounceOut(k * 2 - 1) * 0.5 + 0.5;
  },
};

function calcValue(
  startVal: number,
  targetVal: number,
  elapsedTimeRatio: number,
): number {
  const totalChangedVal = targetVal - startVal;
  const per = elapsedTimeRatio * totalChangedVal;
  let cur = startVal + per;
  const min = Math.min(startVal, targetVal);
  const max = Math.max(startVal, targetVal);
  return Math.max(min, Math.min(max, cur));
}

export const calcTargetValue = (
  startCount: number | number[],
  targetCount: number | number[],
  elapsedTimeRatio: number,
): number | number[] | undefined => {
  if (typeof startCount === 'number' && typeof targetCount === 'number') {
    return calcValue(startCount, targetCount, elapsedTimeRatio);
  }
  if (Array.isArray(startCount) && Array.isArray(targetCount)) {
    return startCount.map((item, index) =>
      calcValue(item, targetCount[index], elapsedTimeRatio),
    );
  }
};
