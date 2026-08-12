import React, { useEffect, useRef, useState } from "react";
import { PiInfoFill } from "react-icons/pi";
import { toast } from "react-toastify";
import { Edit, Eye, FileText, RefreshCw } from "lucide-react";

import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import { getFormatedDateAndTime } from "@/utils/dataTimeUtils";
import Loader from "@/components/loader/Loader";
import Button from "@/components/button/Button";

interface BaaDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const ITEMS = [
  { label: "H1", open: "<h1>", close: "</h1>", title: "Heading 1" },
  { label: "H2", open: "<h2>", close: "</h2>", title: "Heading 2" },
  { label: "H3", open: "<h3>", close: "</h3>", title: "Heading 3" },
  { label: "P", open: "<p>", close: "</p>", title: "Paragraph" },
  { label: "Bold", open: "<strong>", close: "</strong>", title: "Bold" },
  { label: "Italic", open: "<em>", close: "</em>", title: "Italic" },
  {
    label: "UL",
    open: "<ul>\n  <li>",
    close: "</li>\n</ul>",
    title: "Unorder list",
  },
  { label: "LI", open: "<li>", close: "</li>", title: "list Item" },
  { label: "HR", open: "<hr />", close: "", title: "Horizantal Line" },
];

const DEFAULT_BAA_CONTENT = `<h1>Business Associate Agreement (BAA)</h1>

<p>This Business Associate Agreement ("Agreement") is entered into between <strong>KolabMe, Inc.</strong> ("Covered Entity") and the healthcare provider ("Business Associate") registering on the KolabMe platform.</p>

<hr />

<h2>1. Definitions</h2>
<p>Terms used but not otherwise defined in this Agreement shall have the same meaning as those terms in the HIPAA Rules. Key definitions include:</p>
<ul>
  <li><strong>Protected Health Information (PHI)</strong>: Individually identifiable health information transmitted or maintained in any form.</li>
  <li><strong>HIPAA Rules</strong>: The Health Insurance Portability and Accountability Act of 1996 and all implementing regulations.</li>
  <li><strong>Business Associate</strong>: A person or entity that performs certain functions or activities that involve the use or disclosure of PHI on behalf of a covered entity.</li>
</ul>

<h2>2. Obligations of Business Associate</h2>
<p>Business Associate agrees to:</p>
<ul>
  <li>Not use or disclose PHI other than as permitted or required by this Agreement or as required by law.</li>
  <li>Use appropriate safeguards to prevent use or disclosure of PHI other than as provided for by this Agreement.</li>
  <li>Comply with the HIPAA Security Rule with respect to electronic PHI.</li>
  <li>Report to Covered Entity any use or disclosure of PHI not provided for by this Agreement.</li>
  <li>Report any Security Incident of which Business Associate becomes aware.</li>
  <li>Ensure that any subcontractors that create, receive, maintain, or transmit PHI agree to the same restrictions.</li>
</ul>

<h2>3. Permitted Uses and Disclosures</h2>
<p>Business Associate may use and disclose PHI only as necessary to perform its services under the platform, or as required by law. Business Associate may use PHI for management, administration, or legal responsibilities of the Business Associate, provided the disclosure is required by law, or Business Associate obtains reasonable assurances from the recipient.</p>

<h2>4. Term and Termination</h2>
<p>This Agreement shall be effective upon the Business Associate's registration on the KolabMe platform and shall remain in effect until terminated. Either party may terminate this Agreement upon written notice if the other party has materially breached the Agreement. Upon termination, Business Associate shall return or destroy all PHI.</p>

<h2>5. Miscellaneous</h2>
<p>This Agreement shall be governed by the laws of the United States. Any amendments to this Agreement must be in writing and signed by authorized representatives of both parties. If any provision of this Agreement is found to be unenforceable, the remainder shall remain in full force and effect.</p>

<hr />

<p><em>By registering on the KolabMe platform and accepting this Agreement, the Business Associate acknowledges that they have read, understood, and agree to be bound by the terms of this Business Associate Agreement.</em></p>`;

