interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
  put(key: string, value: string | ReadableStream | ArrayBuffer | FormData): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number }[]; list_complete: boolean; cursor?: string }>;
}

declare global {
  const LINKS_KV: KVNamespace;

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
      TURNSTILE_SECRET_KEY: string;
      NEXT_PUBLIC_ENABLE_TURNSTILE: string;
      NEXT_PUBLIC_ANNOUNCEMENT_TITLE_ZH_CN: string;
      NEXT_PUBLIC_ANNOUNCEMENT_CONTENT_ZH_CN: string;
      NEXT_PUBLIC_ANNOUNCEMENT_TITLE_EN_US: string;
      NEXT_PUBLIC_ANNOUNCEMENT_CONTENT_EN_US: string;
      NEXT_PUBLIC_ANNOUNCEMENT_TYPE: 'info' | 'warning' | 'success' | 'error';
      NEXT_PUBLIC_GITHUB_URL: string;
      JWT_SECRET: string;
      ADMIN_USERNAME: string;
      ADMIN_PASSWORD: string;
    }
  }
}

export {};
