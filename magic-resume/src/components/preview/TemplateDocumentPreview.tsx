import { useEffect, useRef, useState } from "react";
import ResumeTemplateComponent from "@/components/templates";
import type { ResumeData } from "@/types/resume";
import type { ResumeTemplate } from "@/types/template";
import { normalizeFontFamily } from "@/utils/fonts";
import { A4_HEIGHT_PX, RESUME_LAYOUT_CSS } from "@/utils/resumeLayout";
import { getTemplateCategory } from "@/lib/templateCatalog";

const A4_WIDTH_PX = 210 * 96 / 25.4;

/** Read-only, store-independent preview. Full previews grow to include every page. */
export default function TemplateDocumentPreview({
  data,
  template,
  firstPageOnly = false,
  maxWidth = 680,
}: {
  data: ResumeData;
  template: ResumeTemplate;
  firstPageOnly?: boolean;
  maxWidth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(A4_HEIGHT_PX);
  const pagePadding = data.globalSettings.pagePadding ?? template.spacing.contentPadding;
  const isDetail = getTemplateCategory(template) === "detail";
  const contentPerPage = A4_HEIGHT_PX - 2 * pagePadding;
  const pageCount = Math.max(1, Math.ceil((height - 2 * pagePadding) / contentPerPage));

  useEffect(() => {
    const container = containerRef.current;
    const paper = documentRef.current;
    if (!container || !paper) return;
    const measure = () => {
      setScale(Math.min(container.clientWidth, maxWidth, A4_WIDTH_PX) / A4_WIDTH_PX);
      setHeight(Math.max(A4_HEIGHT_PX, paper.offsetHeight, paper.scrollHeight));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(paper);
    measure();
    return () => observer.disconnect();
  }, [maxWidth, data, template]);

  return (
    <div ref={containerRef} className="w-full" data-template-document-preview>
      <div
        className="relative mx-auto overflow-hidden bg-white text-black shadow-sm"
        style={{ width: A4_WIDTH_PX * scale, height: (firstPageOnly ? A4_HEIGHT_PX : height) * scale }}
      >
        <div
          ref={documentRef}
          className="resume-preview relative bg-white pointer-events-none"
          data-resume-document
          style={{
            width: A4_WIDTH_PX,
            minHeight: A4_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            padding: pagePadding,
            fontFamily: normalizeFontFamily(data.globalSettings.fontFamily),
            textAlign: "left",
          }}
        >
          <style>{RESUME_LAYOUT_CSS}</style>
          <div data-resume-content style={{ width: "100%", display: "flow-root" }}>
            <ResumeTemplateComponent data={data} template={template} />
          </div>
          {!firstPageOnly && !isDetail && Array.from({ length: pageCount - 1 }, (_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-dashed border-gray-300" style={{ top: pagePadding + (i + 1) * contentPerPage }}>
              <span className="absolute right-1 bottom-1 text-[11px] text-gray-500">第 {i + 1} 页结束</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
