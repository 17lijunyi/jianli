import assert from "node:assert/strict";
import test from "node:test";
import legacyTemplates from "../src/config/detailTemplates.json";
import { initialResumeState } from "../src/config/initialResumeData";
import { upgradeDetailResume } from "../src/lib/upgradeDetailResume";
import type { ResumeData } from "../src/types/resume";

const legacyResume = (source = legacyTemplates[0]): ResumeData => ({
  ...structuredClone(initialResumeState),
  id: "legacy-resume", templateId: source.id, title: "我已保存的简历", createdAt: "2026-10-03", updatedAt: "2026-10-03",
  basic: { ...structuredClone(initialResumeState.basic), title: "AI 产品经理", location: "", birthDate: "", employementStatus: "", layout: "right", photoConfig: { ...initialResumeState.basic.photoConfig, width: 72, height: 96, aspectRatio: "3:4", visible: true }, customFields: [{id: "wechat", label: "微信", value: "jianxiaoli", icon: "MessageCircle", visible: true}] },
  experience: [], projects: [], education: [], certificates: [], skillContent: "", selfEvaluationContent: "",
  activeSection: "custom-detail-page-1",
  menuSections: [{id: "basic", title: "基本信息", icon: "👤", enabled: true, order: 0}, ...source.pages.map((page) => ({id: `custom-detail-page-${page.page}`, title: `第 ${page.page} 页`, icon: "📄", enabled: true, order: page.page}))],
  customData: Object.fromEntries(source.pages.map((page) => [`custom-detail-page-${page.page}`, [{id: `${source.id}-page-${page.page}`, title: "", subtitle: "", dateRange: "", description: page.html, visible: true}]])),
  globalSettings: { ...initialResumeState.globalSettings, baseFontSize: 12, lineHeight: 1.4, paragraphSpacing: 3, sectionSpacing: 8, headerSize: 14, subheaderSize: 12, pagePadding: 36, autoOnePage: false, useIconMode: false, themeColor: "#171717" },
});

test("untouched legacy templates upgrade to normal editable sections without losing identity or chosen color", () => {
  for (const source of legacyTemplates) {
    const legacy = legacyResume(source);
    legacy.basic.name = "用户自己的姓名";
    legacy.basic.phone = "用户自己的联系方式";
    legacy.globalSettings.themeColor = "#2E8B57";
    const snapshot = structuredClone(legacy);
    const upgraded = upgradeDetailResume(legacy);
    assert.equal(upgraded.detailLayout?.version, 2);
    assert.equal(upgraded.detailLayout?.pages.length, source.pageCount);
    assert.ok(upgraded.experience.length + upgraded.projects.length > 0);
    assert.ok(upgraded.menuSections.every((section) => !section.id.startsWith("custom-detail-page-")));
    assert.equal(upgraded.basic.name, legacy.basic.name);
    assert.equal(upgraded.basic.phone, legacy.basic.phone);
    assert.equal(upgraded.globalSettings.themeColor, "#2E8B57");
    assert.equal(upgraded.id, legacy.id);
    assert.equal(upgraded.title, legacy.title);
    assert.deepEqual(legacy, snapshot);
    assert.equal(upgradeDetailResume(upgraded), upgraded);
  }
});

test("inserted paragraphs, hidden or removed legacy pages are never overwritten by sample data", () => {
  const edited = legacyResume();
  edited.customData["custom-detail-page-1"][0].description += "<p>用户增加的重要经历</p>";
  assert.equal(upgradeDetailResume(edited), edited);
  const hidden = legacyResume();
  hidden.menuSections[1].enabled = false;
  assert.equal(upgradeDetailResume(hidden), hidden);
  const removed = legacyResume();
  delete removed.customData["custom-detail-page-2"];
  assert.equal(upgradeDetailResume(removed), removed);
});

test("legacy upgrade keeps user-added custom modules", () => {
  const legacy = legacyResume();
  legacy.menuSections.push({id: "custom-user", title: "我的作品", icon: "📎", enabled: true, order: 10});
  legacy.customData["custom-user"] = [{id: "one", title: "个人作品", subtitle: "", dateRange: "", description: "<p>我添加的内容</p>", visible: true}];
  const upgraded = upgradeDetailResume(legacy);
  assert.deepEqual(upgraded.customData["custom-user"], legacy.customData["custom-user"]);
  assert.ok(upgraded.menuSections.some((section) => section.id === "custom-user"));
});

const topBlocks = (html: string) => html.match(/<(?:p|h[1-6]|ul|ol)\b[^>]*>[\s\S]*?<\/(?:p|h[1-6]|ul|ol)>/g) ?? [];
const plainBlock = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, "");

