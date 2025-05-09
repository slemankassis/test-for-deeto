/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VENDOR_ID: string;
  // add more env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
