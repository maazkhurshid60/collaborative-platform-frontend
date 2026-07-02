import { TextField } from "../components/fields/TextField";
import { DateField } from "../components/fields/DateField";
import { CheckboxGroupField } from "../components/fields/CheckboxGroupField";
import { RadioGroupField } from "../components/fields/RadioGroupField";
import { BooleanField } from "../components/fields/BooleanField";
import { SignatureField } from "../components/fields/SignatureField";
import { HeadingBlock } from "../components/blocks/HeadingBlock";
import { ParagraphBlock } from "../components/blocks/ParagraphBlock";
import { ListBlock } from "../components/blocks/ListBlock";
import { ProviderSectionBlock } from "../components/blocks/ProviderSectionBlock";

export const fieldRenderers: Record<string, React.ComponentType<any>> = {
  text: TextField,
  date: DateField,
  "checkbox-group": CheckboxGroupField,
  "radio-group": RadioGroupField,
  boolean: BooleanField,
  signature: SignatureField,
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  list: ListBlock,
  "provider-section": ProviderSectionBlock,
};
export type FieldRenderersKey = keyof typeof fieldRenderers;
