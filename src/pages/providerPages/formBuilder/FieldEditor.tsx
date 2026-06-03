import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

import { FormField } from "./formBuilder.types";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
  ],
};

interface FieldEditorProps {
  field: FormField;
  index: number;
  totalFields: number;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onAddListItem: (fieldId: string) => void;
  onRemoveListItem: (fieldId: string, index: number) => void;
  onAddCheckboxOption: (fieldId: string) => void;
  onRemoveCheckboxOption: (fieldId: string, index: number) => void;
}

/** Renders one editable field card inside the editor panel. */
export default function FieldEditor({
  field,
  index,
  totalFields,
  onUpdate,
  onRemove,
  onMove,
  onAddListItem,
  onRemoveListItem,
  onAddCheckboxOption,
  onRemoveCheckboxOption,
}: FieldEditorProps) {
  const typeBadgeClass = ["heading", "paragraph", "list"].includes(field.type)
    ? "bg-indigo-50 text-indigo-700"
    : field.type === "signature"
      ? "bg-rose-50 text-rose-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-xs relative">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeBadgeClass}`}
          >
            {field.type}
          </span>
          <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            className="p-1 hover:bg-gray-100 text-gray-400 disabled:opacity-30 rounded transition"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(index, "down")}
            disabled={index === totalFields - 1}
            className="p-1 hover:bg-gray-100 text-gray-400 disabled:opacity-30 rounded transition"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(field.id)}
            className="p-1 hover:bg-red-50 text-red-500 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Heading config */}
      {field.type === "heading" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">
              HEADING TEXT
            </label>
            <input
              type="text"
              value={field.text || ""}
              onChange={(e) => onUpdate(field.id, { text: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">
              LEVEL
            </label>
            <select
              value={field.level || 2}
              onChange={(e) =>
                onUpdate(field.id, { level: parseInt(e.target.value) })
              }
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value={1}>H1 (Major)</option>
              <option value={2}>H2 (Medium)</option>
              <option value={3}>H3 (Sub)</option>
              <option value={4}>H4 (Minor)</option>
              <option value={5}>H5 (Small)</option>
              <option value={6}>H6 (Tiny)</option>
            </select>
          </div>
        </div>
      )}

      {/* Paragraph config */}
      {field.type === "paragraph" && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 mb-1">
            PARAGRAPH CONTENT
          </label>
          <ReactQuill
            theme="snow"
            value={field.text || ""}
            onChange={(val) => onUpdate(field.id, { text: val })}
            modules={quillModules}
            className="bg-white rounded-lg"
          />
        </div>
      )}

      {/* List / bullet config */}
      {field.type === "list" && (
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold text-gray-400 mb-1">
            LIST ITEMS (BULLETS)
          </label>
          <div className="space-y-1.5">
            {field.items?.map((item, bulletIdx) => (
              <div key={bulletIdx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const nextItems = [...(field.items || [])];
                    nextItems[bulletIdx] = e.target.value;
                    onUpdate(field.id, { items: nextItems });
                  }}
                  className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemoveListItem(field.id, bulletIdx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onAddListItem(field.id)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add Bullet Item
          </button>
        </div>
      )}

      {/* Interactive input fields (text, date, boolean, checkbox-group, signature) */}
      {!["heading", "paragraph", "list"].includes(field.type) && (
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                FIELD LABEL
              </label>
              <input
                type="text"
                value={field.label || ""}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) =>
                  onUpdate(field.id, { required: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
              <label className="text-xs font-semibold text-gray-500">
                Required
              </label>
            </div>
          </div>

          {/* Checkbox / Radio group options */}
          {(field.type === "checkbox-group" ||
            field.type === "radio-group") && (
            <div className="space-y-2 mt-2 border-t pt-2">
              <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                SELECT OPTIONS
              </label>
              <div className="space-y-1.5">
                {field.options?.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const nextOptions = [...(field.options || [])];
                        nextOptions[optIdx] = e.target.value;
                        onUpdate(field.id, { options: nextOptions });
                      }}
                      className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveCheckboxOption(field.id, optIdx)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onAddCheckboxOption(field.id)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
