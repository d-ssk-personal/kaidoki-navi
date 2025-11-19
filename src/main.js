import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import { useAuthStore } from './store/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 認証状態を復元
const authStore = useAuthStore()
authStore.checkAuth()

app.mount('#app')