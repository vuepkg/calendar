<script setup lang="ts">
import { computed, type Component } from 'vue'
import HostAppChrome from './layouts/HostAppChrome.vue'
import HostFixedPanel from './layouts/HostFixedPanel.vue'
import HostMinimal from './layouts/HostMinimal.vue'
import HostNestedCard from './layouts/HostNestedCard.vue'
import HostSidebar from './layouts/HostSidebar.vue'
import type { HostLayoutId } from '@/types/e2e'

const LAYOUTS: Record<HostLayoutId, Component> = {
  minimal: HostMinimal,
  'fixed-panel': HostFixedPanel,
  sidebar: HostSidebar,
  'app-chrome': HostAppChrome,
  'nested-card': HostNestedCard,
}

function resolveLayoutId(): HostLayoutId {
  const value = new URLSearchParams(window.location.search).get('host')
  if (value && value in LAYOUTS) {
    return value as HostLayoutId
  }
  return 'minimal'
}

const layoutId = computed(() => resolveLayoutId())
const layoutComponent = computed(() => LAYOUTS[layoutId.value])
</script>

<template>
  <component :is="layoutComponent" />
</template>
