import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import HostIntegrationEntry from './e2e-hosts/HostIntegrationEntry.vue'

const hostLayout = new URLSearchParams(window.location.search).get('host')

createApp(hostLayout ? HostIntegrationEntry : App).mount('#app')
