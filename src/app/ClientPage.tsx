'use client';

import { useEffect } from 'react';

type ClientPageProps = {
  html: string;
  scripts: string[];
  tweaks: Record<string, unknown>;
  bodyClass?: string | null;
};

/**
 * Renders the original static markup and boots the vanilla engine scripts in
 * order (Three.js first on the home page). The scripts run after hydration and
 * drive the DOM exactly as in the standalone build.
 */
export default function ClientPage({ html, scripts, tweaks, bodyClass }: ClientPageProps) {
  useEffect(() => {
    if (bodyClass) document.body.classList.add(bodyClass);

    // Guard against React Strict Mode's double effect invocation in dev.
    if (!window.__hk_booted) {
      window.__hk_booted = true;
      window.__TWEAKS__ = tweaks;

      let i = 0;
      const loadNext = () => {
        if (i >= scripts.length) return;
        const s = document.createElement('script');
        s.src = scripts[i++];
        s.async = false;
        s.onload = loadNext;
        s.onerror = loadNext;
        document.body.appendChild(s);
      };
      loadNext();
    }

    return () => {
      if (bodyClass) document.body.classList.remove(bodyClass);
    };
  }, [bodyClass, scripts, tweaks]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
