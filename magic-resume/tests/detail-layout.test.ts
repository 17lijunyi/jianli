import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TEMPLATES } from "../src/config";
import { createTemplatePreviewData } from "../src/lib/templatePreview";
import { getDetailHtml, getDetailPages, splitDetailHtml } from "../src/components/templates/detail/model";

const details = DEFAULT_TEMPLATES.filter((template) => template.category === "detail");
const make = (id = "detail-ai-product") => createTemplatePreviewData(details.find((template) => template.id === id)!, "zh");

test("all source fragments render every editable body block once across original pages", () => {
  for (const template of details) {
    const data = createTemplatePreviewData(template, "zh");
    const plan = getDetailPages(data);
    assert.equal(plan.sourceLayout, true, template.id);
    assert.equal(plan.pages.length, template.pageCount);
    const all = plan.pages.flatMap((page) => page.fragments);
    const bodies = [
      ["selfEvaluation", undefined, data.selfEvaluationContent],
      ["skills", undefined, data.skillContent],
      ...data.experience.map((item) => ["experience", item.id, item.details]),
      ...data.projects.map((item) => ["projects", item.id, item.description]),
      ...data.education.map((item) => ["education", item.id, item.description || ""]),
      ...Object.entries(data.customData).flatMap(([section, items]) => items.map((item) => [section, item.id, item.description])),
    ];
    for (const [sectionId, itemId, html] of bodies) {
      const rendered = all.filter((fragment) => fragment.sectionId === sectionId && fragment.itemId === itemId).map((fragment) => getDetailHtml(data, fragment)).join("");
      assert.equal(rendered, splitDetailHtml(html || "").join(""), `${template.id}: ${sectionId}/${itemId}`);
    }
  }
});

test("editing across page fragments keeps appended text and merged rich-text lists", () => {
  const data = make();
  const fragments = data.detailLayout!.pages.flatMap((page) => page.fragments);
  const id = data.projects.find((item) => fragments.filter((fragment) => fragment.itemId === item.id).length > 1)!.id;
  const item = data.projects.find((entry) => entry.id === id)!;
  item.description += "<p>追加的完整项目结果，不可截断。</p>";
  let rendered = getDetailPages(data).pages.flatMap((page) => page.fragments).filter((fragment) => fragment.itemId === id).map((fragment) => getDetailHtml(data, fragment)).join("");
  assert.match(rendered, /追加的完整项目结果/);
  item.description = "<ul><li>合并后的第一段</li><li><strong>合并后的第二段</strong></li></ul>";
  rendered = getDetailPages(data).pages.flatMap((page) => page.fragments).filter((fragment) => fragment.itemId === id).map((fragment) => getDetailHtml(data, fragment)).join("");
  assert.equal(rendered, item.description);
});

test("hidden and deleted entries disappear, section titles survive, and reordering follows editor order", () => {
  const data = make();
  const first = data.experience[0].id;
  data.experience[0].visible = false;
  let plan = getDetailPages(data);
  let work = plan.pages.flatMap((page) => page.fragments).filter((fragment) => fragment.sectionId === "experience");
  assert.ok(work.every((fragment) => fragment.itemId !== first));
  assert.equal(work[0].showSectionTitle, true);
  data.experience = data.experience.filter((item) => item.id !== first);
  plan = getDetailPages(data);
  assert.ok(plan.pages.flatMap((page) => page.fragments).every((fragment) => fragment.itemId !== first));
  const before = data.projects.map((item) => item.id);
  data.projects.reverse();
  plan = getDetailPages(data);
  assert.equal(plan.sourceLayout, false);
  assert.deepEqual(plan.pages.flatMap((page) => page.fragments).filter((fragment) => fragment.sectionId === "projects").map((fragment) => fragment.itemId), before.reverse());
});

test("new entries and sections retain their current menu position", () => {
  const data = make();
  data.projects.push({ ...data.projects[0], id: "new-entry", name: "新增项目", description: "<p>新增正文</p>" });
  let plan = getDetailPages(data);
  assert.ok(plan.pages.flatMap((page) => page.fragments).some((fragment) => fragment.itemId === "new-entry"));
  const custom = { id: "custom-new", title: "新模块", enabled: true, order: 1.5, icon: "" };
  data.menuSections.push(custom);
  data.customData[custom.id] = [{ id: "custom-entry", title: "作品", subtitle: "", dateRange: "", description: "<p>我的作品</p>", visible: true }];
  plan = getDetailPages(data);
  assert.equal(plan.sourceLayout, false);
  const sectionIds = Array.from(new Set(plan.pages[0].fragments.map((fragment) => fragment.sectionId)));
  const expected = [...data.menuSections].filter((section) => section.enabled).sort((a, b) => a.order - b.order).map((section) => section.id);
  assert.deepEqual(sectionIds, expected);
});
