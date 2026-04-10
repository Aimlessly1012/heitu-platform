import { isStage } from 'heitu/canvas/utils';
import { isFunction } from 'heitu/utils/is';
import { forIn, isEmpty } from 'lodash-es';
import Stage from '../stage';
import Container, { ChildType } from '../stage/container';
import { handleDragStart, handleDragMove, handleDragEnd } from './drag';

export type ICoord = { x: number; y: number };
type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any;
};

export type EventListener<This, EventType> = (
  this: This,
  ev: EventObject<EventType, This>,
) => void;

export interface EventObject<EventType, This = Node> {
  type: string;
  target: Stage;
  evt: EventType;
  pointerId: number;
  currentTarget: This;
  cancelBubble: boolean;
  child?: Node;
}

abstract class Node {
  eventListeners: {
    [index: string]: Array<{ name: string; handler: any }>;
  } = {};

  abstract parent?: Stage | null;

  on<K extends keyof NodeEventMap>(
    evtStr: K,
    handler: EventListener<this, NodeEventMap[K]>,
  ) {
    const events = (evtStr as string).split(' ');
    for (let n = 0; n < events.length; n++) {
      const parts = events[n].split('.');
      const baseEvent = parts[0];
      if (!this.eventListeners[baseEvent]) {
        this.eventListeners[baseEvent] = [];
      }
      this.eventListeners[baseEvent].push({
        name: handler?.name || '',
        handler,
      });
    }
    return this;
  }

  _off(type: string, name?: string, callback?: (params: any) => void) {
    const evtListeners = this.eventListeners[type];
    for (let i = 0; i < evtListeners.length; i++) {
      const evtName = evtListeners[i].name;
      const handler = evtListeners[i].handler;
      if ((!name || evtName === name) && (!callback || callback === handler)) {
        evtListeners.splice(i, 1);
        if (evtListeners.length === 0) {
          delete this.eventListeners[type];
          break;
        }
        i--;
      }
    }
  }

  off(evtStr?: string, callback?: (params: any) => void) {
    const events = (evtStr || '').split(' ');
    for (let n = 0; n < events.length; n++) {
      const parts = events[n].split('.');
      const baseEvent = parts[0];
      const name = parts[1];
      if (baseEvent) {
        if (this.eventListeners[baseEvent]) {
          this._off(baseEvent, name, callback);
        }
      } else {
        for (const t in this.eventListeners) {
          this._off(t, name, callback);
        }
      }
    }
    return this;
  }

  /** 触发单个节点 / Stage 上的事件监听器 */
  _fire(eventType: string, evt: MouseEvent, currentTarget: any) {
    if (isStage(currentTarget)) {
      this.eventListeners[eventType]?.forEach((item) => {
        item.handler(evt);
      });
    } else {
      if (currentTarget?.eventListeners?.[eventType]?.length > 0) {
        currentTarget.eventListeners[eventType].forEach(
          (item: { handler: (evt: MouseEvent, node: any) => void }) => {
            item.handler(evt, currentTarget);
          },
        );
      }
      if (currentTarget?.draggable) {
        if (isFunction(currentTarget?.draggable) && currentTarget.dragging) {
          currentTarget.draggable(evt, currentTarget);
        }
        currentTarget.eventListeners?.[eventType]?.forEach(
          (item: { handler: (evt: MouseEvent, node: any) => void }) => {
            item.handler(evt, currentTarget);
          },
        );
      }
    }
  }

  /**
   * 事件分发入口:
   * Stage 级别 → 触发自身监听 → 处理拖拽 → 冒泡到子节点
   * Shape 级别 → 拖拽状态机 → 碰撞检测 + 事件触发 → mouseenter/leave 合成
   */
  fire(
    eventType: string,
    {
      evt,
      target,
      currentTarget,
    }: { evt: MouseEvent; target: Stage; currentTarget: any },
  ) {
    if (isStage(currentTarget)) {
      this._ensureEventList(eventType);
      this._fire(eventType, evt, currentTarget);
      this._dispatchToChildren(eventType, evt, target);
    } else {
      this._handleShapeEvent(eventType, evt, target, currentTarget);
    }
  }

  // ── 以下为 fire 拆出的私有方法 ──

  /** 确保 eventListeners[type] 已初始化 */
  private _ensureEventList(eventType: string) {
    if (!this.eventListeners[eventType]?.length) {
      this.eventListeners[eventType] = [];
    }
  }

  /** Stage → 子节点冒泡(含拖拽初始化) */
  private _dispatchToChildren(
    eventType: string,
    evt: MouseEvent,
    target: Stage,
  ) {
    const children = target.children;

    // mousedown 拖拽初始化 — 只需执行一次(不放在循环内)
    if (eventType === 'mousedown') {
      handleDragStart(children, evt, target.canvas?.context);
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as ChildType;
      if (!isEmpty(child?.eventListeners) || child?.draggable) {
        this.fire(eventType, { evt, target, currentTarget: child });
      }
    }
  }

  /** Shape 级别事件处理:拖拽 + 碰撞 + mouseenter/leave 合成 */
  private _handleShapeEvent(
    eventType: string,
    evt: MouseEvent,
    target: Stage,
    currentTarget: ChildType,
  ) {
    // 拖拽释放
    if (eventType === 'mouseup') {
      handleDragEnd(currentTarget);
    }
    // 拖拽移动
    if (eventType === 'mousemove') {
      handleDragMove(
        currentTarget,
        target,
        evt,
        this as unknown as Container,
      );
    }
    // 碰撞检测 + 事件触发
    if (!currentTarget?.inScope || !target.canvas?.context) return;

    if (currentTarget.inScope(evt, target.canvas.context)) {
      // 非 enter/leave/out/over 事件正常触发
      if (
        eventType !== 'mouseenter' &&
        eventType !== 'mouseleave' &&
        eventType !== 'mouseout' &&
        eventType !== 'mouseover'
      ) {
        this._fire(eventType, evt, currentTarget);
      }
      // mousemove + 首次进入 → 合成 mouseenter
      if (
        eventType === 'mousemove' &&
        !currentTarget.mouseInScope &&
        currentTarget.eventListeners.mouseenter?.length > 0
      ) {
        currentTarget.mouseInScope = true;
        target._fire('mouseenter', evt, currentTarget);
      }
    } else {
      // 移出 → 合成 mouseleave
      if (eventType === 'mousemove') {
        currentTarget.mouseInScope = false;
        if (target.eventListeners['mouseleave']?.length > 0) {
          target._fire('mouseleave', evt, currentTarget);
        }
      }
    }
  }

  attr(props: any) {
    if (!this.parent) return;
    forIn(props, (value, key) => {
      if (value) (this as any)[key] = value;
    });
    this.parent?.batchDraw(this.parent);
  }
}

export default Node;
