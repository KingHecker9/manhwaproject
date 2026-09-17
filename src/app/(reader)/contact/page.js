import { Mail, MessageSquare, Send, Sparkles } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            Contact & Submissions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Have questions, feedback, or want to publish your original manhwa series? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Subject
            </label>
            <select className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-indigo-500 transition-colors">
              <option value="creator">Publishing / Author Inquiry</option>
              <option value="feedback">General Feedback</option>
              <option value="bug">Report a Reading Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Tell us what you have in mind..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </main>
  );
}