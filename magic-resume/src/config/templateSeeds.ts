import { initialResumeState, initialResumeStateEn } from "./initialResumeData";
import detailTemplates from "./detailTemplates.json";
import type { ResumeData } from "@/types/resume";

export type ResumeSeed = Omit<ResumeData, "id" | "createdAt" | "updatedAt">;

/** A fresh copy on every call: editing a resume must never mutate template examples. */
export function getTemplateSeed(
  templateId: string | null | undefined,
  locale = "zh"
): ResumeSeed {
  const initial = locale === "en" ? initialResumeStateEn : initialResumeState;
  const seed: ResumeSeed = { ...structuredClone(initial), templateId: templateId ?? undefined };
  const detail = detailTemplates.find((entry) => entry.id === templateId);
  if (!detail) return seed;

  seed.title = detail.name;
  seed.templateId = detail.id;
  seed.basic = {
    ...seed.basic,
    name: "简小励",
    title: detail.id === "detail-graduate-fde" ? "AI 产品经理 / FDE" : "AI 产品经理",
    email: "jianxiaoli@example.com",
    phone: "13800000000",
    location: "",
    birthDate: "",
    employementStatus: "",
    photo: "/avatar.png",
    photoConfig: { ...seed.basic.photoConfig, width: 72, height: 96, aspectRatio: "3:4", visible: true },
    githubKey: "",
    githubUseName: "",
    githubContributionsVisible: false,
    customFields: [{ id: "wechat", label: "微信", value: "jianxiaoli", icon: "MessageCircle", visible: true }],
  };
  seed.education = [];
  seed.experience = [];
  seed.projects = [];
  seed.certificates = [];
  seed.skillContent = "";
  seed.selfEvaluationContent = "";
  seed.customData = {};
  seed.menuSections = [{ id: "basic", title: "基本信息", icon: "👤", enabled: true, order: 0 }];
  for (const page of detail.pages) {
    const sectionId = `custom-detail-page-${page.page}`;
    seed.menuSections.push({ id: sectionId, title: `第 ${page.page} 页`, icon: "📄", enabled: true, order: page.page });
    seed.customData[sectionId] = [{
      id: `${detail.id}-page-${page.page}`,
      title: "",
      subtitle: "",
      dateRange: "",
      description: page.html,
      visible: true,
    }];
  }
  seed.activeSection = "basic";
  seed.globalSettings = {
    ...seed.globalSettings,
    baseFontSize: ["detail-ai-product", "detail-product-practice"].includes(detail.id) ? 12 : 11,
    lineHeight: detail.id === "detail-mechanical-transition" ? 1.35 : 1.4,
    paragraphSpacing: detail.id === "detail-mechanical-transition" ? 2 : 3,
    sectionSpacing: 8,
    headerSize: 14,
    subheaderSize: 12,
    pagePadding: 36,
    autoOnePage: false,
    useIconMode: false,
    themeColor: "#202020",
  };
  return seed;
}
