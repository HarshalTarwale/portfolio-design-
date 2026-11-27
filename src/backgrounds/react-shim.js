// Just enough of React to run the React Bits background components unchanged:
// they render one <div>/<canvas>, keep refs, and do all their work in effects.
// The components never re-render here, so every effect runs once on mount and cleans up on destroy.
let pending = null;

export const useRef = initial => ({ current: initial });
export const useEffect = fn => { pending.push(fn); };
export const useLayoutEffect = useEffect;
export const useMemo = fn => fn();
export const useCallback = fn => fn;
export const useState = initial => [typeof initial === 'function' ? initial() : initial, () => {}];
export const Fragment = 'fragment';

const setProp = (el, key, value) => {
  if (value == null || value === false || key === 'children') return;
  if (key === 'ref') { value.current = el; return; }
  if (key === 'className') { el.setAttribute('class', value); return; }
  if (key === 'style') { Object.assign(el.style, value); return; }
  if (key.startsWith('on') && typeof value === 'function') { el.addEventListener(key.slice(2).toLowerCase(), value); return; }
  el.setAttribute(key, value === true ? '' : value);
};

const append = (parent, child) => {
  if (child == null || child === false) return;
  if (Array.isArray(child)) child.forEach(c => append(parent, c));
  else parent.append(child instanceof Node ? child : String(child));
};

export const jsx = (type, props = {}) => {
  if (typeof type === 'function') return type(props);
  const el = type === Fragment ? document.createDocumentFragment() : document.createElement(type);
  if (type !== Fragment) for (const key in props) setProp(el, key, props[key]);
  append(el, props.children);
  return el;
};
export const jsxs = jsx;
export const createElement = (type, props, ...children) => jsx(type, { ...props, children });

export default { useRef, useEffect, useLayoutEffect, useMemo, useCallback, useState, Fragment, createElement };

/** Render `Component` into `container`; returns { destroy }. */
export function mount(Component, container, props = {}) {
  pending = [];
  const node = Component(props);
  const effects = pending;
  pending = null;
  container.append(node);
  const cleanups = effects.map(fn => fn()).filter(fn => typeof fn === 'function');
  return {
    node,
    destroy() {
      cleanups.forEach(fn => fn());
      node.remove?.();
    }
  };
}
