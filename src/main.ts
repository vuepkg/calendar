import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import './style.css'
import App from './App.vue'
import HostIntegrationEntry from './e2e-hosts/HostIntegrationEntry.vue'

const hostLayout = new URLSearchParams(window.location.search).get('host')

const app = createApp(hostLayout ? HostIntegrationEntry : App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})

app.mount('#app')
