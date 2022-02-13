import { createApp } from 'vue';
import App from './Options.vue';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

import '../styles';

FloatingVue.options.themes.dropdown.placement = 'bottom-end';
FloatingVue.options.themes.dropdown.distance = 0;

const app = createApp(App);
app.mount('#app');
