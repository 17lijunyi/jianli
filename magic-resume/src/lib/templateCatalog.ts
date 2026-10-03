import type { ResumeTemplate } from "@/types/template";

export const TEMPLATE_CATEGORIES = [
  { id: "standard", label: "简历模版" },
  { id: "detail", label: "简历细节模版" },
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["id"];

export const getTemplateCategory = (template: ResumeTemplate): TemplateCategory =>
  template.category === "detail" || template.id.startsWith("detail-") ? "detail" : "standard";

export const getTemplateTranslationKey = (templateId: string) =>
  templateId === "left-right" ? "leftRight" : templateId;

export const getTemplateLabel = (
  template: ResumeTemplate,
  translate: (key: string) => string,
  field: "name" | "description" = "name"
) => getTemplateCategory(template) === "detail"
  ? template[field]
  : translate(`${getTemplateTranslationKey(template.id)}.${field}`);
