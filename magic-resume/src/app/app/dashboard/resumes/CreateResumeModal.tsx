import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "@/i18n/compat/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_TEMPLATES } from "@/config";
import TemplateDocumentPreview from "@/components/preview/TemplateDocumentPreview";
import { createTemplatePreviewData, isTemplatePreviewLocale } from "@/lib/templatePreview";
import { TEMPLATE_CATEGORIES, getTemplateCategory, getTemplateLabel, type TemplateCategory } from "@/lib/templateCatalog";
import type { ResumeTemplate } from "@/types/template";
import { ChevronLeft, FilePlus, Sparkles, X } from "lucide-react";

interface CreateResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (templateId: string | null) => void;
}

export const CreateResumeModal = ({ open, onOpenChange, onCreate }: CreateResumeModalProps) => {
  const t = useTranslations();
  const templateT = useTranslations("dashboard.templates");
  const currentLocale = useLocale();
  const locale = isTemplatePreviewLocale(currentLocale) ? currentLocale : "zh";
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("standard");
  const [previewTarget, setPreviewTarget] = useState<ResumeTemplate | null>(null);
  const previews = useMemo(() => Object.fromEntries(
    DEFAULT_TEMPLATES.map((template) => [template.id, createTemplatePreviewData(template, locale)])
  ), [locale]);

  useEffect(() => {
    if (!open) setPreviewTarget(null);
  }, [open]);

  const handleCreate = (templateId: string | null) => {
    onCreate(templateId);
    setPreviewTarget(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-[1100px] w-[95vw] h-[90vh] sm:h-[85vh] p-0 overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] flex flex-col gap-0">
        <div className="flex-none px-6 sm:px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {previewTarget && <Button variant="ghost" size="icon" onClick={() => setPreviewTarget(null)} aria-label={t("dashboard.resumes.createDialog.backToGrid")}><ChevronLeft className="w-5 h-5" /></Button>}
            <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              {previewTarget ? getTemplateLabel(previewTarget, templateT) : t("dashboard.resumes.createDialog.title")}
            </DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label={t("common.cancel")}><X className="w-5 h-5" /></Button>
        </div>

        {previewTarget ? (
          <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
            <ScrollArea className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900/50">
              <div className="p-4 sm:p-8">
                <TemplateDocumentPreview data={previews[previewTarget.id]} template={previewTarget} />
              </div>
            </ScrollArea>
            <div className="w-full sm:w-[280px] shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:justify-center">
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{getTemplateLabel(previewTarget, templateT, "description")}</p>
              <Button size="lg" onClick={() => handleCreate(previewTarget.id)}>
                {t("dashboard.resumes.createDialog.useThisTemplate")}<Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 w-full">
            <div className="px-6 sm:px-8 pb-10 space-y-8">
              <button type="button" onClick={() => handleCreate(null)} className="w-full rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-5 flex items-center gap-5 text-left bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-colors">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center"><FilePlus className="w-8 h-8 text-gray-400" /></div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{t("dashboard.resumes.createDialog.blankTitle")}</h3>
                  <p className="text-sm text-gray-500">{t("dashboard.resumes.createDialog.blankCardDescription")}</p>
                </div>
              </button>
              <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as TemplateCategory)}>
                <TabsList className="h-auto rounded-full mb-6 p-1" aria-label="模板专栏">
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="rounded-full px-4 py-2.5">
                      {category.label}<span className="ml-2 opacity-60">{DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).length}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
                      {DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).map((template) => (
                        <button key={template.id} type="button" onClick={() => setPreviewTarget(template)} aria-label={getTemplateLabel(template, templateT)} className="group text-left">
                          <div className="aspect-[210/297] rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-800/60 bg-white group-hover:border-primary/50 shadow-sm transition-colors">
                            <TemplateDocumentPreview data={previews[template.id]} template={template} firstPageOnly />
                          </div>
                          <div className="mt-3 text-sm font-semibold text-center">{getTemplateLabel(template, templateT)}</div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
