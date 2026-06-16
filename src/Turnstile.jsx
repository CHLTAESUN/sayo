// Cloudflare Turnstile(봇 차단 캡차) 위젯.
// VITE_TURNSTILE_SITE_KEY 가 없으면 아무것도 렌더하지 않음(=캡차 비활성, 기존 흐름 유지).
import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
export const TURNSTILE_ENABLED = !!SITE_KEY;

let scriptPromise;
function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function Turnstile({ onToken }) {
  const ref = useRef(null);
  const widgetId = useRef(null);
  useEffect(() => {
    if (!SITE_KEY) return;
    let active = true;
    loadScript().then(() => {
      if (!active || !window.turnstile || !ref.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
    });
    return () => {
      active = false;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* noop */ }
      }
    };
  }, []);
  if (!SITE_KEY) return null;
  return <div ref={ref} className="turnstile-widget" />;
}
