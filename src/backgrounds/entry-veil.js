import { mount } from './react-shim.js';
import C from './DarkVeil.jsx';
(window.HeroBG ||= {}).veil = (el, props) => mount(C, el, props);
