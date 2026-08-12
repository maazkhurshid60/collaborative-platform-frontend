import React, { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";

interface BaaModalProps {
  title: string;
  content: string;
  onAgree: () => void;
  onCancel: () => void;
}

const BaaModal: React.FC<BaaModalProps> = ({
  title,
  content,
  onAgree,
  onCancel,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Track scroll to encourage reading
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 60;
    if (atBottom) setHasScrolledToBottom(true);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 px-4"
      onClick={onCancel}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "baaFadeIn 0.22s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#1a5f6e] to-[#2C9993] rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
              <p className="text-teal-100 text-xs font-medium mt-0.5">
                Please read the full agreement before proceeding
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors" aria-label="Close">
            <RxCross2 size={20} />
          </button>
        </div>

        {/* Scroll hint banner */}
        {!hasScrolledToBottom ? (
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-amber-700 font-medium">
              Please scroll through the entire document before accepting.
            </span>
          </div>
        ) : (
          <div className="flex-shrink-0 bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-emerald-700 font-medium">You have read the full document.</span>
          </div>
        )}

        {/* Scrollable document body */}
        <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto flex-1 px-6 py-5" style={{ minHeight: 0 }}>
          <div
            className="baa-doc-content text-gray-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer / Agreement section */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 rounded-b-2xl px-6 py-5 space-y-4">
          <label htmlFor="baa-agree-checkbox" className="flex items-start gap-3 cursor-pointer group">
            <span className="relative shrink-0 mt-0.5">
              <input
                id="baa-agree-checkbox"
                type="checkbox"
                className="peer sr-only"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="block w-5 h-5 rounded-[5px] border-2 border-gray-300 bg-white peer-checked:bg-[#2C9993] peer-checked:border-[#2C9993] transition-all shadow-sm group-hover:border-[#2C9993]">
                <svg className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </span>
            <span className="text-sm text-gray-700 leading-relaxed select-none">
              I have read, understood, and agree to the terms of the{" "}
              <strong className="text-[#2C9993]">{title}</strong>. I understand this agreement is legally binding and required for registration.
            </span>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { if (agreed) onAgree(); }}
              disabled={!agreed}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                agreed
                  ? "bg-gradient-to-r from-[#1a5f6e] to-[#2C9993] text-white hover:from-[#155260] hover:to-[#238a84] shadow-md hover:shadow-lg active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {agreed ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  I Agree &amp; Continue
                </>
              ) : (
                "Check the box to continue"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes baaFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .baa-doc-content { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.85; }
        .baa-doc-content h1, .baa-doc-content h2, .baa-doc-content h3, .baa-doc-content h4 { color: #1a202c; font-family: system-ui, sans-serif; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 700; }
        .baa-doc-content h1 { font-size: 1.3rem; }
        .baa-doc-content h2 { font-size: 1.1rem; }
        .baa-doc-content h3 { font-size: 1rem; }
        .baa-doc-content p { margin-bottom: 0.9rem; }
        .baa-doc-content ul, .baa-doc-content ol { padding-left: 1.5rem; margin-bottom: 0.9rem; }
        .baa-doc-content li { margin-bottom: 0.35rem; }
        .baa-doc-content strong { color: #2d3748; }
        .baa-doc-content em { color: #4a5568; }
        .baa-doc-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
      `}</style>
    </div>
  );
};

export default BaaModal;
