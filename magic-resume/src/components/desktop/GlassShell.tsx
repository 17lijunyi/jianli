import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Files, LayoutGrid, Sparkles, Settings2, Plus, Upload, ArrowLeft, FileText, Clock3, ChevronRight, ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from '@/lib/navigation';
import { useResumeStore } from '@/store/useResumeStore';
import Logo from '@/components/shared/Logo';

const pages = [
  { path: '/app/dashboard/resumes', label: '我的简历', icon: Files },
  { path: '/app/dashboard/templates', label: '简历模板', icon: LayoutGrid },
  { path: '/app/dashboard/ai', label: 'AI 服务商', icon: Sparkles },
  { path: '/app/dashboard/settings', label: '通用设置', icon: Settings2 },
];

export function GlassShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const resumes = useResumeStore(s => s.resumes);
  const activeResume = useResumeStore(s => s.activeResume);
  const reduced = useReducedMotion();
  const editing = pathname.includes('/workbench/');
  const inApp = pathname.startsWith('/app') && !pathname.startsWith('/app/preview-template/');
  const recent = Object.values(resumes).sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime()-new Date(a.updatedAt || a.createdAt).getTime()).slice(0,5);
  const current = pages.findIndex(p => pathname.startsWith(p.path));
  useEffect(() => {
    document.documentElement.classList.toggle('glass-app', inApp);
    return () => document.documentElement.classList.remove('glass-app');
  }, [inApp]);
  if (!inApp) return <>{children}</>;
  const action = (name: string) => {
    if (pathname === pages[0].path) document.dispatchEvent(new Event(`resume:${name}`));
    else router.push(`${pages[0].path}?${name}=1`);
  };
  return (
    <div className={`glass-stage ${editing ? 'is-editing' : ''}`}>
      <nav className="glass-rail glass-surface" data-glass-surface aria-label="主导航">
        <div className="rail-brand" title="简励"><Logo size={34}/></div>
        <span className="rail-rule"/>
        {pages.map((p,i) => <button key={p.path} type="button" aria-label={p.label} title={p.label} aria-current={i===current || (editing && i===0) ? 'page' : undefined} onClick={() => router.push(p.path)}>
          {(i===current || (editing && i===0)) && <motion.span className="rail-selection" layoutId="rail-selection" transition={reduced ? {duration:0} : {type:'spring',stiffness:430,damping:34}}/>}
          <p.icon size={21} strokeWidth={1.6}/>
        </button>)}
      </nav>
      <section className="glass-workspace glass-surface" data-glass-surface>
        <div className="glass-window-drag" aria-hidden="true"/>
        {!editing && <aside className="glass-sidebar">
          <header><h1>简励</h1><p>让下一步，更进一步</p></header>
          <nav aria-label="工作区">
            {pages.map((p,i) => <button key={p.path} type="button" className={i===current ? 'selected' : ''} onClick={() => router.push(p.path)} aria-current={i===current ? 'page' : undefined}><p.icon size={17} strokeWidth={1.6}/><span>{p.label}</span>{i===0 && <small>{Object.keys(resumes).length}</small>}</button>)}
          </nav>
          <div className="sidebar-recent-heading"><span>最近编辑</span><Clock3 size={13}/></div>
          <div className="sidebar-recent">
            {recent.length ? recent.map(r => <button key={r.id} onClick={() => router.push(`/app/workbench/${r.id}`)} title={r.title}><span className="sidebar-document"><FileText size={15}/></span><span>{r.title || '未命名简历'}</span><ChevronRight size={12}/></button>) : <p>你的简历会出现在这里</p>}
          </div>
          <button className="sidebar-add" onClick={() => action('create')}><Plus size={18}/><span>新建简历</span></button>
          <div className="sidebar-local"><ShieldCheck size={14}/><span>内容保存在本机</span></div>
        </aside>}
        <main className="glass-page">{children}</main>
      </section>
      <footer className="glass-statusbar glass-surface" data-glass-surface>
        <button title="我的简历" aria-label="返回我的简历" onClick={() => router.push(pages[0].path)}>{editing ? <ArrowLeft size={18}/> : <Files size={18}/>}</button>
        <span className="status-divider"/>
        <div className="status-context"><strong>{editing ? activeResume?.title || '简历编辑器' : pages[current]?.label || '简历工作区'}</strong><span>{editing ? '修改自动保存到本机' : `${Object.keys(resumes).length} 份简历 · 随时继续创作`}</span></div>
        <span className="status-spacer"/>
        <button title="导入简历" aria-label="导入简历" onClick={() => action('import')}><Upload size={18}/></button>
        <button className="status-primary" onClick={() => action('create')}><Plus size={17}/><span>新建简历</span></button>
      </footer>
    </div>
  );
}
