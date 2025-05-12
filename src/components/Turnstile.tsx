'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
    };
    onloadTurnstileCallback: () => void;
  }
}

export default function Turnstile({ siteKey, onVerify, theme = 'auto', size = 'normal' }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 加载 Turnstile 脚本
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      
      window.onloadTurnstileCallback = () => {
        setLoaded(true);
      };
      
      script.onload = window.onloadTurnstileCallback;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded && containerRef.current) {
      // 渲染 Turnstile 小部件
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        theme: theme,
        size: size,
      });
      
      setWidgetId(id);
      
      return () => {
        // 清理
        if (widgetId) {
          window.turnstile.reset(widgetId);
        }
      };
    }
  }, [loaded, siteKey, onVerify, theme, size]);

  return <div ref={containerRef} className="my-4"></div>;
}
