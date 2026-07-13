import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Settings } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "axios";

import { baseUrl } from "../../../apiServices/baseUrl/BaseUrl";
import { FormField } from "./formBuilder.types";
import ElementsPalette from "./ElementsPalette";
import FieldEditor from "./FieldEditor";
import FormBuilderHeader from "./FormBuilderHeader";
import Loader from "@/components/loader/Loader";
import FormPreview from "./FormPreview";
import { generateFormPdfUrl } from "@/pdf/utils/pdfHelpers";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
  ],
};

function FormBuilder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [previewMode, setPreviewMode] = useState<
    "split" | "editor" | "preview"
  >("split");
  const [isDataSynced, setIsDataSynced] = useState(false);
  const lastAddedFieldIdRef = useRef<string | null>(null);

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
      const msg =
        err.response?.data?.message || "Failed to save Form Template.";
      toast.error(msg);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${baseUrl}/form/templates/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Form Template updated successfully!");
      navigate("/all-documents");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Failed to update Form Template.";
      toast.error(msg);
    },
  });

  const { data: templateData, isLoading } = useQuery({
    queryKey: ["formTemplate", id],
    queryFn: async () => {
      if (!id) return null;
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/form/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data.template;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (templateData) {
      setTitle(templateData.title || "");
      setDescription(templateData.description || "");
      if (templateData.schema?.fields) {
        setFields(templateData.schema.fields);
      }
      setIsDataSynced(true);
    } else if (!id) {
      setIsDataSynced(true);
    }
  }, [templateData, id]);

  const fieldLabelMap: Partial<Record<FormField["type"], string>> = {
    heading: "Section Title",
    "provider-section": "Provider Only Section",
    "client-section": "Client Only Section",
    paragraph: "Text Block",
    list: "Bullet List",
    text: "Text Input",
    date: "Date Input",
    boolean: "Checkbox",
    "checkbox-group": "Check List",
    "radio-group": "Single Select",
    signature: "E-Signature",
  };

  const addField = useCallback((type: FormField["type"]) => {
    const newId = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newField: FormField = { id: newId, type, required: false };

    if (type === "heading") {
      newField.text = "Section Title";
      newField.level = 2;
    } else if (type === "provider-section") {
      newField.text = "Provider Only Section";
      newField.level = 2;
    } else if (type === "client-section") {
      newField.text = "Client Only Section";
      newField.level = 2;
    } else if (type === "paragraph") {
      newField.text = "Enter disclosure or instruction text here.";
    } else if (type === "list") {
      newField.items = ["First item description", "Second item description"];
    } else if (type === "text") {
      newField.label = "Enter Text Label";
    } else if (type === "date") {
      newField.label = "Select Date";
    } else if (type === "boolean") {
      newField.label = "Consent check agreement";
    } else if (type === "checkbox-group") {
      newField.label = "Select options";
      newField.options = ["Option A", "Option B"];
    } else if (type === "radio-group") {
      newField.label = "Select an option";
      newField.options = ["Option 1", "Option 2"];
    } else if (type === "signature") {
      newField.label = "Legal E-Signature";
      newField.required = true;
    }

    lastAddedFieldIdRef.current = newId;
    setFields((prev) => [...prev, newField]);

    const label = fieldLabelMap[type] ?? type;
    toast.success(`"${label}" added to form`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
  }, []);

  // Auto-scroll to the newly added field after render
  useEffect(() => {
    const newId = lastAddedFieldIdRef.current;
    if (!newId) return;
    lastAddedFieldIdRef.current = null;
    // Small timeout to allow DOM to paint the new field
    const timer = setTimeout(() => {
      const el = document.getElementById(`field-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [fields]);

  const removeField = (id: string) =>
    setFields((prev) => prev.filter((f) => f.id !== id));

  const updateField = (id: string, updates: Partial<FormField>) =>
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );

  const moveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const reordered = [...fields];
    [reordered[index], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[index],
    ];
    setFields(reordered);
  };

  const addListItem = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.items)
      updateField(fieldId, { items: [...field.items, "New bullet point"] });
  };

  const removeListItem = (fieldId: string, index: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.items)
      updateField(fieldId, {
        items: field.items.filter((_, i) => i !== index),
      });
  };

  const addCheckboxOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.options)
      updateField(fieldId, { options: [...field.options, "New Option"] });
  };

  const removeCheckboxOption = (fieldId: string, index: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.options)
      updateField(fieldId, {
        options: field.options.filter((_, i) => i !== index),
      });
  };

  const handleSave = () => {
    if (!title) {
      toast.error("Please enter a Form Template Title.");
      return;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one element to the template.");
      return;
    }

    if (id) {
      updateTemplateMutation.mutate({ title, description, schema: { fields } });
    } else {
      saveTemplateMutation.mutate({ title, description, schema: { fields } });
    }
  };

  const handleViewPdf = async () => {
    try {
      const url = await generateFormPdfUrl({
        title: title || "Untitled Form Template",
        description: description || "",
        schema: { fields },
      });
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to generate PDF preview.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Admin Header */}
      <FormBuilderHeader
        id={id!}
        setPreviewMode={setPreviewMode}
        previewMode={previewMode}
        isPending={saveTemplateMutation.isPending}
        handleSave={handleSave}
        handleViewPdf={handleViewPdf}
        isUpdating={updateTemplateMutation.isPending}
      />

      {(isLoading && id) || !isDataSynced ? (
        <Loader />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {(previewMode === "editor" || previewMode === "split") && (
            <div
              className={`${
                previewMode === "editor" ? "w-full" : "w-full md:w-1/2"
              } flex flex-col bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-6`}
            >
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                  Form Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Form Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Patient Intake & HIPAA Consent"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Description (Optional)
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={description || ""}
                      onChange={setDescription}
                      modules={quillModules}
                      placeholder="e.g. Please fill out before your first scheduled clinical therapy appointment."
                      className="bg-white rounded-xl "
                    />
                  </div>
                </div>
              </div>

              <ElementsPalette onAddField={addField} />

              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Form Layout
                </h2>
                {fields.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-2xl py-12 px-6 text-center">
                    <p className="text-gray-400 text-sm">
                      No elements in your document layout yet.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Select from the "Add Elements" panel above to construct
                      your document.
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
              className={`${
                previewMode === "preview" ? "w-full" : "flex-1"
              } bg-gray-100 overflow-y-auto px-6 py-4 flex justify-center`}
            >
              <FormPreview
                title={title}
                description={description}
                fields={fields}
                fullWidth={previewMode === "preview"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormBuilder;
