/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "@/i18n/compat/client";
import { motion } from "framer-motion";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATES } from "@/config";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ResumeTemplateComponent from "@/components/templates";
import { initialResumeState, initialResumeStateEn } from "@/config/initialResumeData";
import type { ResumeTemplate } from "@/types/template";
import { normalizeFontFamily } from "@/utils/fonts";

const A4_WIDTH_PX = 793.700787;
const PREVIEW_MODAL_SCALE = 0.529166667;

const PRESET_COLORS = [
  { name: "default", value: "" },
  { name: "blue", value: "#3b82f6" },
  { name: "green", value: "#10b981" },
  { name: "purple", value: "#8b5cf6" },
  { name: "orange", value: "#f97316" },
  { name: "red", value: "#ef4444" },
  { name: "slate", value: "#475569" },
  { name: "black", value: "#000000" },
];

const getTemplateKey = (templateId: string) =>
  templateId === "left-right" ? "leftRight" : templateId;

type TemplatePreviewBaseData =
  | typeof initialResumeState
  | typeof initialResumeStateEn;

const buildTemplatePreviewData = (
  baseData: TemplatePreviewBaseData,
  template: ResumeTemplate,
  selectedColor: string,
  mockId: string
) =>
({
  ...baseData,
  id: mockId,
  templateId: template.id,
  globalSettings: {
    ...baseData.globalSettings,
    themeColor: selectedColor || template.colorScheme.primary,
    sectionSpacing: template.spacing.sectionGap,
    paragraphSpacing: template.spacing.itemGap,
    pagePadding: template.spacing.contentPadding,
  },
  basic: {
    ...baseData.basic,
    layout: template.basic.layout,
  },
} as any);

interface TemplateCardItemProps {
  index: number;
  template: ResumeTemplate;
  templateName: string;
  templateDescription: string;
  baseData: TemplatePreviewBaseData;
  selectedColor: string;
  onPreview: () => void;
  onUseTemplate: () => void;
  previewLabel: string;
  useTemplateLabel: string;
}

const TemplateCardItem = ({
  index,
  template,
  templateName,
  templateDescription,
  baseData,
  selectedColor,
  onPreview,
  onUseTemplate,
  previewLabel,
  useTemplateLabel,
}: TemplateCardItemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.24);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setScale(width / A4_WIDTH_PX);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const previewData = buildTemplatePreviewData(
    baseData,
    template,
    selectedColor,
    `template-preview-${template.id}`
  );

  return (
    <article className="template-gallery-card">
      <button type="button" className="resume-paper-cover template-paper-cover" onClick={onPreview} aria-label={`${previewLabel} ${templateName}`}>
        <div ref={containerRef} className="absolute inset-0 pointer-events-none">
          <div className="resume-preview absolute top-0 left-0" style={{
            width: "210mm", minHeight: "297mm", transform: `scale(${scale})`, transformOrigin: "top left",
            padding: `${template.spacing.contentPadding}px`, fontFamily: normalizeFontFamily(previewData.globalSettings?.fontFamily), textAlign: "left",
          }}>
            <ResumeTemplateComponent data={previewData} template={template}/>
          </div>
        </div>
      </button>
      <div className="template-card-caption"><h3>{templateName}</h3><p title={templateDescription}>{templateDescription}</p></div>
      <div className="template-card-actions">
        <Button variant="ghost" size="sm" onClick={onPreview}>{previewLabel}</Button>
        <Button variant="secondary" size="sm" onClick={onUseTemplate}>{useTemplateLabel}</Button>
      </div>
    </article>
  );
};

