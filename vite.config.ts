import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function appendServiceKeyToProxyPath(pathWithQuery: string, serviceKey: string): string {
  const [pathname, search = ''] = pathWithQuery.split('?')
  const params = new URLSearchParams(search)

  if (!params.has('serviceKey')) {
    params.set('serviceKey', serviceKey)
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

function createSpcdeProxy(serviceKey: string) {
  return {
    // 공공데이터포털 API는 브라우저 직접 호출 시 CORS 제한 → dev/preview 프록시 사용
    '/api/spcde': {
      target: 'http://apis.data.go.kr',
      changeOrigin: true,
      rewrite: (requestPath: string) => {
        const upstreamPath = requestPath.replace(
          /^\/api\/spcde/,
          '/B090041/openapi/service/SpcdeInfoService',
        )

        if (!serviceKey) {
          return upstreamPath
        }

        return appendServiceKeyToProxyPath(upstreamPath, serviceKey)
      },
    },
  } as const
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const serviceKey = env.DATA_GO_KR_SERVICE_KEY ?? env.VITE_DATA_GO_KR_SERVICE_KEY ?? ''

  return {
    server: {
      port: 6565,
      proxy: createSpcdeProxy(serviceKey),
    },
    preview: {
      proxy: createSpcdeProxy(serviceKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
      },
    },
    plugins: [
      vue(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/views/ListView.vue')) {
              return 'list-view'
            }
          },
        },
      },
    },
  }
})
