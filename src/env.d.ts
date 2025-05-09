/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VENDOR_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
