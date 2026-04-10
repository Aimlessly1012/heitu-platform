import { Divider, Form, Row } from 'antd';
import { isEqual } from 'lodash-es';
import React from 'react';

import type { IConfigItem, IDividerItem, IFormRenderProps, IItem } from './interface';
import ItemRender from './ItemRender';

/** 类型守卫：判断是否为分割线配置 */
function isDivider(item: IConfigItem): item is IDividerItem {
  return typeof item === 'object' && item !== null && 'divider' in item && item.divider === true;
}

function FormRender(props: React.PropsWithChildren<IFormRenderProps>) {
  const {
    config,
    layout = 'vertical',
    gutter = [10, 0],
    isSub,
    ...others
  } = props;

  // 内部实例 form
  const [_form] = Form.useForm();
  const form = props.form ? props.form : _form;

  if (!Array.isArray(config)) {
    return null;
  }

  const content = (
    <>
      {[...config].map((firstItem, index) => {
        // ── 分割线处理 ──
        if (!Array.isArray(firstItem) && isDivider(firstItem)) {
          return (
            <Divider
              key={`divider_${index}`}
              titlePlacement={firstItem.titlePlacement}
            >
              {firstItem.label}
            </Divider>
          );
        }

        // ── 二维数组：一行多列 ──
        if (Array.isArray(firstItem)) {
          const columnCount = firstItem.length;
          const span = columnCount > 4 ? 6 : 24 / columnCount;

          return (
            <Row
              gutter={gutter}
              key={String(columnCount) + String(index)}
            >
              {firstItem.map((secondItem, secondIndex) => {
                // 行内也可能有分割线
                if (isDivider(secondItem)) {
                  return (
                    <Divider
                      key={`divider_${index}_${secondIndex}`}
                      titlePlacement={secondItem.titlePlacement}
                    >
                      {secondItem.label}
                    </Divider>
                  );
                }
                return (
                  <ItemRender
                    key={`${String((secondItem as IItem).name)}_${String(index)}_${secondIndex}`}
                    data={secondItem as IItem}
                    form={form}
                    span={(secondItem as IItem)?.span ?? span}
                  />
                );
              })}
            </Row>
          );
        }

        // ── 一维：每行一项 ──
        const item = firstItem as IItem;

        // 兼容旧的 type: 'Line' 语法
        if (item.type === 'Line') {
          return (
            <Divider key={`line_${index}`}>{item.label}</Divider>
          );
        }

        return (
          <Row
            gutter={gutter}
            key={String(item.name) + String(index)}
          >
            <ItemRender
              data={item}
              form={form}
              span={item?.span ?? 24}
            />
          </Row>
        );
      })}
      {props.children}
    </>
  );

  // isSub 模式下不包裹 Form 标签
  if (isSub) {
    return content;
  }

  return (
    <Form layout={layout} form={form} {...others}>
      {content}
    </Form>
  );
}

export default React.memo(FormRender, (prevProps, nextProps) => {
  // 仅对 config 做深比较，其余 props 使用浅比较
  if (!isEqual(prevProps.config, nextProps.config)) {
    return false;
  }
  const { config: _pc, ...prevRest } = prevProps;
  const { config: _nc, ...nextRest } = nextProps;
  return Object.keys(prevRest).length === Object.keys(nextRest).length &&
    Object.keys(prevRest).every(
      (key) => prevRest[key as keyof typeof prevRest] === nextRest[key as keyof typeof nextRest],
    );
});
