import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@vuepkg/calendar/style.css'
import CalendarDemo from '../components/CalendarDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CalendarDemo', CalendarDemo)
  },
} satisfies Theme
