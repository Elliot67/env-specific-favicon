import { createApp } from 'vue';
import App from './Options.vue';
import FloatingVue, { Dropdown, VClosePopper } from 'floating-vue';
import 'floating-vue/dist/style.css';

import '../styles';
import { FocusTrap } from 'focus-trap-vue';

FloatingVue.options.themes.dropdown.placement = 'bottom-end';
FloatingVue.options.themes.dropdown.distance = 0;

const app = createApp(App);
app.component('VDropdown', Dropdown);
app.directive('close-popper', VClosePopper);
app.component('FocusTrap', FocusTrap);
app.mount('#app');
