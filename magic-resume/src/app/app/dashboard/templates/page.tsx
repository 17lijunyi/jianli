/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "@/i18n/compat/client";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATES } from "@/config";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import TemplateDocumentPreview from "@/components/preview/TemplateDocumentPreview";
import { createTemplatePreviewData, isTemplatePreviewLocale } from "@/lib/templatePreview";
import { TEMPLATE_CATEGORIES, getTemplateCategory, getTemplateLabel } from "@/lib/templateCatalog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ResumeTemplate } from "@/types/template";


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

interface TemplateCardItemProps {
  template: ResumeTemplate;
  templateName: string;
  templateDescription: string;
  locale: "zh" | "en";
  selectedColor: string;
  onPreview: () => void;
  onUseTemplate: () => void;
  previewLabel: string;
  useTemplateLabel: string;
}

const TemplateCardItem = ({
  template,
  templateName,
  templateDescription,
  locale,
  selectedColor,
  onPreview,
  onUseTemplate,
  previewLabel,
  useTemplateLabel,
}: TemplateCardItemProps) => {
  const previewData = useMemo(
    () => createTemplatePreviewData(template, locale, selectedColor),
    [template, locale, selectedColor]
  );

  return (
    <article className="template-gallery-card">
      <button type="button" className="resume-paper-cover template-paper-cover" onClick={onPreview} aria-label={`${previewLabel} ${templateName}`}>
        <TemplateDocumentPreview data={previewData} template={template} firstPageOnly />
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
  const currentLocale = useLocale();
  const locale = isTemplatePreviewLocale(currentLocale) ? currentLocale : "zh";
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

  const activePreviewTemplate =
    DEFAULT_TEMPLATES.find((template) => template.id === previewTemplate) ??
    null;

  const activePreviewData = useMemo(
    () => activePreviewTemplate ? createTemplatePreviewData(activePreviewTemplate, locale, selectedColor) : null,
    [activePreviewTemplate, locale, selectedColor]
  );

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

          <Tabs defaultValue="standard">
            <TabsList className="mb-6 h-auto rounded-full p-1" aria-label="模板专栏">
              {TEMPLATE_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="rounded-full px-5 py-2.5">
                  {category.label}
                  <span className="ml-2 text-xs opacity-60">{DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).length}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="template-gallery">
                  {DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).map((template) => (
                    <TemplateCardItem
                      key={template.id}
                      template={template}
                      templateName={getTemplateLabel(template, t)}
                      templateDescription={getTemplateLabel(template, t, "description")}
                      locale={locale}
                      selectedColor={selectedColor}
                      onPreview={() => setPreviewTemplate(template.id)}
                      onUseTemplate={() => handleCreateResume(template.id)}
                      previewLabel={t("preview")}
                      useTemplateLabel={t("useTemplate")}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Dialog
            open={!!previewTemplate}
            onOpenChange={(open) => {
              if (!open) setPreviewTemplate(null);
            }}
          >
            {activePreviewTemplate && activePreviewData && (
              <DialogContent className="template-preview-dialog max-w-[680px] max-h-[calc(100dvh-80px)] p-0 overflow-auto border-0 shadow-lg rounded-xl bg-white dark:bg-gray-900">
                <div className="flex flex-col">
                  <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-4">
                    <DialogTitle className="text-lg font-medium">
                      {getTemplateLabel(activePreviewTemplate, t)}
                    </DialogTitle>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
                    <TemplateDocumentPreview data={activePreviewData} template={activePreviewTemplate} />
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
