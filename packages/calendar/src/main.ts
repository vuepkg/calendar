import { createApp } from 'vue'
import '@vuepkg/theme/index.css'
import './style.css'
import './app.css'
import App from './App.vue'
import HostIntegrationEntry from './e2e-hosts/HostIntegrationEntry.vue'

const hostLayout = new URLSearchParams(window.location.search).get('host')

createApp(hostLayout ? HostIntegrationEntry : App).mount('#app')
