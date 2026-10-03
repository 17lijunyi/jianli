import legacyTemplates from "@/config/detailTemplates.json";
import { initialResumeState } from "@/config/initialResumeData";
import { getTemplateSeed, type ResumeSeed } from "@/config/templateSeeds";
import type { ResumeData } from "@/types/resume";

const equal = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

type BodyTarget = { sectionId: string; itemId?: string; blockIndex: number };

/** Split without normalizing: a user's inline formatting and link attributes survive. */
function rawBlocks(html: string): string[] | null {
  const blocks: string[] = [];
  const stack: string[] = [];
  const tags = /<!--[\s\S]*?-->|<\/?([a-z][a-z\d-]*)\b[^>]*>/gi;
  let start = 0;
  for (const token of Array.from(html.matchAll(tags))) {
    const tag = token[0];
    if (tag.startsWith("<!--")) return null;
    const name = token[1].toLowerCase();
    const index = token.index ?? 0;
    if (!stack.length && html.slice(start, index).trim()) return null;
    const closing = tag.startsWith("</");
    const voidTag = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(name);
    if (closing) {
      if (stack.pop() !== name) return null;
    } else if (!voidTag && !tag.endsWith("/>")) stack.push(name);
    if (!stack.length) {
      const end = index + tag.length;
      blocks.push(html.slice(start, end).trim());
      start = end;
    }
  }
  return stack.length || html.slice(start).trim() ? null : blocks;
}

// Source emphasis may have been restored in v2; full text must still match exactly.
const blockText = (block: string) => block.replace(/<[^>]*>/g, "").replace(/\s+/g, "");
const bodyKey = (target: BodyTarget) => `${target.sectionId}:${target.itemId ?? ""}`;
function bodyAccessor(seed: ResumeSeed, target: Pick<BodyTarget, "sectionId" | "itemId">) {
  if (target.sectionId === "selfEvaluation") return {
    get: () => seed.selfEvaluationContent ?? "", set: (html: string) => { seed.selfEvaluationContent = html; },
  };
  if (target.sectionId === "skills") return {
    get: () => seed.skillContent ?? "", set: (html: string) => { seed.skillContent = html; },
  };
  const items = target.sectionId === "experience" ? seed.experience
    : target.sectionId === "projects" ? seed.projects
    : target.sectionId === "education" ? seed.education : seed.customData[target.sectionId];
  const item = items?.find((entry) => entry.id === target.itemId);
  if (!item) return null;
  return "details" in item
    ? { get: () => item.details, set: (html: string) => { item.details = html; } }
    : { get: () => item.description ?? "", set: (html: string) => { item.description = html; } };
}

/** Only a unique, ordered source-block correspondence is safe to migrate. */
function mapPageBodies(seed: ResumeSeed, pageNumber: number, sourceBlocks: string[]) {
  const fragments = seed.detailLayout?.pages.find((page) => page.number === pageNumber)?.fragments;
  if (!fragments) return null;
  const targets: { target: BodyTarget; text: string }[] = [];
  for (const fragment of fragments) {
    const accessor = bodyAccessor(seed, fragment);
    if (!accessor) continue;
    const blocks = rawBlocks(accessor.get());
    if (!blocks) return null;
    const end = Math.min(fragment.toBlock ?? blocks.length, blocks.length);
    for (let index = fragment.fromBlock ?? 0; index < end; index++) {
      targets.push({ target: { sectionId: fragment.sectionId, itemId: fragment.itemId, blockIndex: index }, text: blockText(blocks[index]) });
    }
  }
  const sourceText = sourceBlocks.map(blockText);
  const first: number[] = [];
  let cursor = 0;
  for (const entry of targets) {
    while (cursor < sourceText.length && sourceText[cursor] !== entry.text) cursor++;
    if (cursor === sourceText.length) return null;
    first.push(cursor++);
  }
  cursor = sourceText.length - 1;
  for (let index = targets.length - 1; index >= 0; index--) {
    while (cursor >= 0 && sourceText[cursor] !== targets[index].text) cursor--;
    if (cursor !== first[index]) return null; // More than one matching subsequence.
    cursor--;
  }
  return new Map(first.map((sourceIndex, index) => [sourceIndex, targets[index].target]));
}

function preserveEditedBodies(resume: ResumeData, seed: ResumeSeed, source: typeof legacyTemplates[number]): boolean {
  const edits = new Map<string, { target: BodyTarget; blocks: string[] }>();
  for (const page of source.pages) {
    const actual = resume.customData[`custom-detail-page-${page.page}`][0].description;
    if (actual === page.html) continue;
    const originalBlocks = rawBlocks(page.html);
    const actualBlocks = rawBlocks(actual);
    if (!originalBlocks || !actualBlocks || originalBlocks.length !== actualBlocks.length) return false;
    const mapping = mapPageBodies(seed, page.page, originalBlocks);
    if (!mapping) return false;
    for (let index = 0; index < originalBlocks.length; index++) {
      if (originalBlocks[index] === actualBlocks[index]) continue;
      const target = mapping.get(index);
      if (!target) return false; // A changed name, date, heading, or other extracted field.
      const key = bodyKey(target);
      if (!edits.has(key)) {
        const accessor = bodyAccessor(seed, target);
        const blocks = accessor && rawBlocks(accessor.get());
        if (!blocks) return false;
        edits.set(key, { target, blocks });
      }
      edits.get(key)!.blocks[target.blockIndex] = actualBlocks[index];
    }
  }
  for (const { target, blocks } of Array.from(edits.values())) bodyAccessor(seed, target)!.set(blocks.join("\n"));
  return true;
}