const TemplatesPage = () => {
  const t = useTranslations("dashboard.templates");
  const locale = useLocale();
  const router = useRouter();
  const createResume = useResumeStore((state) => state.createResume);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0].value);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let currentIndex = 0;
    autoPlayRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % PRESET_COLORS.length;
      setSelectedColor(PRESET_COLORS[currentIndex].value);
    }, 3000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, []);

  const handleColorSelect = (value: string) => {
    setSelectedColor(value);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const baseData = locale === "en" ? initialResumeStateEn : initialResumeState;
  const activePreviewTemplate =
    DEFAULT_TEMPLATES.find((template) => template.id === previewTemplate) ??
    null;

  const handleCreateResume = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) return;

    const resumeId = createResume(templateId);
    const { resumes, updateResume } = useResumeStore.getState();
    const resume = resumes[resumeId];

    if (resume) {
      updateResume(resumeId, {
        globalSettings: {
          ...resume.globalSettings,
          themeColor: selectedColor || template.colorScheme.primary,
          sectionSpacing: template.spacing.sectionGap,
          paragraphSpacing: template.spacing.itemGap,
          pagePadding: template.spacing.contentPadding,
        },
        basic: {
          ...resume.basic,
          layout: template.basic.layout,
        },
      });
    }

    router.push({ to: "/app/workbench/$id", params: { id: resumeId } });
  };

  return (
    <ScrollArea className="glass-scroll h-full w-full">
      <div className="template-library w-full max-w-[1600px] mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2><p className="template-count">{DEFAULT_TEMPLATES.length} 款模板，找到适合你的表达</p></div>

            <div className="flex items-center space-x-2 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-full border border-gray-100 dark:border-gray-800 backdrop-blur-sm self-start sm:self-auto overflow-x-auto">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={cn(
                    "relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110",
                    selectedColor === color.value
                      ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-950 scale-110"
                      : ""
                  )}
                  title={color.name === "default" ? "Default" : color.name}
                >
                  {color.value ? (
                    <div
                      className="w-full h-full rounded-full border border-black/10 dark:border-white/10 shadow-sm"
                      style={{ backgroundColor: color.value }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm flex items-center justify-center">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-tighter">
                        默认
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="template-gallery">
            {DEFAULT_TEMPLATES.map((template, index) => {
              const templateKey = getTemplateKey(template.id);
              return (
                <TemplateCardItem
                  key={template.id}
                  index={index}
                  template={template}
                  templateName={t(`${templateKey}.name`)}
                  templateDescription={t(`${templateKey}.description`)}
                  baseData={baseData}
                  selectedColor={selectedColor}
                  onPreview={() => setPreviewTemplate(template.id)}
                  onUseTemplate={() => handleCreateResume(template.id)}
                  previewLabel={t("preview")}
                  useTemplateLabel={t("useTemplate")}
                />
              );
            })}
          </div>

          <Dialog
            open={!!previewTemplate}
            onOpenChange={(open) => {
              if (!open) setPreviewTemplate(null);
            }}
          >
            {activePreviewTemplate && (
              <DialogContent className="template-preview-dialog max-w-[680px] p-0 overflow-auto border-0 shadow-lg rounded-xl bg-white dark:bg-gray-900">
                <div className="flex flex-col">
                  <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-4">
                    <DialogTitle className="text-lg font-medium">
                      {t(`${getTemplateKey(activePreviewTemplate.id)}.name`)}
                    </DialogTitle>
                  </div>
                  <div className="overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-8 pointer-events-none">
                    <div
                      className="relative bg-white shadow-md ring-1 ring-gray-200/50 overflow-hidden"
                      style={{ width: "420px", height: "594px" }}
                    >
                      <div
                        className="resume-preview absolute top-0 left-0 bg-white"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          transform: `scale(${PREVIEW_MODAL_SCALE})`,
                          transformOrigin: "top left",
                          padding: `${activePreviewTemplate.spacing.contentPadding}px`,
                          fontFamily: normalizeFontFamily(
                            buildTemplatePreviewData(
                              baseData,
                              activePreviewTemplate,
                              selectedColor,
                              "template-preview-modal"
                            ).globalSettings?.fontFamily
                          ),
                        }}
                      >
                        <ResumeTemplateComponent
                          data={buildTemplatePreviewData(
                            baseData,
                            activePreviewTemplate,
                            selectedColor,
                            "preview-mock-id-large"
                          )}
                          template={activePreviewTemplate}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                    <Button
                      className="w-full"
                      onClick={() => {
                        const templateId = activePreviewTemplate.id;
                        setPreviewTemplate(null);
                        handleCreateResume(templateId);
                      }}
                    >
                      {t("useTemplate")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    </ScrollArea>
  );
};

export const runtime = "edge";

export default TemplatesPage;
