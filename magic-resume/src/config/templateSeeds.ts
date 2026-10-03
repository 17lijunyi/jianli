import { initialResumeState, initialResumeStateEn } from "./initialResumeData";
import detailTemplateContent from "./detailTemplateContent.json";
import { getDetailPreset } from "@/components/templates/detail/presets";
import type { ResumeData } from "@/types/resume";

export type ResumeSeed = Omit<ResumeData, "id" | "createdAt" | "updatedAt">;

/** A fresh copy on every call: editing a resume must never mutate template examples. */
export function getTemplateSeed(
  templateId: string | null | undefined,
  locale = "zh"
): ResumeSeed {
  const initial = locale === "en" ? initialResumeStateEn : initialResumeState;
  const seed: ResumeSeed = { ...structuredClone(initial), templateId: templateId ?? undefined };
  const original = detailTemplateContent.find((entry) => entry.id === templateId);
  if (!original) return seed;

  const detail = structuredClone(original);
  const preset = getDetailPreset(detail.id);
  seed.title = detail.name;
  seed.templateId = detail.id;
  seed.basic = {
    ...seed.basic,
    ...detail.basic,
    name: "简小励",
    email: "jianxiaoli@example.com",
    phone: "13800000000",
    photo: "/avatar.png",
    photoConfig: {
      ...seed.basic.photoConfig,
      width: preset.photo.width,
      height: preset.photo.height,
      aspectRatio: "custom",
      borderRadius: preset.photo.round ? "full" : "none",
      visible: true,
    },
    githubKey: "",
    githubUseName: "",
    githubContributionsVisible: false,
    customFields: detail.basic.customFields,
  };
  seed.education = detail.education;
  seed.experience = detail.experience;
  seed.projects = detail.projects;
  seed.certificates = [];
  seed.skillContent = detail.skillContent;
  seed.selfEvaluationContent = detail.selfEvaluationContent;
  seed.customData = detail.customData as ResumeData["customData"];
  seed.menuSections = detail.menuSections;
  seed.detailLayout = { ...detail.detailLayout, version: 2 };
  seed.activeSection = "basic";
  seed.globalSettings = {
    ...seed.globalSettings,
    baseFontSize: preset.fontSize,
    lineHeight: preset.lineHeight,
    paragraphSpacing: preset.paragraphGap,
    sectionSpacing: preset.sectionGap,
    headerSize: preset.headingSize,
    subheaderSize: preset.itemTitleSize,
    pagePadding: preset.pagePadding,
    autoOnePage: false,
    useIconMode: false,
    themeColor: detail.id === "detail-graduate-fde" ? "#4d6273" : "#202020",
  };
  return seed;
}
