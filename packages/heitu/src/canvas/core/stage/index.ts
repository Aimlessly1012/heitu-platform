import { isStage } from 'heitu/canvas/utils';
import { Vector2d } from '../type';
import { Canvas } from './canvas';
import Container from './container';

export interface IOption {
  container: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

interface EventConfig {
  /** 是否在非 Stage 实例上跳过(mouseenter/mouseleave) */
  guardStage?: boolean;
  /** 是否阻止默认行为(contextmenu) */
  preventDefault?: boolean;
}

/**
 * DOM 事件 → fire 事件名 → 额外配置
 */
const EVENT_CONFIG: Array<[string, string, EventConfig?]> = [
  ['mouseenter', 'mouseenter', { guardStage: true }],
  ['mouseleave', 'mouseleave', { guardStage: true }],
  ['mousedown', 'mousedown'],
  ['mousemove', 'mousemove'],
  ['mouseup', 'mouseup'],
  ['mouseout', 'mouseout'],
  ['mouseover', 'mouseover'],
  ['contextmenu', 'contextmenu', { preventDefault: true }],
  ['wheel', 'wheel'],
  ['click', 'click'],
  ['dblclick', 'dblclick'],
];

class Stage extends Container {
  name = 'Stage';
  parent = null;
  content: HTMLElement | null;
  canvas: Canvas | null;
  width: number;
  height: number;
  draggable: boolean;
  isFirstRender: boolean;
  _pointerPositions: (Vector2d & { id?: number })[] = [];
  _changedPointerPositions: (Vector2d & { id: number })[] = [];
  pointerPos: Vector2d | null = null;
  private _eventHandlers: Array<[string, (evt: any) => void]> = [];

  constructor() {
    super();
    this.content = null;
    this.canvas = null;
    this.width = 100;
    this.height = 500;
    this.isFirstRender = true;
    this.draggable = false;
  }

  // ── DOM 构建 ──

  buildContentDOM(config: IOption) {
    if (!(config.container instanceof HTMLElement)) {
      throw new Error('The provided variable is not an HTMLElement.');
    }
    const width = config.width ? `${config.width}px` : `${this.width}%`;
    const height = config.height ? `${config.height}px` : `${this.height}px`;
    this.content = config.container;
    this.content.style.position = 'relative';
    this.content.id = 'Heitu-Stage';
    this.content.className = 'heituStage';
    this.content.style.width = width;
    this.content.style.height = height;

    this.canvas = new Canvas();
    this.setContainer(
      this.content.offsetWidth,
      this.content.offsetHeight,
      config.backgroundColor,
    );
    this._bindContentEvents();
  }

  setContainer(width: number, height: number, backgroundColor?: string) {
    if (this.content && this.canvas) {
      this.canvas.getCanvasDom(width, height, backgroundColor);
      this.content.appendChild(this.canvas.canvas);
    }
  }

  // ── 销毁 ──

  destroy() {
    // 清理 DOM 事件监听
    if (this.content?.removeEventListener) {
      this._eventHandlers.forEach(([event, handler]) => {
        this.content?.removeEventListener(event, handler);
      });
    }
    this._eventHandlers = [];
    // 移除 canvas DOM
    if (this.content && this.canvas?.canvas?.parentNode === this.content) {
      this.content.removeChild(this.canvas.canvas);
    }
    this.content = null;
    this.canvas = null;
    this.pointerPos = null;
    this.width = 0;
    this.height = 0;
    this.draggable = false;
  }

  // ── resize ──

  _resizeDOM() {
    if (this.content && this.canvas) {
      this.width = this.content.offsetWidth;
      this.height = this.content.offsetHeight;
      this.canvas.setSize(this.content.offsetWidth, this.content.offsetHeight);
      if (this.canvas?.context) this.batchDraw(this);
    }
  }

  // ── 指针坐标 ──

  setPointersPositions(evt: MouseEvent) {
    if (!this.content?.getBoundingClientRect) {
      return { top: 0, left: 0, scaleX: 1, scaleY: 1 };
    }
    const rect = this.content.getBoundingClientRect();
    const scaleX = rect.width / this.content.clientWidth || 1;
    const scaleY = rect.height / this.content.clientHeight || 1;
    this.pointerPos = {
      x: (evt.clientX - rect.left) / scaleX,
      y: (evt.clientY - rect.top) / scaleY,
    };
  }

  // ── 事件绑定(配置驱动) ──

  /** 通用事件处理器 — 替代原来的 11 个 _mouseXxx 方法 */
  private _handleEvent(
    fireEvent: string,
    evt: MouseEvent,
    config?: EventConfig,
  ) {
    if (config?.guardStage && !isStage(this)) return;
    if (config?.preventDefault) evt.preventDefault();
    this.setPointersPositions(evt);
    this.fire(fireEvent, { evt, target: this, currentTarget: this });
  }

  _bindContentEvents() {
    if (!this.content?.addEventListener) return;
    EVENT_CONFIG.forEach(([domEvent, fireEvent, config]) => {
      const handler = (evt: Event) => {
        this._handleEvent(fireEvent, evt as MouseEvent, config);
      };
      this._eventHandlers.push([domEvent, handler]);
      this.content?.addEventListener(domEvent, handler, { passive: false });
    });
  }
}

export default Stage;
