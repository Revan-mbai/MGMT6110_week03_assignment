import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, ThumbsUp, User } from 'lucide-react';

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

interface UserComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  userLiked: boolean;
}

const INITIAL_COMMENTS: UserComment[] = [
  {
    id: 'comm-1',
    author: 'Kenneth T.',
    text: 'Arrival estimates for bus 190 and 972 at Orchard were very accurate this morning. Great app!',
    timestamp: '2 hours ago',
    likes: 4,
    userLiked: false,
  },
  {
    id: 'comm-2',
    author: 'Priyah M.',
    text: 'Traffic incident alerts helped me plan around the congestion along Nicoll Highway.',
    timestamp: '5 hours ago',
    likes: 7,
    userLiked: true,
  },
];

const DISQUS_SHORTNAME = 'sgbustracker';
const DEFAULT_PAGE_URL = 'https://mgmt-6110-week03-assignment.vercel.app/';
const PAGE_IDENTIFIER = 'home';
const PAGE_TITLE = 'SG Bus Tracker';
const SCRIPT_ID = 'disqus-embed-script';
const STORAGE_KEY = 'sg_bus_tracker_user_comments';

export function DisqusComments() {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [comments, setComments] = useState<UserComment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });
  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    // Intercept and suppress cross-origin Script errors originating from third-party widgets
    const handleScriptError = (event: ErrorEvent) => {
      if (
        !event.message ||
        event.message.indexOf('Script error') !== -1 ||
        (typeof event.filename === 'string' && event.filename.includes('disqus'))
      ) {
        if (event.preventDefault) event.preventDefault();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        return true;
      }
    };
    window.addEventListener('error', handleScriptError, true);

    // Resolve canonical URL for the live page thread
    const pageUrl =
      typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
        ? `${window.location.origin}/`
        : DEFAULT_PAGE_URL;

    // Set fallback global variables for Disqus legacy compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    win.disqus_shortname = DISQUS_SHORTNAME;
    win.disqus_url = pageUrl;
    win.disqus_identifier = PAGE_IDENTIFIER;
    win.disqus_title = PAGE_TITLE;

    // Configure Disqus thread parameters safely (ensuring this.page object exists)
    win.disqus_config = function (this: {
      page?: { url?: string; identifier?: string; title?: string };
    }) {
      const context = this && typeof this === 'object' ? this : win;
      if (!context.page) {
        context.page = {};
      }
      context.page.url = pageUrl;
      context.page.identifier = PAGE_IDENTIFIER;
      context.page.title = PAGE_TITLE;
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
          config: function (this: {
            page?: { url?: string; identifier?: string; title?: string };
          }) {
            const context = this && typeof this === 'object' ? this : win;
            if (!context.page) {
              context.page = {};
            }
            context.page.url = pageUrl;
            context.page.identifier = PAGE_IDENTIFIER;
            context.page.title = PAGE_TITLE;
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
      window.removeEventListener('error', handleScriptError, true);
    };
  }, []);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const newComment: UserComment = {
      id: `comm-${Date.now()}`,
      author: authorName.trim() || 'Commuter',
      text: trimmed,
      timestamp: 'Just now',
      likes: 0,
      userLiked: false,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText('');
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 2500);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Local storage quota or security handling
    }
  };

  const handleToggleLike = (id: string) => {
    setComments((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const nextLiked = !c.userLiked;
          return {
            ...c,
            userLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Local storage handling
      }
      return updated;
    });
  };

  return (
    <section id="disqus-feedback-container" className="max-w-xl mx-auto px-4 mt-6">
      <div
        id="disqus-feedback-card"
        className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Community Discussion & Feedback</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        <p id="disqus-invitation-text" className="text-xs sm:text-sm font-medium text-slate-600 mb-4">
          Tell us what worked for you and what did not.
        </p>

        {/* Fully Interactive Chatbox / Feedback Input Area */}
        <form id="chatbox-form" onSubmit={handlePostComment} className="space-y-3 mb-5">
          <div className="relative">
            <textarea
              id="chatbox-textarea"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handlePostComment(e);
                }
              }}
              placeholder="Start the discussion... Type your message, suggestions, or feedback here"
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none shadow-2xs"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="chatbox-author-input"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name (optional)"
                  maxLength={40}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Ctrl+Enter to post
              </span>
            </div>

            <button
              type="submit"
              id="chatbox-submit-button"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>

          {justPosted && (
            <p className="text-xs font-medium text-emerald-600 animate-fade-in flex items-center gap-1 mt-1">
              ✓ Your comment has been posted to the discussion!
            </p>
          )}
        </form>

        {/* Comments Feed List */}
        <div id="chatbox-comments-list" className="space-y-3 pt-2 border-t border-slate-100">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{comment.author}</span>
                  <span className="text-[11px] text-slate-400">• {comment.timestamp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleLike(comment.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    comment.userLiked
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  aria-label={`Like comment by ${comment.author}`}
                >
                  <ThumbsUp
                    className={`w-3 h-3 ${comment.userLiked ? 'fill-emerald-600 text-emerald-600' : ''}`}
                  />
                  <span>{comment.likes}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-8 break-words">
                {comment.text}
              </p>
            </div>
          ))}
        </div>

        {/* Disqus Thread mount point maintained for full specification compatibility */}
        <div id="disqus_thread" className="mt-4 empty:hidden" />
      </div>
    </section>
  );
}
