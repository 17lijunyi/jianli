import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TEMPLATES } from "../src/config";
import { getTemplateSeed } from "../src/config/templateSeeds";
import { createTemplatePreviewData } from "../src/lib/templatePreview";
import { TEMPLATE_CATEGORIES, getTemplateCategory, getTemplateLabel } from "../src/lib/templateCatalog";
import { useResumeStore } from "../src/store/useResumeStore";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
  removeItem: (key: string) => memory.delete(key),
} });

const resetStore = () => useResumeStore.setState({ resumes: {}, activeResumeId: null, activeResume: null, history: {}, future: {} });

test("catalog contains two separate nine-template collections and uses detail labels directly", () => {
  assert.deepEqual(TEMPLATE_CATEGORIES.map((category) => category.label), ["简历模版", "简历细节模版"]);
  for (const category of TEMPLATE_CATEGORIES) {
    assert.equal(DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).length, 9);
  }
  const detail = DEFAULT_TEMPLATES.find((template) => getTemplateCategory(template) === "detail")!;
  assert.equal(getTemplateLabel(detail, () => { throw new Error("detail templates must not use unavailable translation keys"); }), detail.name);
});

test("every template creates the complete content shown in its preview with uniform example identity", () => {
  resetStore();
  for (const template of DEFAULT_TEMPLATES) {
    const id = useResumeStore.getState().createResume(template.id);
    const created = useResumeStore.getState().resumes[id];
    const preview = createTemplatePreviewData(template, "zh");
    assert.equal(created.basic.name, "简小励");
    assert.equal(created.basic.email, "jianxiaoli@example.com");
    assert.equal(created.basic.phone, "13800000000");
    assert.equal(created.basic.photo, "/avatar.png");
    assert.ok(created.basic.customFields.some((field) => field.value === "jianxiaoli"));
    for (const field of ["basic", "globalSettings", "customData", "experience", "projects", "education", "skillContent", "menuSections"] as const) {
      assert.deepEqual(created[field], preview[field], `${template.id}: ${field}`);
    }
    if (getTemplateCategory(template) === "detail") {
      const pages = Object.keys(created.customData).filter((key) => key.startsWith("custom-detail-page-"));
      assert.equal(pages.length, template.pageCount);
      assert.ok(pages.every((key) => created.customData[key][0].description.replace(/<[^>]*>/g, "").trim().length > 0));
      assert.equal(created.globalSettings.autoOnePage, false);
    }
  }
});

test("creating and previewing templates never mutates saved resumes or shared seeds", () => {
  resetStore();
  const savedId = useResumeStore.getState().createResume("classic");
  useResumeStore.getState().updateResume(savedId, { basic: { ...useResumeStore.getState().resumes[savedId].basic, name: "我保存的简历", phone: "原有联系方式" } });
  const saved = structuredClone(useResumeStore.getState().resumes[savedId]);
  const detail = DEFAULT_TEMPLATES.find((template) => getTemplateCategory(template) === "detail")!;
  const first = createTemplatePreviewData(detail, "zh");
  first.basic.name = "改变预览副本";
  const firstPage = Object.keys(first.customData)[0];
  first.customData[firstPage][0].description = "改变预览正文";
  const second = createTemplatePreviewData(detail, "zh");
  assert.equal(second.basic.name, "简小励");
  assert.notEqual(second.customData[firstPage][0].description, "改变预览正文");
  useResumeStore.getState().createResume(detail.id);
  assert.deepEqual(useResumeStore.getState().resumes[savedId], saved);
  assert.equal(getTemplateSeed("classic", "en").basic.name, "简小励");
});

test("blank creation remains blank and switching layout preserves entered content", () => {
  resetStore();
  const blankId = useResumeStore.getState().createResume(null, true);
  const blank = useResumeStore.getState().resumes[blankId];
  assert.equal(blank.basic.name, "");
  assert.equal(blank.basic.phone, "");
  assert.equal(blank.basic.photo, "");
  assert.deepEqual(blank.customData, {});
  const detail = DEFAULT_TEMPLATES.find((template) => getTemplateCategory(template) === "detail")!;
  const id = useResumeStore.getState().createResume(detail.id);
  const pages = structuredClone(useResumeStore.getState().resumes[id].customData);
  useResumeStore.getState().setTemplate("classic");
  assert.deepEqual(useResumeStore.getState().resumes[id].customData, pages);
});

test("switching every detailed example to each original layout renders every full page body", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: ResumeTemplateComponent } = await import("../src/components/templates");
  const { NextIntlClientProvider } = await import("../src/i18n/compat/client");
  const { default: messages } = await import("../src/i18n/locales/zh.json");
  const originals = DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === "standard");
  for (const detail of DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === "detail")) {
    const data = createTemplatePreviewData(detail, "zh");
    for (const template of originals) {
      const changed = { ...data, templateId: template.id, basic: { ...data.basic, layout: template.basic.layout } };
      const markup = renderToStaticMarkup(createElement(NextIntlClientProvider, {
        locale: "zh", messages,
        children: createElement(ResumeTemplateComponent, { data: changed, template }),
      }));
      for (const [sectionId, items] of Object.entries(data.customData)) {
        assert.ok(markup.includes(`data-resume-section-id="${sectionId}"`), `${detail.id} → ${template.id}: missing ${sectionId}`);
        for (const item of items) {
          assert.ok(markup.includes(item.description), `${detail.id} → ${template.id}: truncated ${sectionId}`);
        }
      }
    }
  }
});

test("English example previews and blank creation keep their original locale behavior", () => {
  const cookieDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { cookie: "NEXT_LOCALE=en" } });
  try {
    resetStore();
    const id = useResumeStore.getState().createResume("classic");
    const created = useResumeStore.getState().resumes[id];
    const template = DEFAULT_TEMPLATES.find((entry) => entry.id === "classic")!;
    const preview = createTemplatePreviewData(template, "en");
    assert.equal(created.basic.name, "简小励");
    assert.equal(created.basic.title, "Senior Frontend Engineer");
    assert.deepEqual(created.experience, preview.experience);
    assert.match(created.title, /^New Resume /);
    const blankId = useResumeStore.getState().createResume(null, true);
    const blank = useResumeStore.getState().resumes[blankId];
    assert.equal(blank.basic.name, "");
    assert.equal(blank.menuSections[0].title, "Profile");
  } finally {
    if (cookieDescriptor) Object.defineProperty(globalThis, "document", cookieDescriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
