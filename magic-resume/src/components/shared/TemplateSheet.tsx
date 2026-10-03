/* Modified for 简励 by 17lijunyi, 2026-10-03. See root NOTICE and MODIFICATIONS.md. */
import { useMemo } from "react";
import { PanelsLeftBottom } from "lucide-react";
import { useTranslations, useLocale } from "@/i18n/compat/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet-no-overlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATES } from "@/config";
import { useResumeStore } from "@/store/useResumeStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import TemplateDocumentPreview from "@/components/preview/TemplateDocumentPreview";
import { createTemplatePreviewData, isTemplatePreviewLocale } from "@/lib/templatePreview";
import { TEMPLATE_CATEGORIES, getTemplateCategory, getTemplateLabel } from "@/lib/templateCatalog";

const TemplateSheet = () => {
  const t = useTranslations("templates");
  const templateT = useTranslations("dashboard.templates");
  const currentLocale = useLocale();
  const locale = isTemplatePreviewLocale(currentLocale) ? currentLocale : "zh";
  const { activeResume, setTemplate } = useResumeStore();
  const previews = useMemo(() => Object.fromEntries(
    DEFAULT_TEMPLATES.map((template) => [template.id, createTemplatePreviewData(template, locale)])
  ), [locale]);
  const currentTemplate = DEFAULT_TEMPLATES.find((template) => template.id === activeResume?.templateId) || DEFAULT_TEMPLATES[0];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" aria-label={t("switchTemplate")}><PanelsLeftBottom size={20} /></button>
      </SheetTrigger>
      <SheetContent side="left" className="template-sheet w-1/2 sm:max-w-1/2 flex flex-col">
        <SheetHeader><SheetTitle>{t("switchTemplate")}</SheetTitle></SheetHeader>
        <SheetDescription>{locale === "en" ? "Switching layouts keeps your current content. Create a resume from the template library to use a complete example." : "切换版式会保留当前简历内容。如需使用完整示例，请从模板库新建简历。"}</SheetDescription>
        <Tabs defaultValue={getTemplateCategory(currentTemplate)} className="mt-4 flex flex-1 min-h-0 flex-col">
          <TabsList className="h-auto shrink-0 self-start rounded-full mb-3 p-1" aria-label="模板专栏">
            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="rounded-full px-3 py-2">
                {category.label}<span className="ml-1 opacity-60">{DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="min-h-0 flex-col data-[state=active]:flex data-[state=active]:flex-1 data-[state=inactive]:hidden">
              <ScrollArea className="flex-1 min-h-0 w-full pr-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                  {DEFAULT_TEMPLATES.filter((template) => getTemplateCategory(template) === category.id).map((template) => (
                    <button key={template.id} type="button" onClick={() => setTemplate(template.id)} aria-label={getTemplateLabel(template, templateT)} aria-pressed={template.id === currentTemplate.id} className="text-left">
                      <div className={cn("aspect-[210/297] overflow-hidden rounded-lg border-2 bg-white transition-colors", template.id === currentTemplate.id ? "border-primary shadow-md" : "border-gray-100 dark:border-neutral-800 hover:border-primary/40")}>
                        <TemplateDocumentPreview data={previews[template.id]} template={template} firstPageOnly />
                      </div>
                      <div className="mt-2 text-xs text-center">{getTemplateLabel(template, templateT)}</div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateSheet;
