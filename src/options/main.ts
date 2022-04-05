import { createApp } from 'vue';
import App from './Options.vue';
import FloatingVue, { Dropdown, VClosePopper } from 'floating-vue';
import 'floating-vue/dist/style.css';

import '../styles';

FloatingVue.options.themes.dropdown.placement = 'bottom-end';
FloatingVue.options.themes.dropdown.distance = 0;

const app = createApp(App);
app.component('VDropdown', Dropdown);
app.directive('close-popper', VClosePopper);
app.mount('#app');
