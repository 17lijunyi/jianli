import type { ResumeTemplate } from "@/types/template";
import { getDetailPreset } from "./presets";

const sources = [
  ["detail-ai-product", "AI 产品经理", "以个人优势、工作经历和项目成果展开的 AI 产品经理简历", 3, "right"],
  ["detail-product-practice", "产品实践", "结合产品规划、AI 应用落地与业务成果的完整经历", 3, "left"],
  ["detail-design-transition", "设计转 AI 产品", "从设计经验到 AI 产品能力的转型经历与项目细节", 4, "left"],
  ["detail-ai-product-master", "硕士 · AI 产品经理", "硕士背景与三年 AI 产品经验，展示项目职责和业务结果", 3, "left"],
  ["detail-mechanical-transition", "机械工程转 AI 产品", "从机械工程转向 AI 产品的实践与能力迁移", 2, "left"],
  ["detail-graduate-fde", "应届硕士 · FDE", "面向 FDE 岗位的应届硕士经历、技术实践与项目成果", 3, "right"],
  ["detail-insurance-transition", "保险产品转 AI 产品", "从保险业务出发，展示行业理解与 AI 产品落地经验", 3, "right"],
  ["detail-civil-transition", "土木工程转 AI 产品", "将工程经验、业务分析与 AI 产品实践串联的转型简历", 3, "left"],
  ["detail-design-operations", "设计 / 运营转 AI 产品", "完整呈现设计、运营经验以及 AI 产品项目的进阶路径", 4, "left"],
] as const;

export const detailConfigs: ResumeTemplate[] = sources.map(
  ([id, name, description, pageCount, layout]) => ({
    id,
    name,
    description,
    thumbnail: id,
    layout: id,
    category: "detail",
    pageCount,
    colorScheme: {
      primary: id === "detail-graduate-fde" ? "#4d6273" : "#171717",
      secondary: "#737373",
      background: "#ffffff",
      text: "#171717",
    },
    spacing: { sectionGap: getDetailPreset(id).sectionGap, itemGap: getDetailPreset(id).paragraphGap, contentPadding: getDetailPreset(id).pagePadding },
    basic: { layout },
    availableSections: ["skills", "experience", "projects", "education", "selfEvaluation", "certificates"],
  }),
);
