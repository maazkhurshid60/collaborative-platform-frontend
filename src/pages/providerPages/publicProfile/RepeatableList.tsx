import { Plus, Trash2 } from "lucide-react";

interface FieldDef {
    key: string;
    label: string;
    type?: "text" | "checkbox" | "date" | "number";
}

interface RepeatableListProps {
    label: string;
    items: Record<string, unknown>[];
    fields: FieldDef[];
    emptyItem: Record<string, unknown>;
    onChange: (items: Record<string, unknown>[]) => void;
}

const RepeatableList = ({ label, items, fields, emptyItem, onChange }: RepeatableListProps) => {
    const updateItem = (index: number, key: string, value: unknown) => {
        const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
        onChange(next);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-[14px] font-medium text-[#333333] mb-2">{label}</label>
            <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="bg-inputBgColor rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 relative"
                    >
                        {fields.map((field) => (
                            <div key={field.key}>
                                <span className="block text-[12px] text-[#666666] mb-1">{field.label}</span>
                                {field.type === "checkbox" ? (
                                    <input
                                        type="checkbox"
                                        checked={!!item[field.key]}
                                        onChange={(e) => updateItem(index, field.key, e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                ) : (
                                    <input
                                        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                                        value={(item[field.key] as string | number | undefined) ?? ""}
                                        onChange={(e) => updateItem(index, field.key, e.target.value)}
                                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[14px] bg-white focus:outline-none focus:border-[#2C9993]"
                                    />
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => onChange([...items, { ...emptyItem }])}
                className="mt-3 flex items-center gap-1 text-[14px] text-[#2C9993] font-medium cursor-pointer"
            >
                <Plus size={16} /> Add {label.replace(/s$/, "")}
            </button>
        </div>
    );
};

export default RepeatableList;
