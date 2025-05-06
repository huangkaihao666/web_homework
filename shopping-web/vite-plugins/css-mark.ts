// css-mark.ts
import { parse } from '@vue/compiler-sfc';
import LZString from 'lz-string';
import type { Plugin } from 'vite';

export const cssMarkPreset = (): Plugin => {
  return {
    name: 'vite-plugin-vue-css-mark-preset',
    transform(code, id) {
      if (!id.endsWith('.vue')) {
        return null;
      }

      const { template } = parse(code).descriptor;

      if (template && template.ast && template.ast.children) {
        const elm = template.ast.children.find(item => item.type === 1); // 1是元素节点
        if (elm) {
          const tagString = `<${elm.tag}`;
          const insertIndex = elm.loc.source.indexOf(tagString) + tagString.length;
          
          const newSource = 
            `${elm.loc.source.slice(0, insertIndex)} css-mark="${LZString.compressToBase64(id)}"${elm.loc.source.slice(insertIndex)}`;
          
          code = code.replace(elm.loc.source, newSource);
        }
      }

      return code;
    },
  };
};

export const cssMarkNodeTransform = (node, context) => {
  // NodeTypes: ROOT=0, ELEMENT=1, IF_BRANCH=10
  if (node.type === 1 && context.parent) {
    if ([0, 10].includes(context.parent.type)) {
      const firstElm = context.parent.children.find(item => item.type === 1);
      const markAttr = firstElm && firstElm.props && firstElm.props.find(item => item.name === 'css-mark');
      const markValue = markAttr && markAttr.value && markAttr.value.content;
      
      if (markValue) {
        // 统一处理，不区分组件类型
        addClass(node, markValue, 'class');
      }
    } else if (context.parent.props) {
      const parentMarkAttr = context.parent.props.find(item => item.name === 'css-mark');
      const parentMarkValue = parentMarkAttr && parentMarkAttr.value && parentMarkAttr.value.content;
      
      if (parentMarkValue) {
        // 为子组件添加标记
        addClass(node, parentMarkValue, 'class');
      }
    }
  }
};

// 辅助函数，添加类名
function addClass(node, markValue, className) {
  const prefix = 'css-vite-mark-';
  const addInfo = `${prefix}${markValue}`;
  const classAttr = node.props && node.props.find(prop => prop.type === 6 && prop.name === className);
  if (classAttr) {
    classAttr.value.content += ` ${addInfo}`;
  } else {
    node.props.push({
      type: 6, // ATTRIBUTE
      name: className,
      value: {
        type: 2, // TEXT
        content: addInfo,
        loc: node.loc,
      },
      loc: node.loc,
    });
  }
}