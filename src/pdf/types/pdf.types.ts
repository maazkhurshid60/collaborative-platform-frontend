export type FieldType =
  | "heading"
  | "paragraph"
  | "list"
  | "text"
  | "date"
  | "checkbox-group"
  | "radio-group"
  | "boolean"
  | "signature";

export interface FormField {
  id: string;
  type: FieldType;
  label?: string;
  required?: boolean;
  options?: string[];
  level?: number;
  text?: string;
  items?: string[];
}

export interface FormSchema {
  title: string;
  description?: string;
  schema:
    | string
    | {
        fields: FormField[];
      };
  clientId?: string;
  clientName?: string;
}

export interface SubmissionData {
  [fieldId: string]: any;
}

export interface FieldRendererProps {
  field: FormField;
  value?: any;
  signature?: string | null;
  isSubmitted: boolean;
}

export interface PDFFormViewField {
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
  validation?: any;
  level?: number;
  text?: string;
  items?: string[];
}

export interface PDFFormViewSchema {
  title: string;
  description?: string;
  schema: {
    fields: FormField[];
  };
  clientId?: string;
  clientName?: string;
}
