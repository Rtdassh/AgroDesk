import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return '';
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : '';
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;
          let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
          if (options?.domain) cookieStr += `; domain=${options.domain}`;
          if (options?.path) cookieStr += `; path=${options.path}`;
          if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`;
          if (options?.secure) cookieStr += `; secure`;
          // Omitimos intencionalmente maxAge y expires para que sea una cookie de sesion
          document.cookie = cookieStr;
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;
          let cookieStr = `${encodeURIComponent(name)}=; max-age=0`;
          if (options?.domain) cookieStr += `; domain=${options.domain}`;
          if (options?.path) cookieStr += `; path=${options.path}`;
          if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`;
          if (options?.secure) cookieStr += `; secure`;
          document.cookie = cookieStr;
        },
      },
    }
  );
}
