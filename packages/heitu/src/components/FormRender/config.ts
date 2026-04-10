import {
  AutoComplete,
  Cascader,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  TimePicker,
  TreeSelect,
  Upload,
} from 'antd';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeArr: [string, any][] = [
  // Input 系列
  ['Input', Input],
  ['Input.Textarea', Input.TextArea],
  ['Input.Password', Input.Password],
  ['Input.Search', Input.Search],
  ['InputNumber', InputNumber],
  // 选择器系列
  ['Select', Select],
  ['TreeSelect', TreeSelect],
  ['Cascader', Cascader],
  ['AutoComplete', AutoComplete],
  // 开关 / 滑块 / 评分
  ['Switch', Switch],
  ['Slider', Slider],
  ['Rate', Rate],
  // 单选 / 多选
  ['Radio', Radio.Group],
  ['Checkbox', Checkbox.Group],
  // 日期 / 时间
  ['DatePicker', DatePicker],
  ['RangePicker', DatePicker.RangePicker],
  ['TimePicker', TimePicker],
  // 上传
  ['Upload', Upload],
  ['Dragger', Upload.Dragger],
];

export const defaultNodeMap = new Map(nodeArr);