const BaaManagement: React.FC = () => {
  const [baaDoc, setBaaDoc] = useState<BaaDoc | null>(null);
  const [title, setTitle] = useState("Business Associate Agreement");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch existing BAA on mount
  useEffect(() => {
    const fetchBaa = async () => {
      try {
        const res = await superAdminApi.getBaa();
        if (res?.data) {
          setBaaDoc(res.data);
          setTitle(res.data.title);
          setContent(res.data.content);
        } else {
          // Pre-fill with default template
          setContent(DEFAULT_BAA_CONTENT);
        }
      } catch (err) {
        console.error("Failed to fetch BAA:", err);
        setContent(DEFAULT_BAA_CONTENT);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBaa();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("BAA content cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const res = await superAdminApi.saveBaa({ title, content });
      const updatedDoc = res?.data;
      if (updatedDoc) {
        setBaaDoc(updatedDoc);
        setTitle(updatedDoc.title);
        setContent(updatedDoc.content);
        toast.success(
          baaDoc
            ? "BAA document updated successfully"
            : "BAA document created successfully",
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save BAA document",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const insertHtmlTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent =
      content.substring(0, start) +
      openTag +
      selected +
      closeTag +
      content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selected.length,
      );
    }, 0);
  };

  if (isLoading) return <Loader text="Loading BAA document..." />;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primaryColorDark flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Business Associate Agreement (BAA)
            </h1>
            <p className="text-sm text-gray-500">
              Manage the BAA document shown to providers during registration
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {baaDoc ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primaryColorDark/10 border border-primaryColorDark text-primaryColorDark text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primaryColorDark animate-pulse" />
              Active — providers must accept on registration
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              No BAA document saved yet
            </span>
          )}
          {baaDoc && (
            <span className="text-xs text-gray-400">
              Last updated: {getFormatedDateAndTime(baaDoc.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <PiInfoFill className="w-5 h-5 text-blue-500 shrink-0" />
        <div className="text-sm text-blue-700 leading-relaxed">
          <strong>Read-only for providers:</strong> This document is shown to
          providers in a modal during signup. They must check a box agreeing to
          its terms before their registration can proceed. Use HTML tags to
          format the content (e.g.,{" "}
          <code className="bg-blue-100 px-1 rounded">&lt;h2&gt;</code>,{" "}
          <code className="bg-blue-100 px-1 rounded">&lt;p&gt;</code>,{" "}
          <code className="bg-blue-100 px-1 rounded">&lt;ul&gt;</code>).
        </div>
      </div>

      {/* Title field */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Document Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2C9993]/40 focus:border-[#2C9993] transition-all"
          placeholder="Business Associate Agreement"
        />
      </div>

      {/* Edit / Preview Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-5 py-3 text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "edit"
                ? "text-[#2C9993] border-b-2 border-[#2C9993] bg-teal-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Edit className="w-4 h-4" />
            Edit HTML
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-5 py-3 text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "preview"
                ? "text-[#2C9993] border-b-2 border-[#2C9993] bg-teal-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview (as providers see it)
          </button>
        </div>

        {activeTab === "edit" ? (
          <div>
            {/* Formatting toolbar */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex-wrap">
              <span className="text-xs text-gray-400 mr-2 font-medium">
                Insert:
              </span>
              {ITEMS.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  title={btn.title}
                  onClick={() => insertHtmlTag(btn.open, btn.close)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-[#2C9993] hover:text-white hover:border-[#2C9993] transition-all"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              placeholder="Enter BAA document content in HTML format..."
              className="w-full px-5 py-4 text-sm font-mono text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-0 bg-white"
              style={{ minHeight: "520px" }}
            />
          </div>
        ) : (
          <div className="p-6 min-h-130 overflow-y-auto">
            {/* Render preview exactly like the modal */}
            <div
              className="baa-preview-content text-gray-700 text-sm leading-relaxed max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{
                __html:
                  content ||
                  "<p class='text-gray-400 italic'>Nothing to preview yet. Add content in the Edit tab.</p>",
              }}
            />
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          Changes take effect immediately for all new provider registrations.
        </p>
        <div>
          <Button
            className="px-2"
            text={isSaving ? "Saving..." : "Update Document"}
            onclick={handleSave}
            disabled={isSaving || !content.trim()}
            isLoading={isSaving}
            icon={<RefreshCw className="w-4 h-4" />}
          />
        </div>
      </div>

      <style>{`
        .baa-preview-content { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.85; }
        .baa-preview-content h1, .baa-preview-content h2, .baa-preview-content h3, .baa-preview-content h4 { color: #1a202c; font-family: system-ui, sans-serif; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 700; }
        .baa-preview-content h1 { font-size: 1.3rem; }
        .baa-preview-content h2 { font-size: 1.1rem; }
        .baa-preview-content h3 { font-size: 1rem; }
        .baa-preview-content p { margin-bottom: 0.9rem; }
        .baa-preview-content ul, .baa-preview-content ol { padding-left: 1.5rem; margin-bottom: 0.9rem; }
        .baa-preview-content li { margin-bottom: 0.35rem; }
        .baa-preview-content strong { color: #2d3748; }
        .baa-preview-content em { color: #4a5568; }
        .baa-preview-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
      `}</style>
    </div>
  );
};

export default BaaManagement;
