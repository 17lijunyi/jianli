import React, { useLayoutEffect, useRef } from "react";
import type { BasicInfo, CustomItem, ResumeData } from "@/types/resume";
import { getBorderRadiusValue } from "@/types/resume";
import type { ResumeTemplate } from "@/types/template";
import { getCustomFieldDisplayText, shouldShowCustomFieldLabelPrefix } from "@/lib/customField";
import { normalizeRichTextContent } from "@/lib/richText";
import { A4_HEIGHT_PX, syncExplicitResumePages } from "@/utils/resumeLayout";
import ClassicTemplate from "../classic";
import { DETAIL_TEMPLATE_CSS } from "./styles";

interface DetailTemplateProps { data: ResumeData; template: ResumeTemplate }

const DetailHeader = ({ basic, template }: { basic: BasicInfo; template: ResumeTemplate }) => {
  const visible = (key: keyof BasicInfo) => basic.fieldOrder?.find((field) => field.key === key)?.visible !== false;
  const contact = (basic.fieldOrder ?? [
    { key: "phone", label: "电话", visible: true },
    { key: "email", label: "邮箱", visible: true },
    { key: "location", label: "所在地", visible: true },
  ]).filter((field) => field.visible !== false && !["name", "title"].includes(field.key))
    .map((field) => ({ id: field.key, label: field.label, value: basic[field.key as keyof BasicInfo] }))
    .filter((field) => typeof field.value === "string" && field.value);
  const customFields = (basic.customFields ?? []).filter((field) => field.visible !== false);
  const layout = basic.layout ?? template.basic.layout;

  return (
    <header className={`detail-header detail-header-${layout}`} data-resume-section-id="basic">
      {basic.photo && basic.photoConfig?.visible !== false && <img
        className="detail-photo"
        src={basic.photo}
        alt={`${basic.name}的简历照片`}
        style={{ width: basic.photoConfig?.width ?? 72, height: basic.photoConfig?.height ?? 96, borderRadius: getBorderRadiusValue(basic.photoConfig) }}
      />}
      <div className="detail-header-info">
        {visible("name") && basic.name && <h1 className="detail-name">{basic.name}</h1>}
        {visible("title") && basic.title && <p className="detail-job">{basic.title}</p>}
        <div className="detail-contact">
          {contact.map((field) => <span key={field.id}>{field.label}：{field.value as string}</span>)}
          {customFields.map((field) => <span key={field.id}>
            {shouldShowCustomFieldLabelPrefix(field) ? `${field.label}：` : ""}{getCustomFieldDisplayText(field)}
          </span>)}
        </div>
      </div>
    </header>
  );
};

const DetailItem = ({ item }: { item: CustomItem }) => <div className="detail-item">
  {(item.title || item.subtitle || item.dateRange) && <div className="detail-item-heading">
    {item.title && <h3 className="detail-item-title">{item.title}</h3>}
    {item.subtitle && <span>{item.subtitle}</span>}
    {item.dateRange && <span className="detail-item-date">{item.dateRange}</span>}
  </div>}
  {item.description && <div className="detail-rich-text" dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(item.description) }} />}
</div>;

const DetailTemplate: React.FC<DetailTemplateProps> = ({ data, template }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pagePadding = data.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const pageHeight = A4_HEIGHT_PX - 2 * pagePadding;
  const orderedSections = [...data.menuSections].filter((section) => section.enabled).sort((a, b) => a.order - b.order);
  const pages = orderedSections.filter((section) => /^custom-detail-page-\d+$/.test(section.id));
  const showBasic = orderedSections.some((section) => section.id === "basic");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sync = () => syncExplicitResumePages(root);
    const observer = new ResizeObserver(sync);
    root.querySelectorAll<HTMLElement>("[data-detail-page-body]").forEach((body) => observer.observe(body));
    sync();
    return () => observer.disconnect();
  }, [data, pageHeight]);

  // Switching an existing resume to a detail layout must retain its actual data.
  if (!pages.length) return <ClassicTemplate data={data} template={template} />;

  const remainingSections = orderedSections.filter((section) => section.id !== "basic" && !/^custom-detail-page-\d+$/.test(section.id));

  return <div
    ref={rootRef}
    className="detail-resume"
    data-explicit-resume-pages
    data-detail-layout={template.id}
    style={{
      backgroundColor: template.colorScheme.background,
      color: template.colorScheme.text,
      fontSize: data.globalSettings?.baseFontSize ?? 11,
      lineHeight: data.globalSettings?.lineHeight ?? 1.4,
      "--detail-section-gap": `${data.globalSettings?.sectionSpacing ?? 8}px`,
      "--detail-paragraph-gap": `${data.globalSettings?.paragraphSpacing ?? 3}px`,
    } as React.CSSProperties}
  >
    <style>{DETAIL_TEMPLATE_CSS}</style>
    {pages.map((section, index) => <section
      key={section.id}
      data-detail-page={section.id}
      data-resume-section-id={section.id}
      data-detail-page-height={pageHeight}
      style={{ minHeight: pageHeight }}
    >
      <div data-detail-page-body>
        {index === 0 && showBasic && <DetailHeader basic={data.basic} template={template} />}
        {(data.customData[section.id] ?? []).filter((item) => item.visible !== false).map((item) => <DetailItem key={item.id} item={item} />)}
      </div>
      <span className="detail-page-number" aria-hidden="true">{index + 1}</span>
    </section>)}
    {remainingSections.length > 0 && <ClassicTemplate data={{ ...data, menuSections: remainingSections }} template={template} />}
  </div>;
};

export default DetailTemplate;
