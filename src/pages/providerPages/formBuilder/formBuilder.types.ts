export interface FormField {
  id: string;
  type:
  | "heading"
  | "paragraph"
  | "list"
  | "text"
  | "date"
  | "checkbox-group"
  | "radio-group"
  | "boolean"
  | "signature";
  label?: string;
  required?: boolean;
  options?: string[];
  level?: number;
  text?: string;
  items?: string[];
}
