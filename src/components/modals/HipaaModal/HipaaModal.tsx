import React, { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";

interface HipaaModalProps {
  onClose: () => void;
}

const HipaaModal: React.FC<HipaaModalProps> = ({ onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60  px-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600 to-teal-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {/* Shield icon */}
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">HIPAA Compliance</h2>
              <p className="text-teal-100 text-xs font-medium">Health Insurance Portability and Accountability Act</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <RxCross2 size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto px-6 py-6 space-y-6 text-sm text-gray-700 leading-relaxed">

          {/* What is HIPAA */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-xs font-bold">1</span>
              What is HIPAA?
            </h3>
            <p className="text-gray-600 pl-8">
              The <strong className="text-gray-800">Health Insurance Portability and Accountability Act (HIPAA)</strong> is a United States federal law enacted in 1996. It establishes national standards to protect individuals' medical records and other personal health information (PHI) from being disclosed without the patient's knowledge or consent.
            </p>
          </section>

          {/* Why it matters */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-xs font-bold">2</span>
              Why It Matters on Kolabme
            </h3>
            <p className="text-gray-600 pl-8">
              Kolabme is a collaborative platform connecting healthcare providers with their clients. Because it may handle Protected Health Information (PHI), all users must comply with HIPAA regulations to ensure the privacy and security of patient data.
            </p>
          </section>

          {/* Your obligations */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-xs font-bold">3</span>
              Your Obligations
            </h3>
            <ul className="pl-8 space-y-2 text-gray-600">
              {[
                "Keep all patient information strictly confidential.",
                "Only access or share PHI for authorized treatment, payment, or healthcare operations.",
                "Use strong, unique passwords and never share your account credentials.",
                "Log out of the platform when not actively using it.",
                "Report any suspected unauthorized access or data breach immediately.",
                "Do not transmit PHI through unsecured channels (e.g., personal email or SMS).",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* How Kolabme protects data */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-xs font-bold">4</span>
              How Kolabme Protects Your Data
            </h3>
            <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "🔐", title: "End-to-End Encryption", desc: "All messages and documents are encrypted in transit and at rest." },
                { icon: "🛡️", title: "Access Controls", desc: "Role-based permissions ensure only authorized users can view sensitive data." },
                { icon: "📋", title: "Audit Logs", desc: "All data access is logged and regularly reviewed for anomalies." },
                { icon: "☁️", title: "Secure Storage", desc: "Files are stored on AWS S3 with strict bucket policies and server-side encryption." },
              ].map((item, i) => (
                <div key={i} className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">{item.icon} {item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Consent statement */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-medium flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
              By checking the HIPAA consent box, you acknowledge that you have read, understood, and agree to comply with all HIPAA regulations and Kolabme's privacy policies when using this platform.
            </p>
          </div>

          {/* Reference */}
          <p className="text-xs text-gray-400 text-center">
            For more information visit{" "}
            <a
              href="https://www.hhs.gov/hipaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 underline hover:text-teal-700"
            >
              hhs.gov/hipaa
            </a>
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-3 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-sm text-sm"
          >
            I Understand — Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HipaaModal;
