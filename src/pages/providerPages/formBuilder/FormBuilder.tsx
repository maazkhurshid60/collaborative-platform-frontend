import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Settings } from "lucide-react";

import { baseUrl } from "../../../apiServices/baseUrl/BaseUrl";
import { FormField } from "./formBuilder.types";
import ElementsPalette from "./ElementsPalette";
import FieldEditor from "./FieldEditor";
import FormPreview from "./FormPreview";

export default function FormBuilder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [previewMode, setPreviewMode] = useState<"split" | "editor" | "preview">("split");

  const saveTemplateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${baseUrl}/form/create-template`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Form Template saved successfully!");
      navigate("/all-documents");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to save Form Template.";
      toast.error(msg);
    },
  });

  // ── Field helpers ─────────────────────────────────────────────────────────
  const addField = (type: FormField["type"]) => {
    const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newField: FormField = { id, type, required: false };

    if (type === "heading") { newField.text = "Section Title"; newField.level = 2; }
    else if (type === "paragraph") { newField.text = "Enter disclosure or instruction text here."; }
    else if (type === "list") { newField.items = ["First item description", "Second item description"]; }
    else if (type === "text") { newField.label = "Enter Text Label"; }
    else if (type === "date") { newField.label = "Select Date"; }
    else if (type === "boolean") { newField.label = "Consent check agreement"; }
    else if (type === "checkbox-group") { newField.label = "Select options"; newField.options = ["Option A", "Option B"]; }
    else if (type === "signature") { newField.label = "Legal E-Signature"; newField.required = true; }

    setFields((prev) => [...prev, newField]);
  };

  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));

  const updateField = (id: string, updates: Partial<FormField>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

  const moveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const reordered = [...fields];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setFields(reordered);
  };

  const addListItem = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.items) updateField(fieldId, { items: [...field.items, "New bullet point"] });
  };

  const removeListItem = (fieldId: string, index: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.items) updateField(fieldId, { items: field.items.filter((_, i) => i !== index) });
  };

  const addCheckboxOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.options) updateField(fieldId, { options: [...field.options, "New Option"] });
  };

  const removeCheckboxOption = (fieldId: string, index: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.options) updateField(fieldId, { options: field.options.filter((_, i) => i !== index) });
  };


  const handleSave = () => {
    if (!title) { toast.error("Please enter a Form Template Title."); return; }
    if (fields.length === 0) { toast.error("Please add at least one element to the template."); return; }
    saveTemplateMutation.mutate({ title, description, schema: { fields } });
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/all-documents")}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Visual Form Template Builder</h1>
            <p className="text-xs text-gray-400">HIPAA compliant template construction interface</p>
          </div>
        </div>

        {/* Tab mode selector */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          {(["editor", "split", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150 ${previewMode === mode ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {mode === "editor" ? "Editor Only" : mode === "split" ? "Split Screen" : "Live Preview"}
            </button>
          ))}
        </div>


        <button
          onClick={handleSave}
          disabled={saveTemplateMutation.isPending}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-primaryColorDark hover:bg-primaryColorDark/70 disabled:bg-primaryColorDark text-sm font-bold text-white rounded-xl shadow-md transition duration-150 space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saveTemplateMutation.isPending ? "Saving Template..." : "Save Template"}</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {(previewMode === "editor" || previewMode === "split") && (
          <div
            className={`${previewMode === "editor" ? "w-full" : "w-full md:w-1/2"
              } flex flex-col bg-white border-r border-gray-200 overflow-y-auto p-8 space-y-6`}
          >

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Settings className="w-4 h-4 mr-2 text-gray-500" />
                Template Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">FORM TEMPLATE TITLE</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Patient Intake & HIPAA Consent"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">DESCRIPTION (OPTIONAL)</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Please fill out before your first scheduled clinical therapy appointment."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>


            <ElementsPalette onAddField={addField} />


            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Form Schema Layout</h2>
              {fields.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl py-12 px-6 text-center">
                  <p className="text-gray-400 text-sm">No elements in your document layout yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Select from the "Add Elements" panel above to construct your document.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, idx) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      index={idx}
                      totalFields={fields.length}
                      onUpdate={updateField}
                      onRemove={removeField}
                      onMove={moveField}
                      onAddListItem={addListItem}
                      onRemoveListItem={removeListItem}
                      onAddCheckboxOption={addCheckboxOption}
                      onRemoveCheckboxOption={removeCheckboxOption}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {(previewMode === "preview" || previewMode === "split") && (
          <div
            className={`${previewMode === "preview" ? "w-full" : "flex-1"
              } bg-gray-100 overflow-y-auto p-8 flex justify-center`}
          >
            <FormPreview title={title} description={description} fields={fields} fullWidth={previewMode === "preview"} />
          </div>
        )}
      </div>
    </div>
  );
}