test("editing a source paragraph in every template upgrades to its native field and retains formatting", async () => {
  const { getTemplateSeed } = await import("../src/config/templateSeeds");
  for (const source of legacyTemplates) {
    const legacy = legacyResume(source);
    legacy.basic.name = "我实际填写的姓名";
    legacy.globalSettings.themeColor = "#126789";
    const seed = getTemplateSeed(source.id);
    const nativeParagraph = topBlocks(seed.selfEvaluationContent)[0];
    const page = legacy.customData["custom-detail-page-1"][0];
    const sourceParagraph = topBlocks(page.description).find((block) => plainBlock(block) === plainBlock(nativeParagraph))!;
    assert.ok(sourceParagraph, source.id);
    const revisedParagraph = '<p style="text-align: left"><strong>用户的产品成果</strong>：完成 3 个项目；<a href="https://example.com/my-work">查看作品</a></p>';
    page.description = page.description.replace(sourceParagraph, revisedParagraph);
    const before = structuredClone(legacy);
    const upgraded = upgradeDetailResume(legacy);
    assert.equal(upgraded.detailLayout?.version, 2, source.id);
    assert.equal(upgraded.selfEvaluationContent, seed.selfEvaluationContent.replace(nativeParagraph, revisedParagraph), source.id);
    assert.deepEqual(upgraded.projects, seed.projects);
    assert.equal(upgraded.basic.name, "我实际填写的姓名");
    assert.equal(upgraded.globalSettings.themeColor, "#126789");
    assert.deepEqual(legacy, before, "migration must not modify the saved v1 object");
  }
});

test("changes on both sides of an original page break stay in one editable project", () => {
  const legacy = legacyResume();
  const first = legacy.customData["custom-detail-page-1"][0];
  const second = legacy.customData["custom-detail-page-2"][0];
  const firstParagraph = topBlocks(first.description)[29];
  const secondParagraph = topBlocks(second.description)[1];
  first.description = first.description.replace(firstParagraph, "<p>我在第一页修改的项目背景</p>");
  second.description = second.description.replace(secondParagraph, "<p><em>我在下一页修改的项目职责</em></p>");
  const upgraded = upgradeDetailResume(legacy);
  assert.equal(upgraded.detailLayout?.version, 2);
  assert.ok(upgraded.projects[0].description.includes("<p>我在第一页修改的项目背景</p>"));
  assert.ok(upgraded.projects[0].description.includes("<p><em>我在下一页修改的项目职责</em></p>"));
  assert.ok(upgraded.projects[0].description.indexOf("项目背景") < upgraded.projects[0].description.indexOf("项目职责"));
});

test("extracted header edits, structural changes and malformed HTML keep the complete original record", () => {
  for (const mutate of [
    (resume: ResumeData) => { const item = resume.customData["custom-detail-page-1"][0]; item.description = item.description.replace("麦麦趣耕科技有限公司", "用户的新公司"); },
    (resume: ResumeData) => { const item = resume.customData["custom-detail-page-1"][0]; item.description = item.description.replace("个人优势Personal Advantage", "我修改过的栏目标题"); },
    (resume: ResumeData) => { const item = resume.customData["custom-detail-page-1"][0]; item.description = item.description.replace(topBlocks(item.description)[3], ""); },
    (resume: ResumeData) => { const item = resume.customData["custom-detail-page-1"][0]; item.description = item.description.replace("<p><strong>", "<p><em>"); },
    (resume: ResumeData) => { resume.customData["custom-detail-page-1"][0].visible = false; },
    (resume: ResumeData) => { resume.menuSections[1].order = 20; },
    (resume: ResumeData) => { resume.menuSections[1].title = "我的获奖经历"; },
  ]) {
    const legacy = legacyResume();
    mutate(legacy);
    const snapshot = structuredClone(legacy);
    assert.equal(upgradeDetailResume(legacy), legacy);
    assert.deepEqual(legacy, snapshot);
  }
});

test("edited legacy contact fields do not discard demographics extracted from source pages", async () => {
  const { getTemplateSeed } = await import("../src/config/templateSeeds");
  const source = legacyTemplates.find((entry) => entry.id === "detail-product-practice")!;
  const legacy = legacyResume(source);
  legacy.basic.customFields[0].value = "my-wechat";
  legacy.basic.customFields.push({id: "my-portfolio", label: "作品集", value: "https://example.com/my-portfolio", visible: true});
  const snapshot = structuredClone(legacy);
  const upgraded = upgradeDetailResume(legacy);
  assert.equal(upgraded.detailLayout?.version, 2);
  for (const field of getTemplateSeed(source.id).basic.customFields) {
    assert.ok(upgraded.basic.customFields.some((entry) => entry.label === field.label && entry.value === field.value));
  }
  assert.ok(upgraded.basic.customFields.some((entry) => entry.value === "my-wechat"));
  assert.ok(upgraded.basic.customFields.some((entry) => entry.value === "https://example.com/my-portfolio"));
  assert.deepEqual(legacy, snapshot);
});

test("custom section ID collisions retain both the complete source and user content in v1", () => {
  const source = legacyTemplates.find((entry) => entry.id === "detail-civil-transition")!;
  const legacy = legacyResume(source);
  legacy.menuSections.push({id: "custom-certifications", title: "用户单独记录的证书", icon: "🏅", enabled: true, order: 8});
  legacy.customData["custom-certifications"] = [{id: "my-certificate", title: "用户证书", subtitle: "", dateRange: "", description: "<p>不可覆盖的用户证书内容</p>", visible: true}];
  const snapshot = structuredClone(legacy);
  assert.equal(upgradeDetailResume(legacy), legacy);
  assert.deepEqual(legacy, snapshot);
});

test("the user's basic section label and icon survive native migration", () => {
  const legacy = legacyResume();
  legacy.menuSections[0].title = "个人资料";
  legacy.menuSections[0].icon = "🧑";
  const upgraded = upgradeDetailResume(legacy);
  assert.equal(upgraded.detailLayout?.version, 2);
  assert.equal(upgraded.menuSections[0].title, "个人资料");
  assert.equal(upgraded.menuSections[0].icon, "🧑");
});
