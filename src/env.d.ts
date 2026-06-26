/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** (선택) SpcdeInfoService BFF/same-origin URL. 미설정 시 `/api/spcde/getRestDeInfo` */
  readonly VITE_SPCDE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