/** Upgrade unchanged samples or unambiguously edited paragraphs to native sections.
 * Structural changes keep the complete v1 record and its lossless legacy renderer.
 */
export function upgradeDetailResume(resume: ResumeData): ResumeData {
  if (resume.detailLayout || !resume.templateId?.startsWith("detail-")) return resume;
  const source = legacyTemplates.find((entry) => entry.id === resume.templateId);
  if (!source || resume.experience.length || resume.projects.length || resume.education.length || resume.skillContent || resume.selfEvaluationContent) return resume;
  const originalPageIds = source.pages.map((page) => `custom-detail-page-${page.page}`);
  const currentPageIds = Object.keys(resume.customData).filter((id) => /^custom-detail-page-\d+$/.test(id));
  if (!equal(currentPageIds, originalPageIds)) return resume;
  const orderedPages = resume.menuSections.filter((section) => originalPageIds.includes(section.id)).sort((a, b) => a.order - b.order);
  if (!equal(orderedPages.map((section) => section.id), originalPageIds) || orderedPages.some((section, index) => section.title.replace(/\s+/g, "") !== `第${source.pages[index].page}页`)) return resume;
  if (!source.pages.every((page) => {
    const id = `custom-detail-page-${page.page}`;
    const items = resume.customData[id];
    const section = resume.menuSections.find((entry) => entry.id === id);
    return section?.enabled !== false && items?.length === 1 && items[0].visible !== false &&
      !items[0].title && !items[0].subtitle && !items[0].dateRange;
  })) return resume;

  const seed = getTemplateSeed(resume.templateId);
  if (!seed.detailLayout || !preserveEditedBodies(resume, seed, source)) return resume;
  const legacyBasic = {
    ...initialResumeState.basic,
    title: resume.templateId === "detail-graduate-fde" ? "AI 产品经理 / FDE" : "AI 产品经理",
    location: "", birthDate: "", employementStatus: "",
    photoConfig: { ...initialResumeState.basic.photoConfig, width: 72, height: 96, aspectRatio: "3:4", visible: true },
    customFields: [{ id: "wechat", label: "微信", value: "jianxiaoli", icon: "MessageCircle", visible: true }],
    layout: ["detail-ai-product", "detail-graduate-fde", "detail-insurance-transition"].includes(resume.templateId) ? "right" : "left",
  };
  const legacySettings = {
    ...initialResumeState.globalSettings,
    baseFontSize: ["detail-ai-product", "detail-product-practice"].includes(resume.templateId) ? 12 : 11,
    lineHeight: resume.templateId === "detail-mechanical-transition" ? 1.35 : 1.4,
    paragraphSpacing: resume.templateId === "detail-mechanical-transition" ? 2 : 3,
    sectionSpacing: 8, headerSize: 14, subheaderSize: 12, pagePadding: 36,
    autoOnePage: false, useIconMode: false,
    themeColor: resume.templateId === "detail-graduate-fde" ? "#22394e" : "#171717",
  };
  const preserveChanges = <T extends object>(next: T, previous: object, defaults: object): T => {
    const result = { ...next };
    for (const [key, value] of Object.entries(previous)) {
      if (!equal(value, (defaults as Record<string, unknown>)[key])) {
        (result as Record<string, unknown>)[key] = structuredClone(value);
      }
    }
    return result;
  };
  const nextBasic = preserveChanges(seed.basic, resume.basic, legacyBasic);
  if (!equal(resume.basic.customFields, legacyBasic.customFields)) {
    // v1 source demographics lived inside page text. Preserve their new native
    // fields when the user also edited or added an unrelated contact field.
    nextBasic.customFields = structuredClone(seed.basic.customFields);
    for (const field of resume.basic.customFields) {
      const index = nextBasic.customFields.findIndex((current) => current.id === field.id || Boolean(field.label && current.label === field.label));
      if (index < 0) nextBasic.customFields.push(structuredClone(field));
      else nextBasic.customFields[index] = structuredClone(field);
    }
  }
  const extraSections = resume.menuSections.filter((section) => section.id !== "basic" && !originalPageIds.includes(section.id));
  const extraData = Object.fromEntries(Object.entries(resume.customData).filter(([id]) => !originalPageIds.includes(id)));
  const seedSectionIds = new Set(seed.menuSections.map((section) => section.id));
  if (extraSections.some((section) => seedSectionIds.has(section.id)) || Object.keys(extraData).some((id) => id in seed.customData)) return resume;
  const previousBasicSection = resume.menuSections.find((section) => section.id === "basic");
  return {
    ...resume,
    ...seed,
    id: resume.id, title: resume.title, createdAt: resume.createdAt, updatedAt: resume.updatedAt,
    basic: nextBasic,
    globalSettings: preserveChanges(seed.globalSettings, resume.globalSettings, legacySettings),
    certificates: resume.certificates,
    customData: { ...seed.customData, ...extraData },
    menuSections: [...seed.menuSections.map((section) => section.id === "basic" ? { ...section, ...previousBasicSection, order: section.order } : section), ...extraSections.map((section, index) => ({ ...section, order: seed.menuSections.length + index }))],
    activeSection: originalPageIds.includes(resume.activeSection) ? (seed.menuSections.find((section) => section.id !== "basic")?.id ?? "basic") : resume.activeSection,
  };
}
