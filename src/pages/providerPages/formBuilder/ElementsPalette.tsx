import {
  Heading1,
  AlignLeft,
  List,
  Type,
  Calendar,
  CheckSquare,
  Check,
  CircleDot,
  PenTool,
} from "lucide-react";
import { FormField } from "./formBuilder.types";

interface ElementsPaletteProps {
  onAddField: (type: FormField["type"]) => void;
}

/** Grid of buttons to quickly add a new field element to the form schema. */
export default function ElementsPalette({ onAddField }: ElementsPaletteProps) {
  const elements: { type: FormField["type"]; label: string; icon: React.ReactNode; color: string }[] = [
    { type: "heading",        label: "Section Title", icon: <Heading1  className="w-4 h-4 text-indigo-600"  />, color: "hover:bg-indigo-50 hover:border-indigo-200" },
    { type: "paragraph",      label: "Text Block",    icon: <AlignLeft className="w-4 h-4 text-indigo-600"  />, color: "hover:bg-indigo-50 hover:border-indigo-200" },
    { type: "list",           label: "Bullet List",   icon: <List      className="w-4 h-4 text-indigo-600"  />, color: "hover:bg-indigo-50 hover:border-indigo-200" },
    { type: "text",           label: "Text Input",    icon: <Type      className="w-4 h-4 text-emerald-600" />, color: "hover:bg-emerald-50 hover:border-emerald-200" },
    { type: "date",           label: "Date Input",    icon: <Calendar  className="w-4 h-4 text-emerald-600" />, color: "hover:bg-emerald-50 hover:border-emerald-200" },
    { type: "boolean",        label: "Checkbox",      icon: <CheckSquare className="w-4 h-4 text-emerald-600" />, color: "hover:bg-emerald-50 hover:border-emerald-200" },
    { type: "checkbox-group", label: "Check List",    icon: <Check     className="w-4 h-4 text-emerald-600" />, color: "hover:bg-emerald-50 hover:border-emerald-200" },
    { type: "radio-group",    label: "Single Select", icon: <CircleDot className="w-4 h-4 text-emerald-600" />, color: "hover:bg-emerald-50 hover:border-emerald-200" },
    { type: "signature",      label: "E-Signature",   icon: <PenTool   className="w-4 h-4 text-rose-600"    />, color: "hover:bg-rose-50 hover:border-rose-200" },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
        Add Elements
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {elements.map(({ type, label, icon, color }) => (
          <button
            key={type}
            onClick={() => onAddField(type)}
            className={`flex items-center space-x-2 px-3 py-2.5 border border-gray-200 rounded-xl text-left transition duration-150 text-xs font-bold text-gray-700 ${color}`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
