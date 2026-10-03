import type { DetailFragment, DetailPageLayout, ResumeData } from "@/types/resume";
import { hasMeaningfulRichTextContent, normalizeRichTextContent } from "@/lib/richText";

/** Split complete top-level blocks, retaining nested lists and inline formatting. */
export function splitDetailHtml(html: string): string[] {
  const normalized = normalizeRichTextContent(html);
  const tags = /<!--[\s\S]*?-->|<\/?([a-z][a-z\d-]*)\b[^>]*>/gi;
  const blocks: string[] = [];
  let start = 0;
  let depth = 0;
  for (const token of Array.from(normalized.matchAll(tags))) {
    const text = token[0];
    if (text.startsWith("<!--")) continue;
    const voidTag = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(token[1]);
    if (!voidTag) depth += text.startsWith("</") ? -1 : text.endsWith("/>") ? 0 : 1;
    depth = Math.max(0, depth);
    if (depth === 0) {
      const end = (token.index ?? 0) + text.length;
      const block = normalized.slice(start, end).trim();
      if (block) blocks.push(block);
      start = end;
    }
  }
  const rest = normalized.slice(start).trim();
  if (rest) blocks.push(rest);
  return blocks;
}

export function getDetailItem(data: ResumeData, sectionId: string, itemId?: string) {
  if (!itemId) return undefined;
  const items = sectionId === "experience" ? data.experience
    : sectionId === "projects" ? data.projects
    : sectionId === "education" ? data.education
    : data.customData[sectionId] ?? [];
  return items.find((item) => item.id === itemId && item.visible !== false);
}

export function getDetailHtml(data: ResumeData, fragment: DetailFragment): string {
  const item = getDetailItem(data, fragment.sectionId, fragment.itemId);
  const html = fragment.sectionId === "skills" ? data.skillContent
    : fragment.sectionId === "selfEvaluation" ? data.selfEvaluationContent
    : item && "details" in item ? item.details
    : item && "description" in item ? item.description ?? ""
    : "";
  return splitDetailHtml(html).slice(fragment.fromBlock ?? 0, fragment.toBlock).join("");
}

function sectionItems(data: ResumeData, sectionId: string): string[] | null {
  const items = sectionId === "experience" ? data.experience
    : sectionId === "projects" ? data.projects
    : sectionId === "education" ? data.education
    : sectionId in data.customData ? data.customData[sectionId] : null;
  return items?.filter((item) => item.visible !== false).map((item) => item.id) ?? null;
}

function unique<T>(items: T[]): T[] { return Array.from(new Set(items)); }
function sameOrder(a: string[], b: string[]): boolean { return a.length === b.length && a.every((id, index) => id === b[index]); }

export function createDetailFlow(data: ResumeData): DetailFragment[] {
  return [...data.menuSections].filter((section) => section.enabled).sort((a, b) => a.order - b.order).flatMap<DetailFragment>((section) => {
    const ids = sectionItems(data, section.id);
    if (ids) return ids.map((itemId, index) => ({ sectionId: section.id, itemId, showSectionTitle: index === 0, showItemHeader: true }));
    if (section.id === "skills" && !hasMeaningfulRichTextContent(data.skillContent)) return [];
    if (section.id === "selfEvaluation" && !hasMeaningfulRichTextContent(data.selfEvaluationContent)) return [];
    if (section.id === "certificates" && !data.certificates.length) return [];
    return [{ sectionId: section.id, showSectionTitle: true, showItemHeader: true }];
  });
}

/** Resolve source page references against the current editable data, never copies. */
export function getDetailPages(data: ResumeData): { pages: DetailPageLayout[]; sourceLayout: boolean } {
  const flow = createDetailFlow(data);
  const fallback = () => ({ pages: [{ number: 1, fragments: flow }], sourceLayout: false });
  const layout = data.detailLayout;
  if (!layout || layout.version !== 2 || !layout.pages.length || layout.sourceTemplateId !== data.templateId) return fallback();

  const enabled = new Set(data.menuSections.filter((section) => section.enabled).map((section) => section.id));
  const pages = layout.pages.map((page) => ({ ...page, fragments: page.fragments.filter((fragment) => {
    if (!enabled.has(fragment.sectionId)) return false;
    return !fragment.itemId || Boolean(getDetailItem(data, fragment.sectionId, fragment.itemId));
  }).map((fragment) => ({ ...fragment })) }));
  const mapped = pages.flatMap((page) => page.fragments);
  const originalSections = unique([...(enabled.has("basic") ? ["basic"] : []), ...mapped.map((fragment) => fragment.sectionId)]);
  const currentSections = unique(flow.map((fragment) => fragment.sectionId));
  const existingSections = currentSections.filter((id) => originalSections.includes(id));
  // Respect section reordering; fixed source page references must not undo it.
  if (!sameOrder(originalSections.filter((id) => currentSections.includes(id)), existingSections)) return fallback();
  // A newly inserted module belongs at its actual menu position, not at the end.
  if (currentSections.some((id) => !originalSections.includes(id))) return fallback();

  for (const sectionId of currentSections) {
    const originalIds = unique(mapped.filter((fragment) => fragment.sectionId === sectionId && fragment.itemId).map((fragment) => fragment.itemId!));
    const ids = sectionItems(data, sectionId);
    if (!ids) continue;
    if (!sameOrder(ids.filter((id) => originalIds.includes(id)), originalIds)) return fallback();
    const unmapped = ids.filter((id) => !originalIds.includes(id));
    if (!unmapped.length) continue;
    // Insertions before/between source items are intentionally reflowed in order.
    if (ids.slice(0, originalIds.length).some((id, index) => id !== originalIds[index])) return fallback();
    const lastPage = [...pages].reverse().find((page) => page.fragments.some((fragment) => fragment.sectionId === sectionId));
    if (!lastPage) return fallback();
    const lastIndex = lastPage.fragments.reduce((last, fragment, index) => fragment.sectionId === sectionId ? index : last, -1);
    lastPage.fragments.splice(lastIndex + 1, 0, ...unmapped.map((itemId) => ({ sectionId, itemId, showSectionTitle: false, showItemHeader: true })));
  }

  // Keep a section label when the original first entry was hidden or deleted.
  const titledSections = new Set(layout.pages.flatMap((page) => page.fragments).filter((fragment) => fragment.showSectionTitle).map((fragment) => fragment.sectionId));
  for (const sectionId of Array.from(titledSections)) {
    const survivors = pages.flatMap((page) => page.fragments).filter((fragment) => fragment.sectionId === sectionId);
    if (survivors.length && !survivors.some((fragment) => fragment.showSectionTitle)) survivors[0].showSectionTitle = true;
  }
  if (enabled.has("basic")) pages[0].fragments.unshift({ sectionId: "basic", showSectionTitle: false });
  return { pages: pages.filter((page) => page.fragments.length), sourceLayout: true };
}
