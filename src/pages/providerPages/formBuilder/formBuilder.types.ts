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
  | "signature"
  | "provider-section"
  | "client-section";
  label?: string;
  required?: boolean;
  options?: string[];
  level?: number;
  text?: string;
  items?: string[];
}
