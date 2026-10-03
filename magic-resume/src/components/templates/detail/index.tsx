import React, { useLayoutEffect, useMemo, useRef } from "react";
import { BriefcaseBusiness, Cake, Mail, MapPin, Phone, PenSquare, Wallet } from "lucide-react";
import type { BasicInfo, DetailFragment, ResumeData } from "@/types/resume";
import { getBorderRadiusValue } from "@/types/resume";
import type { ResumeTemplate } from "@/types/template";
import { getCustomFieldDisplayText } from "@/lib/customField";
import { A4_HEIGHT_PX, syncExplicitResumePages } from "@/utils/resumeLayout";
import LegacyDetailTemplate from "./LegacyDetailTemplate";
import { getDetailHtml, getDetailItem, getDetailPages, splitDetailHtml } from "./model";
import { getDetailPreset, type DetailPreset } from "./presets";
import { DETAIL_TEMPLATE_CSS } from "./styles";

interface DetailTemplateProps { data: ResumeData; template: ResumeTemplate }
const englishTitles: Record<string, string> = {
  selfEvaluation: "Personal Advantage", experience: "Work Experience", projects: "Project Experience",
  education: "Education Experience", skills: "Skills", "custom-awards": "Honors & Awards", "custom-certifications": "Certificates",
};

function SectionTitle({ data, sectionId, preset }: { data: ResumeData; sectionId: string; preset: DetailPreset }) {
  const rawTitle = data.menuSections.find((section) => section.id === sectionId)?.title ?? sectionId;
  const title = rawTitle.replace(/\s*(Personal Advantage|Work Experience|Project Experience|Education Experience|Strengths|Experience)\s*$/i, "");
  const english = data.templateId === "detail-insurance-transition"
    ? sectionId === "selfEvaluation" ? "Strengths" : sectionId === "experience" ? "Experience" : englishTitles[sectionId]
    : data.templateId === "detail-ai-product-master" && sectionId === "projects" ? "Project Experienc" : englishTitles[sectionId];
  return <h2 className={`detail-v2-section-title detail-v2-heading-${preset.heading}`}>
    {preset.heading === "icon-line" && <span className="detail-v2-section-icon">{sectionId === "selfEvaluation" ? <PenSquare size={17} /> : <BriefcaseBusiness size={17} />}</span>}
    <span>{title}</span>{preset.bilingual && english && <span className="detail-v2-english">{english}</span>}
  </h2>;
}

function DetailRichText({ html, templateId }: { html: string; templateId?: string | null }) {
  let bullet = false;
  const decorated = splitDetailHtml(html).map((block) => {
    if (/^<p[ >]/i.test(block)) {
      const isBullet = /^<p[^>]*>(?:<[^>]+>)*\s*[•·●]/i.test(block);
      if (isBullet) bullet = true;
      else if (/^<p[^>]*>\s*(?:<strong>|[\d一二三四五六七八九十]+[.、])/i.test(block)) bullet = false;
      if (bullet) return block.replace(/^<p/, `<p class="${isBullet ? "detail-v2-bullet" : "detail-v2-bullet-continuation"}"`);
    } else bullet = false;
    return block;
  }).join("").replace(/<h2>个人项目经历(?:\s+Personal Project Experience)?<\/h2>/g, templateId === "detail-insurance-transition"
    ? '<h2 class="detail-v2-inline-section-title"><span class="detail-v2-section-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 11v3h4v-3"/></svg></span>个人项目经历<span class="detail-v2-english">Personal Project Experience</span></h2>'
    : '$&');
  return html ? <div className="detail-v2-rich" dangerouslySetInnerHTML={{ __html: decorated }} /> : null;
}

function formatDetailDate(value: string, templateId?: string | null) {
  if (templateId === "detail-design-transition" || templateId === "detail-mechanical-transition") return value.replace(/\./g, "/");
  if (templateId === "detail-ai-product") return value.replace(/\s*[-–—]\s*/g, "-");
  return value;
}

