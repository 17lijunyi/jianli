/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import React, { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "@/i18n/compat/client";
import { useRouter } from "@/lib/navigation";
import { Plus, Settings, Search, ArrowDownWideNarrow, FilePlus2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getConfig, getFileHandle } from "@/utils/fileSystem";
import { preloadFontFamily } from "@/utils/fonts";
import { useResumeStore } from "@/store/useResumeStore";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { DEFAULT_TEMPLATES } from "@/config";
import { CreateResumeModal } from "./CreateResumeModal";
import { ImportResumeDialog } from "./ImportResumeDialog";
import { ResumeCardItem } from "./ResumeCardItem";
import {
    createResumeFromAIResult,
    toStringArray
} from "./utils";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

import { MAX_PDF_IMPORT_PAGES, MAX_PDF_FILE_BYTES, MAX_PDF_REQUEST_BYTES, isPdfImportConfigured } from "@/config/pdf-import";
import { getTaskModel, toAIConnection } from "@/config/ai-models";
import { requestPdfImport, pdfImportErrorMessage } from "@/lib/pdf-import-client";
import { ResumeImportError } from "@/lib/resume-import-schema";
import { PdfImportPreview } from "./PdfImportPreview";
const PDF_IMAGE_QUALITY = 0.82;
const PDF_MAX_IMAGE_WIDTH = 1600;

export const ResumeWorkbench = () => {
    const t = useTranslations();
    const locale = useLocale();
    const {
        resumes,
        setActiveResume,
        addResume,
        deleteResume,
        createResume,
    } = useResumeStore();
    const aiConfig = useAIConfigStore();
    const pdfConnection = getTaskModel(aiConfig, "pdf");
    const [pendingPdfResume, setPendingPdfResume] = useState<ReturnType<typeof createResumeFromAIResult> | null>(null);
    const router = useRouter();
    const [hasConfiguredFolder, setHasConfiguredFolder] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [query, setQuery] = useState("");
    const [sortNewest, setSortNewest] = useState(true);
    useEffect(() => {
        const create = () => setIsCreateModalOpen(true);
        const upload = () => setIsImportDialogOpen(true);
        document.addEventListener('resume:create', create);
        document.addEventListener('resume:import', upload);
        const search = new URLSearchParams(window.location.search);
        if (search.has('create')) create();
        if (search.has('import')) upload();
        if (search.has('create') || search.has('import')) history.replaceState(history.state, '', window.location.pathname);
        return () => { document.removeEventListener('resume:create', create); document.removeEventListener('resume:import', upload); };
    }, []);
    const filteredResumes = Object.entries(resumes).filter(([,r]) => (r.title + ' ' + r.basic?.name + ' ' + r.basic?.title).toLowerCase().includes(query.toLowerCase())).sort(([,a],[,b]) => sortNewest ? new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime() : (a.title || '').localeCompare(b.title || '', 'zh'));
    const jsonFileInputRef = useRef<HTMLInputElement>(null);
    const pdfFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadSavedConfig = async () => {
            try {
                const handle = await getFileHandle("syncDirectory");
                const path = await getConfig("syncDirectoryPath");
                if (handle && path) {
                    setHasConfiguredFolder(true);
                }
            } catch (error) {
                console.error("Error loading saved config:", error);
            }
        };

        loadSavedConfig();
    }, []);

    useEffect(() => {
        const fontFamilies = Array.from(
            new Set(
                Object.values(resumes)
                    .map((resume) => resume.globalSettings?.fontFamily)
                    .filter(Boolean)
            )
        );

        if (fontFamilies.length === 0) return;

        let cancelled = false;
        const warmFonts = () => {
            if (cancelled) return;
            fontFamilies.forEach((fontFamily) => {
                preloadFontFamily(fontFamily).catch((error) => {
                    console.warn("Failed to preload resume font:", error);
                });
            });
        };

        const supportsIdleCallback =
            typeof window !== "undefined" &&
            typeof window.requestIdleCallback === "function";
        const idleCallback = supportsIdleCallback
            ? window.requestIdleCallback(warmFonts, { timeout: 2500 })
            : globalThis.setTimeout(warmFonts, 1000);

        return () => {
            cancelled = true;
            if (
                supportsIdleCallback &&
                typeof window !== "undefined" &&
                typeof window.cancelIdleCallback === "function"
            ) {
                window.cancelIdleCallback(idleCallback as number);
            } else {
                globalThis.clearTimeout(idleCallback);
            }
        };
    }, [resumes]);

    const handleCreateFromModal = (templateId: string | null) => {
        const isBlank = !templateId;
        const newId = createResume(templateId, isBlank);

        if (templateId) {
            const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
            if (template) {
                const { resumes, updateResume } = useResumeStore.getState();
                const resume = resumes[newId];
                if (resume) {
                    updateResume(newId, {
                        globalSettings: {
                            ...resume.globalSettings,
                            themeColor: template.colorScheme.primary,
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
            }
        }

        setIsCreateModalOpen(false);
        setActiveResume(newId);
        router.push({ to: "/app/workbench/$id", params: { id: newId } });
    };

    const duplicateResume = async (resume: any) => {
        const { generateUUID } = await import("@/utils/uuid");
        const now = new Date().toISOString();
        
        const { id, ...rest } = resume;
        const newResume = {
            ...rest,
            id: generateUUID(),
            title: `${resume.title || t("dashboard.resumes.untitled")} - ${t("common.copy")}`,
            createdAt: now,
            updatedAt: now,
        };
        
        const resumeId = addResume(newResume);
        toast.success(t("previewDock.copyResume.success"));
    };

    const importResumeFromJson = async (file: File) => {
        const content = await file.text();
        const config = JSON.parse(content);
        const now = new Date().toISOString();
        const { generateUUID } = await import("@/utils/uuid");
        const { initialResumeState } = await import("@/config/initialResumeData");

        const newResume = {
            ...initialResumeState,
            ...config,
            id: generateUUID(),
            createdAt: now,
            updatedAt: now,
        };
        const resumeId = addResume(newResume);
        setActiveResume(resumeId);
        setIsImportDialogOpen(false);
        toast.success(t("dashboard.resumes.importSuccess"));
        router.push({ to: "/app/workbench/$id", params: { id: resumeId } });
    };

    const extractImagesFromPdf = async (file: File) => {
        if (file.size > MAX_PDF_FILE_BYTES) throw new ResumeImportError("fileTooLarge");
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
        // Password-protected files must fail instead of waiting for an absent password UI.
        loadingTask.onPassword = () => { void loadingTask.destroy(); };
        try {
            const pdf = await loadingTask.promise;
            if (pdf.numPages > MAX_PDF_IMPORT_PAGES) throw new ResumeImportError("tooManyPages");
            const images: string[] = [];
            let imageBytes = 0;
            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                const page = await pdf.getPage(pageNumber);
                const base = page.getViewport({ scale: 2 });
                const scale = Math.min(1, PDF_MAX_IMAGE_WIDTH / base.width, 3000 / base.height);
                const viewport = page.getViewport({ scale: 2 * scale });
                const canvas = document.createElement("canvas");
                try {
                    const context = canvas.getContext("2d", { alpha: false });
                    if (!context) throw new ResumeImportError("invalidPdf");
                    canvas.width = Math.max(1, Math.floor(viewport.width));
                    canvas.height = Math.max(1, Math.floor(viewport.height));
                    await page.render({ canvas, canvasContext: context, viewport }).promise;
                    const image = canvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
                    imageBytes += image.length;
                    if (imageBytes > MAX_PDF_REQUEST_BYTES) throw new ResumeImportError("requestTooLarge");
                    images.push(image);
                } finally {
                    canvas.width = 0;
                    canvas.height = 0;
                    page.cleanup();
                }
            }
            return images;
        } finally { await loadingTask.destroy(); }
    };

    const importResumeFromPdf = async (file: File) => {
        if (!isPdfImportConfigured(pdfConnection)) {
            toast.error(t("dashboard.resumes.importDialog.configRequired"));
            router.push("/app/dashboard/ai");
            return;
        }
        const images = await extractImagesFromPdf(file);
        const data = await requestPdfImport(toAIConnection(pdfConnection), images);
        if (!data.resume) throw new ResumeImportError("invalidOutput");
        const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").trim();
        setPendingPdfResume(createResumeFromAIResult(data.resume, nameWithoutExt));
        setIsImportDialogOpen(false);
        if (data.warnings?.includes("missingName")) toast.warning(t("dashboard.resumes.importDialog.missingName"));
    };

    const confirmPdfImport = () => {
        if (!pendingPdfResume) return;
        const resumeId = addResume(pendingPdfResume);
        setActiveResume(resumeId);
        setPendingPdfResume(null);
        toast.success(t("dashboard.resumes.importDialog.pdfSuccess"));
        router.push({ to: "/app/workbench/$id", params: { id: resumeId } });
    };

    const handleJsonFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || isImporting) return;

        try {
            setIsImporting(true);
            await importResumeFromJson(file);
        } catch (error) {
            console.error("Import JSON error:", error);
            toast.error(t("dashboard.resumes.importError"));
        } finally {
            setIsImporting(false);
        }
    };

    const handlePdfFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || isImporting) return;

        try {
            setIsImporting(true);
            await importResumeFromPdf(file);
        } catch (error) {
            toast.error(pdfImportErrorMessage(error, t));
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <ScrollArea className="glass-scroll h-full w-full">
            <div className="resume-library">
                <header className="library-heading">
                    <div><h1>{t("dashboard.resumes.myResume")}</h1><p>{Object.keys(resumes).length} 份简历</p></div>
                    <button type="button" className="glass-round-button" aria-label={sortNewest ? "按名称排序" : "按最近编辑排序"} title={sortNewest ? "按名称排序" : "按最近编辑排序"} onClick={() => setSortNewest(!sortNewest)}><ArrowDownWideNarrow size={19}/></button>
                </header>
                <div className="library-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索简历、姓名或职位" aria-label="搜索简历"/>{query && <button onClick={() => setQuery('')} aria-label="清除搜索">×</button>}</div>
                {Object.keys(resumes).length === 0 ? <div className="library-empty">
                    <div className="empty-document"><FilePlus2 size={40} strokeWidth={1}/></div>
                    <h2>下一段旅程，从这里开始</h2><p>创建一份新简历，或导入已有的内容。</p>
                    <div><Button onClick={() => setIsCreateModalOpen(true)}><Plus size={16}/>新建简历</Button><Button variant="ghost" onClick={() => setIsImportDialogOpen(true)}><Upload size={16}/>导入简历</Button></div>
                </div> : <div className="resume-gallery">
                    {filteredResumes.map(([id,resume], index) => <ResumeCardItem key={id} id={id} resume={resume} t={t} locale={locale} router={router} deleteResume={deleteResume} duplicateResume={duplicateResume} index={index}/>)}
                    {!query && <button className="new-resume-tile" onClick={() => setIsCreateModalOpen(true)} aria-label="新建简历"><Plus size={28} strokeWidth={1.2}/><span>新建简历</span></button>}
                    {query && !filteredResumes.length && <p className="library-no-results">没有找到匹配的简历</p>}
                </div>}
                {!hasConfiguredFolder && <button className="library-backup-note" onClick={() => router.push('/app/dashboard/settings')}><Settings size={14}/><span>设置备份文件夹，给简历多一份安心</span><span>设置 →</span></button>}
                <CreateResumeModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onCreate={handleCreateFromModal}
                />

                <PdfImportPreview resume={pendingPdfResume} onCancel={() => setPendingPdfResume(null)} onConfirm={confirmPdfImport} />
                <ImportResumeDialog
                    modelLabel={pdfConnection?.model || t("common.notConfigured")}
                    onConfigure={() => router.push("/app/dashboard/ai")}
                    open={isImportDialogOpen}
                    isImporting={isImporting}
                    onOpenChange={setIsImportDialogOpen}
                    jsonFileInputRef={jsonFileInputRef}
                    pdfFileInputRef={pdfFileInputRef}
                    onJsonFileChange={handleJsonFileChange}
                    onPdfFileChange={handlePdfFileChange}
                />
            </div>
        </ScrollArea>
    );
};
