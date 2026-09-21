import React, { useEffect } from 'react';

declare global {
  interface Window {
    disqus_config?: (this: { page: { url?: string; identifier?: string } }) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: { page: { url?: string; identifier?: string } }) => void;
      }) => void;
    };
  }
}

const DISQUS_SHORTNAME = 'SGbusTracker';
const PAGE_URL = 'https://mgmt-6110-week03-assignment.vercel.app/';
const PAGE_IDENTIFIER = 'home';
const SCRIPT_ID = 'disqus-embed-script';

export function DisqusComments() {
  useEffect(() => {
    // Intercept and suppress cross-origin Script errors originating from third-party widgets
    const handleScriptError = (event: ErrorEvent) => {
      if (
        event.message === 'Script error.' ||
        (typeof event.filename === 'string' && event.filename.includes('disqus'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };
    window.addEventListener('error', handleScriptError);

    // Set fallback global variables for Disqus legacy compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    win.disqus_shortname = DISQUS_SHORTNAME;
    win.disqus_url = PAGE_URL;
    win.disqus_identifier = PAGE_IDENTIFIER;

    // Configure Disqus thread parameters safely (ensuring this.page object exists)
    win.disqus_config = function (this: { page?: { url?: string; identifier?: string } }) {
      const context = this && typeof this === 'object' ? this : win;
      if (!context.page) {
        context.page = {};
      }
      context.page.url = PAGE_URL;
      context.page.identifier = PAGE_IDENTIFIER;
    };

    const threadEl = document.getElementById('disqus_thread');
    if (!threadEl) {
      return () => {
        window.removeEventListener('error', handleScriptError);
      };
    }

    if (win.DISQUS && typeof win.DISQUS.reset === 'function') {
      try {
        win.DISQUS.reset({
          reload: true,
          config: function (this: { page?: { url?: string; identifier?: string } }) {
            const context = this && typeof this === 'object' ? this : win;
            if (!context.page) {
              context.page = {};
            }
            context.page.url = PAGE_URL;
            context.page.identifier = PAGE_IDENTIFIER;
          },
        });
      } catch {
        // Suppress non-fatal Disqus reset errors in preview iframes
      }
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(Date.now()));
      script.async = true;
      script.onerror = () => {
        // Non-fatal if Disqus is blocked by ad-blocker or iframe security policy
      };
      (document.head || document.body).appendChild(script);
    }

    return () => {
      window.removeEventListener('error', handleScriptError);
    };
  }, []);

  return (
    <section id="disqus-feedback-container" className="max-w-xl mx-auto px-4 mt-6">
      <div
        id="disqus-feedback-card"
        className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs"
      >
        <p id="disqus-invitation-text" className="text-sm font-medium text-slate-700 mb-4">
          Tell us what worked for you and what did not.
        </p>
        <div id="disqus_thread" className="min-h-[140px]" />
      </div>
    </section>
  );
}