function DetailEntryHeader({ data, fragment, inline = false }: { data: ResumeData; fragment: DetailFragment; inline?: boolean }) {
  const item = getDetailItem(data, fragment.sectionId, fragment.itemId);
  if (!item) return null;
  const primary = "company" in item ? item.company : "name" in item ? item.name : "school" in item ? item.school : item.title;
  const secondary = "position" in item ? item.position : "role" in item ? item.role : "major" in item ? [item.degree, item.major].filter(Boolean).join(" | ") : item.subtitle;
  const rawDate = "date" in item ? item.date : "startDate" in item ? [item.startDate, item.endDate].filter(Boolean).join(" - ") : item.dateRange;
  const date = formatDetailDate(rawDate, data.templateId);
  const sharedCompanyRow = data.templateId === "detail-civil-transition" && fragment.itemId === "detail-civil-transition-work-2";
  return <div className={`detail-v2-entry-header${inline ? " detail-v2-education-inline" : ""}`} data-entry-section={fragment.sectionId}>
    <span className="detail-v2-entry-primary">{sharedCompanyRow ? "" : primary}</span>
    {(secondary || sharedCompanyRow) && <span className="detail-v2-entry-secondary">{sharedCompanyRow ? [primary, secondary].filter(Boolean).join(" | ") : secondary}</span>}
    {date && <span className="detail-v2-entry-date">{date}</span>}
  </div>;
}

function DetailHeader({ data, preset, extras }: { data: ResumeData; preset: DetailPreset; extras: DetailFragment[] }) {
  const basic = data.basic;
  const visible = (key: keyof BasicInfo) => basic.fieldOrder?.find((field) => field.key === key)?.visible !== false;
  const photo = basic.photo && basic.photoConfig?.visible !== false;
  const fields = [
    { key: "email", label: "邮箱", value: basic.email, Icon: Mail },
    { key: "phone", label: "电话", value: basic.phone, Icon: Phone },
    { key: "location", label: "所在地", value: basic.location, Icon: MapPin },
    { key: "employementStatus", label: "状态", value: basic.employementStatus, Icon: BriefcaseBusiness },
    { key: "birthDate", label: "出生日期", value: basic.birthDate, Icon: Cake },
  ].filter((field) => field.value && visible(field.key as keyof BasicInfo));
  const extraFields = (basic.customFields ?? []).filter((field) => field.visible !== false && field.value);
  const education = extras.filter((fragment) => fragment.sectionId === "education");
  const skills = extras.filter((fragment) => fragment.sectionId !== "education");
  const isAi = data.templateId === "detail-ai-product";
  const leftPortrait = ["portrait-left", "operations"].includes(preset.header);
  const inlineFields = extraFields.filter((field) => /工作经验|工作年限/.test(field.label));
  const contactExtras = leftPortrait ? extraFields.filter((field) => !inlineFields.includes(field)) : extraFields;
  const targetParts = [visible("title") && basic.title ? `目标职位：${basic.title}` : "", visible("employementStatus") && basic.employementStatus, visible("location") && basic.location ? `求职地：${basic.location}` : ""].filter(Boolean);

  return <header className={`detail-v2-header detail-v2-header-${preset.header}`} data-resume-section-id="basic">
    {photo && <img className="detail-v2-photo" src={basic.photo} alt={`${basic.name}的简历照片`} style={{
      width: basic.photoConfig?.width ?? preset.photo.width,
      height: basic.photoConfig?.height ?? preset.photo.height,
      borderRadius: getBorderRadiusValue(basic.photoConfig),
    }} />}
    <div className="detail-v2-identity">
      {isAi && <p className="detail-v2-kicker">个人简历</p>}
      {["portrait-left", "operations"].includes(preset.header) && <div className="detail-v2-mark" aria-hidden="true"><i /><i /></div>}
      {visible("name") && basic.name && <h1 className="detail-v2-name">{basic.name}</h1>}
      {!isAi && !leftPortrait && visible("title") && basic.title && <div className="detail-v2-target">{preset.header === "insurance" ? "求职意向：" : ""}{basic.title}</div>}
    </div>
    <div className="detail-v2-header-details">
      {isAi && targetParts.length > 0 && <p className="detail-v2-target">{targetParts.join("  |  ")}</p>}
      <div className="detail-v2-contact">
        {fields.filter((field) => !isAi || !["location", "employementStatus"].includes(field.key)).map(({ key, label, value, Icon }) => <span key={key} className={`detail-v2-field detail-v2-field-${key}`}>
          <Icon className="detail-v2-field-icon" size={12} aria-hidden="true" /><span className="detail-v2-field-label">{label}：</span><span>{value}</span>
        </span>)}
        {contactExtras.map((field) => <span key={field.id} data-field-label={field.label} className="detail-v2-field detail-v2-field-custom">
          {/薪资/.test(field.label) && <Wallet className="detail-v2-field-icon" size={12} />}
          <span className="detail-v2-custom-label">{field.label ? `${field.label}：` : ""}</span><span>{getCustomFieldDisplayText(field)}</span>
        </span>)}
      </div>
      {(education.length > 0 || leftPortrait) && <div className="detail-v2-header-education">
{education.map((fragment, index) => <div key={index} data-resume-section-id="education" data-resume-item-id={fragment.itemId}>
        <DetailEntryHeader data={data} fragment={fragment} inline /><DetailRichText html={getDetailHtml(data, fragment)} />
      </div>)}
        {leftPortrait && inlineFields.map((field) => <span key={field.id}>{getCustomFieldDisplayText(field)}</span>)}
        {leftPortrait && visible("title") && basic.title && <span className="detail-v2-header-target">{basic.title}</span>}
      </div>}
      {skills.map((fragment, index) => <div key={index} className="detail-v2-header-skills" data-resume-section-id={fragment.sectionId}><DetailRichText html={getDetailHtml(data, fragment)} /></div>)}
    </div>
  </header>;
}

