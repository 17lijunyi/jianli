export interface DetailPreset {
  pagePadding: number;
  fontSize: number;
  lineHeight: number;
  paragraphGap: number;
  sectionGap: number;
  nameSize: number;
  titleSize: number;
  headingSize: number;
  itemTitleSize: number;
  header: "portrait-right" | "portrait-left" | "compact-grid" | "insurance" | "operations";
  photo: { width: number; height: number; round?: boolean };
  heading: "underline" | "tab-line" | "gray-band" | "icon-line" | "bar-band";
  bilingual: boolean;
  itemOrder: "company-role-date" | "role-company-date" | "date-company-role";
  pageNumber: "none" | "right" | "center";
  weight?: number;
}

/** Measurements expressed in document CSS pixels at 96 dpi, not thumbnail pixels. */
export const DETAIL_PRESETS: Record<string, DetailPreset> = {
  "detail-ai-product": {
    pagePadding: 52, fontSize: 12, lineHeight: 1.666667, paragraphGap: 0, sectionGap: 20,
    nameSize: 48, titleSize: 13.333, headingSize: 12, itemTitleSize: 16,
    header: "portrait-right", photo: { width: 129.333, height: 176 }, heading: "tab-line",
    bilingual: true, itemOrder: "role-company-date", pageNumber: "none",
  },
  "detail-product-practice": {
    pagePadding: 66.667, fontSize: 13.333, lineHeight: 1.8, paragraphGap: 0, sectionGap: 24,
    nameSize: 42.667, titleSize: 13.333, headingSize: 14, itemTitleSize: 16,
    header: "portrait-left", photo: { width: 182.667, height: 182.667, round: true }, heading: "underline",
    bilingual: true, itemOrder: "company-role-date", pageNumber: "none",
  },
  "detail-design-transition": {
    pagePadding: 20, fontSize: 14, lineHeight: 1.47619, paragraphGap: 0, sectionGap: 18,
    nameSize: 30, titleSize: 16, headingSize: 18.667, itemTitleSize: 14.667,
    header: "compact-grid", photo: { width: 92, height: 122.667 }, heading: "underline",
    bilingual: false, itemOrder: "company-role-date", pageNumber: "none",
  },
  "detail-ai-product-master": {
    pagePadding: 66.667, fontSize: 13.333, lineHeight: 1.8, paragraphGap: 0, sectionGap: 22,
    nameSize: 32, titleSize: 14.667, headingSize: 14.667, itemTitleSize: 16,
    header: "portrait-left", photo: { width: 185.333, height: 185.333 }, heading: "underline",
    bilingual: true, itemOrder: "company-role-date", pageNumber: "none",
  },
  "detail-mechanical-transition": {
    pagePadding: 52, fontSize: 12, lineHeight: 1.422222, paragraphGap: 0, sectionGap: 11,
    nameSize: 24, titleSize: 14.667, headingSize: 16, itemTitleSize: 13.333,
    header: "compact-grid", photo: { width: 89.333, height: 113.333 }, heading: "underline",
    bilingual: false, itemOrder: "company-role-date", pageNumber: "right", weight: 350,
  },
  "detail-graduate-fde": {
    pagePadding: 57.333, fontSize: 12.667, lineHeight: 1.68421, paragraphGap: 0, sectionGap: 16,
    nameSize: 27, titleSize: 14.667, headingSize: 18.667, itemTitleSize: 13.333,
    header: "portrait-right", photo: { width: 93.333, height: 122.667 }, heading: "gray-band",
    bilingual: false, itemOrder: "company-role-date", pageNumber: "center",
  },
  "detail-insurance-transition": {
    pagePadding: 58.667, fontSize: 14, lineHeight: 1.866667, paragraphGap: 0, sectionGap: 18,
    nameSize: 30, titleSize: 15, headingSize: 20, itemTitleSize: 14.667,
    header: "insurance", photo: { width: 125.333, height: 172 }, heading: "icon-line",
    bilingual: true, itemOrder: "date-company-role", pageNumber: "none",
  },
  "detail-civil-transition": {
    pagePadding: 68, fontSize: 12.667, lineHeight: 1.421052, paragraphGap: 0, sectionGap: 14,
    nameSize: 28, titleSize: 15, headingSize: 17.333, itemTitleSize: 13.333,
    header: "compact-grid", photo: { width: 120.227, height: 120.227 }, heading: "bar-band",
    bilingual: false, itemOrder: "company-role-date", pageNumber: "right",
  },
  "detail-design-operations": {
    pagePadding: 66.667, fontSize: 13.333, lineHeight: 1.8, paragraphGap: 0, sectionGap: 22,
    nameSize: 36, titleSize: 14.667, headingSize: 16, itemTitleSize: 17.333,
    header: "operations", photo: { width: 210.667, height: 237.333 }, heading: "underline",
    bilingual: true, itemOrder: "company-role-date", pageNumber: "none", weight: 600,
  },
};

export const getDetailPreset = (id: string): DetailPreset => DETAIL_PRESETS[id] ?? DETAIL_PRESETS["detail-ai-product"];
