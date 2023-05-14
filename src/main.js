import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import VueTelegram from "vue-tg"

const app = createApp(App)
app.use(VueTelegram)
app.use(router)
app.use(createPinia())
app.mount('#app')