function Fragment({ data, fragment, preset }: { data: ResumeData; fragment: DetailFragment; preset: DetailPreset }) {
  const html = getDetailHtml(data, fragment);
  const item = getDetailItem(data, fragment.sectionId, fragment.itemId);
  if (!html && !item && fragment.sectionId !== "certificates") return null;
  return <section className="detail-v2-fragment" data-detail-fragment data-detail-source-y={fragment.startY} data-resume-section-id={fragment.sectionId} data-resume-item-id={fragment.itemId}>
    {fragment.showSectionTitle && <SectionTitle data={data} sectionId={fragment.sectionId} preset={preset} />}
    {fragment.showItemHeader !== false && item && <DetailEntryHeader data={data} fragment={fragment} />}
    <DetailRichText html={html} templateId={data.templateId} />
    {fragment.sectionId === "certificates" && <div className="detail-v2-certificates">{data.certificates.map((certificate) => <img key={certificate.id} src={certificate.url} style={{ width: `${certificate.width}%` }} alt="证书" />)}</div>}
  </section>;
}

const DetailTemplate: React.FC<DetailTemplateProps> = ({ data, template }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const preset = getDetailPreset(template.id);
  const plan = useMemo(() => getDetailPages(data), [data]);
  const pagePadding = data.globalSettings?.pagePadding ?? preset.pagePadding;
  const pageHeight = A4_HEIGHT_PX;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let active = true;
    const context = document.createElement("canvas").getContext("2d");
    const inkOffset = (fragment: HTMLElement) => {
      const first = fragment.matches(".detail-v2-page-number") ? fragment : Array.from(fragment.querySelectorAll<HTMLElement>("h2, .detail-v2-entry-header > span, .detail-v2-rich > *")).find((element) => element.textContent?.trim());
      if (!first) return 0;
      const style = getComputedStyle(first);
      const size = parseFloat(style.fontSize);
      const line = parseFloat(style.lineHeight) || size * 1.2;
      if (!context) return Math.max(0, (line - size) / 2) + size * 0.15;
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = context.measureText(first.textContent!.trim().slice(0, 40));
      const emHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      const offset = (line - emHeight) / 2 + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent;
      return Number.isFinite(offset) ? offset : Math.max(0, (line - size) / 2) + size * 0.15;
    };
    const sync = () => {
      if (!active) return;
      if (plan.sourceLayout) {
        root.querySelectorAll<HTMLElement>("[data-detail-page-body]").forEach((body) => {
          const bodyRect = body.getBoundingClientRect();
          const naturalWidth = parseFloat(getComputedStyle(body).width);
          const presentationScale = naturalWidth > 0 ? bodyRect.width / naturalWidth : 1;
          if (!Number.isFinite(presentationScale) || presentationScale <= 0) return;
          Array.from(body.querySelectorAll<HTMLElement>("[data-detail-source-y]")).forEach((fragment, index) => {
            const sourceY = Number(fragment.dataset.detailSourceY);
            if (!Number.isFinite(sourceY)) return;
            const oldMargin = parseFloat(fragment.style.marginTop) || 0;
            const intrinsicTop = (fragment.getBoundingClientRect().top - bodyRect.top) / presentationScale - oldMargin;
            // Original continuation pages may start above the nominal top inset.
            // Later fragments can only move down, so edits never overlap text.
            const minimum = index === 0 && fragment === body.firstElementChild ? -pagePadding : 0;
            const margin = Math.max(minimum, sourceY - inkOffset(fragment) - intrinsicTop);
            const value = `${Math.round(margin * 1000) / 1000}px`;
            if (Math.abs(margin - oldMargin) > 0.02) fragment.style.marginTop = value;
          });
        });
      }
      syncExplicitResumePages(root);
      root.querySelectorAll<HTMLElement>("[data-detail-footer-ink-top]").forEach((footer) => {
        footer.style.top = `${Number(footer.dataset.detailFooterInkTop) - inkOffset(footer)}px`;
      });
    };
    const observer = new ResizeObserver(sync);
    root.querySelectorAll<HTMLElement>("[data-detail-page-body]").forEach((body) => observer.observe(body));
    sync();
    void document.fonts?.ready.then(sync);
    return () => { active = false; observer.disconnect(); };
  }, [data, pageHeight, pagePadding, plan.sourceLayout]);

  if (!data.detailLayout && data.menuSections.some((section) => /^custom-detail-page-\d+$/.test(section.id))) {
    return <LegacyDetailTemplate data={data} template={template} />;
  }

  return <div ref={rootRef} className="detail-resume detail-v2" data-explicit-resume-pages data-detail-layout={template.id} data-detail-source-layout={plan.sourceLayout} data-detail-item-order={preset.itemOrder} style={{
    backgroundColor: "#fff", color: "#242424", fontSize: data.globalSettings?.baseFontSize ?? preset.fontSize,
    lineHeight: data.globalSettings?.lineHeight ?? preset.lineHeight, fontWeight: preset.weight ?? 400,
    "--detail-page-padding": `${pagePadding}px`,
    "--detail-accent": data.globalSettings?.themeColor || template.colorScheme.primary,
    "--detail-paragraph-gap": `${data.globalSettings?.paragraphSpacing ?? preset.paragraphGap}px`,
    "--detail-section-gap": `${data.globalSettings?.sectionSpacing ?? preset.sectionGap}px`,
    "--detail-name-size": `${preset.nameSize}px`, "--detail-title-size": `${preset.titleSize}px`,
    "--detail-heading-size": `${data.globalSettings?.headerSize ?? preset.headingSize}px`,
    "--detail-item-title-size": `${data.globalSettings?.subheaderSize ?? preset.itemTitleSize}px`,
  } as React.CSSProperties}>
    <style>{DETAIL_TEMPLATE_CSS}</style>
    {plan.pages.map((page, pageIndex) => {
      const fragments = [...page.fragments];
      const headerExtras: DetailFragment[] = [];
      const hasHeader = fragments[0]?.sectionId === "basic";
      if (hasHeader && plan.sourceLayout) {
        while (fragments[1] && ["education", "skills"].includes(fragments[1].sectionId) && fragments[1].showSectionTitle === false) headerExtras.push(fragments.splice(1, 1)[0]);
      }
      return <section key={page.number} data-detail-page={`detail-page-${page.number}`} data-detail-page-height={pageHeight} data-detail-full-page data-detail-source-page={page.number} style={{ minHeight: pageHeight }}>
        <div data-detail-page-body>
          {fragments.map((fragment, index) => fragment.sectionId === "basic"
            ? <DetailHeader key={`basic-${index}`} data={data} preset={preset} extras={headerExtras} />
            : <Fragment key={`${fragment.sectionId}-${fragment.itemId ?? "text"}-${index}`} data={data} fragment={fragment} preset={preset} />)}
        </div>
        {preset.pageNumber !== "none" && <span className={`detail-v2-page-number detail-v2-page-number-${preset.pageNumber}`} data-detail-footer-ink-top={(preset.pageNumber === "center" ? 791.808 : template.id === "detail-mechanical-transition" ? 815.608 : 811.0) * 4 / 3} style={{
          left: `${(preset.pageNumber === "center" ? 297.5 : template.id === "detail-mechanical-transition" ? 553.1 : 547.4) * 4 / 3}px`,
          fontSize: preset.pageNumber === "center" ? "13.333px" : "10.667px",
        }} aria-hidden="true">{pageIndex + 1}</span>}
      </section>;
    })}
  </div>;
};

export default DetailTemplate;
