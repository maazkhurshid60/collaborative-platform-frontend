import { ArrowLeft, FileText, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PreviewMode = "editor" | "split" | "preview";

interface FormBuilderHeaderProps {
  id: string;
  setPreviewMode: (mode: PreviewMode) => void;
  previewMode: PreviewMode;
  isPending: boolean;
  isUpdating: boolean;
  handleSave: () => void;
  handleViewPdf: () => void;
}

const FormBuilderHeader = ({
  id,
  setPreviewMode,
  previewMode,
  isPending,
  isUpdating,
  handleSave,
  handleViewPdf,
}: FormBuilderHeaderProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (
      window.confirm(
        "Are you sure you want to go back? your changes will be lost",
      )
    ) {
      navigate("/all-documents");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {id ? "Edit Form Template" : "Visual Form Template Builder"}
          </h1>
        </div>
      </div>

      {/* Tab mode selector */}
      <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
        {(["editor", "split", "preview"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150 ${
              previewMode === mode
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {mode === "editor"
              ? "Editor Only"
              : mode === "split"
                ? "Split Screen"
                : "Live Preview"}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          onClick={handleViewPdf}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150 text-gray-500 hover:text-gray-700 hover:bg-white"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View PDF</span>
        </button>
      </div>

      <div className="flex justify-center items-center gap-x-2">
        <button
          onClick={handleGoBack}
          disabled={isPending}
          className="inline-flex items-center justify-center px-3 py-2 bg-transparent border border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 text-sm font-bold text-gray-600 hover:text-gray-800 rounded-xl shadow-md transition duration-150 space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          onClick={handleSave}
          disabled={isPending || isUpdating}
          className="inline-flex items-center justify-center px-3 py-2 bg-primaryColorDark hover:bg-primaryColorDark/70 disabled:bg-primaryColorDark text-sm font-bold text-white rounded-xl shadow-md transition duration-150 space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>
            {isPending || isUpdating
              ? "Saving Template..."
              : id
                ? "Update Template"
                : "Save Template"}
          </span>
        </button>
      </div>
    </header>
  );
};

export default FormBuilderHeader;
