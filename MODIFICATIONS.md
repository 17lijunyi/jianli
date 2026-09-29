# Changes from upstream / 二次开发记录

上游快照：`e369fbed4aa38e43257cf33817a521c6a5a559cd`。以下文件由 17lijunyi 于 2026-09-30 修改，涉及简励名称与图标、统一玻璃界面、悬浮导航、编辑器布局与纸张预览。JSON 和二进制资源的修改声明集中列于此，保留其原始格式。

- `magic-resume/public/favicon.ico`
- `magic-resume/public/icon.png`
- `magic-resume/src/app/app/dashboard/ai/page.tsx`
- `magic-resume/src/app/app/dashboard/client.tsx`
- `magic-resume/src/app/app/dashboard/resumes/ResumeCardItem.tsx`
- `magic-resume/src/app/app/dashboard/resumes/ResumeWorkbench.tsx`
- `magic-resume/src/app/app/dashboard/settings/page.tsx`
- `magic-resume/src/app/app/dashboard/templates/page.tsx`
- `magic-resume/src/app/app/workbench/[id]/page.tsx`
- `magic-resume/src/app/layout.tsx`
- `magic-resume/src/app/manifest.ts`
- `magic-resume/src/app/providers.tsx`
- `magic-resume/src/components/Document.tsx`
- `magic-resume/src/components/editor/EditPanel.tsx`
- `magic-resume/src/components/editor/EditorHeader.tsx`
- `magic-resume/src/components/editor/basic/BasicPanel.tsx`
- `magic-resume/src/components/home/Footer.tsx`
- `magic-resume/src/components/preview/FAQDialog.tsx`
- `magic-resume/src/components/preview/PreviewDock.tsx`
- `magic-resume/src/components/preview/index.tsx`
- `magic-resume/src/components/shared/Logo.tsx`
- `magic-resume/src/components/shared/TemplateSheet.tsx`
- `magic-resume/src/components/ui/alert-dialog.tsx`
- `magic-resume/src/components/ui/button.tsx`
- `magic-resume/src/components/ui/card.tsx`
- `magic-resume/src/components/ui/dialog.tsx`
- `magic-resume/src/components/ui/dropdown-menu.tsx`
- `magic-resume/src/components/ui/input.tsx`
- `magic-resume/src/components/ui/popover.tsx`
- `magic-resume/src/components/ui/select.tsx`
- `magic-resume/src/components/ui/sheet-no-overlay.tsx`
- `magic-resume/src/components/ui/sheet.tsx`
- `magic-resume/src/components/ui/slider.tsx`
- `magic-resume/src/components/ui/switch.tsx`
- `magic-resume/src/components/ui/textarea.tsx`
- `magic-resume/src/components/ui/tooltip.tsx`
- `magic-resume/src/i18n/locales/en.json`
- `magic-resume/src/i18n/locales/zh.json`
- `magic-resume/src/routes/$locale.tsx`
- `magic-resume/src/routes/__root.tsx`

新增：`magic-resume/src/components/desktop/`、`magic-resume/src/styles/glass.css`、`magic-resume/pnpm-workspace.yaml`；`magic-resume-desktop/` 为新增桌面封装、AppKit 材质与窗口控制、图标及回归测试。

本公开快照不包含上游部署工作流、本机环境文件、用户数据、备份或测试导出。前端依赖和核心简历业务沿用上游。

发布构建补充：`magic-resume/package.json` 固定为已验证的 pnpm 11.19.0，与 `pnpm-workspace.yaml` 的构建依赖设置一致。
