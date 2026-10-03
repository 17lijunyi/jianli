/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ResumeTemplateComponent from '@/components/templates';
import { DEFAULT_TEMPLATES } from '@/config';
import { getTemplateLabel } from '@/lib/templateCatalog';
import { normalizeFontFamily } from '@/utils/fonts';
import type { ResumeData } from '@/types/resume';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface ResumeCardItemProps { id:string; resume:ResumeData; t:any; locale:string; router:any; deleteResume:(resume:ResumeData)=>void; duplicateResume:(resume:ResumeData)=>void; index:number; }
export function ResumeCardItem({id,resume,t,locale,router,deleteResume,duplicateResume,index}: ResumeCardItemProps) {
  const container = React.useRef<HTMLButtonElement>(null);
  const [scale,setScale] = React.useState(.22);
  const [deleting,setDeleting] = React.useState(false);
  const template = DEFAULT_TEMPLATES.find(x=>x.id===resume.templateId) || DEFAULT_TEMPLATES[0];
  React.useEffect(()=>{
    if(!container.current) return;
    const observer=new ResizeObserver(([entry])=>setScale(entry.contentRect.width/793.700787));
    observer.observe(container.current); return ()=>observer.disconnect();
  },[]);
  const edit=()=>router.push({to:'/app/workbench/$id',params:{id}});
  return <motion.article className="resume-gallery-card" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:Math.min(index*.035,.2)}}>
    <button className="resume-paper-cover" ref={container} onClick={edit} aria-label={`编辑 ${resume.title || '未命名简历'}`}>
      <div className="resume-preview" style={{width:'210mm',height:'297mm',transform:`scale(${scale})`,transformOrigin:'top left',padding:resume.globalSettings?.pagePadding ?? 32,fontFamily:normalizeFontFamily(resume.globalSettings?.fontFamily),background:'#fff',color:'#202020',textAlign:'left',pointerEvents:'none'}}><ResumeTemplateComponent data={resume} template={template}/></div>
    </button>
    <div className="resume-card-caption"><button onClick={edit} title={resume.title}>{resume.title || '未命名简历'}</button><span>{getTemplateLabel(template, key => t(`dashboard.templates.${key}`))} · {new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'}).format(new Date(resume.updatedAt || resume.createdAt || 0))}</span></div>
    <div className="resume-card-actions"><button onClick={edit} title="编辑" aria-label="编辑"><Edit2 size={13}/></button><button onClick={()=>duplicateResume(resume)} title="复制" aria-label="复制"><Copy size={13}/></button><button onClick={()=>setDeleting(true)} title="删除" aria-label="删除"><Trash2 size={13}/></button></div>
    <AlertDialog open={deleting} onOpenChange={setDeleting}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('dashboard.resumes.deleteConfirmTitle')}</AlertDialogTitle><AlertDialogDescription>{t('dashboard.resumes.deleteConfirmDescription')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={()=>{deleteResume(resume);setDeleting(false);toast.success(t('common.deleteSuccess'));}}>{t('common.confirm')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </motion.article>;
}
