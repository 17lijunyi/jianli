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

## 2026-10-03：模板专栏与完整内容示例

模板库、新建弹窗和编辑器模板侧栏拆分为「简历模版」与「简历细节模版」，各 9 款。新增 9 份共 28 页的可编辑内容示例，保留工作、项目和教育等完整正文；姓名、联系方式和照片统一为示例资料。首轮仅在新建模板时使用新资料；后续原生字段与旧整页记录的兼容升级见下节。

新增文件：

- `magic-resume/src/components/preview/TemplateDocumentPreview.tsx`
- `magic-resume/src/components/templates/detail/`
- `magic-resume/src/config/detailTemplates.json`
- `magic-resume/src/config/templateSeeds.ts`
- `magic-resume/src/lib/templateCatalog.ts`
- `magic-resume/tests/template-library.test.ts`

修改文件：

- `magic-resume/src/app/app/dashboard/resumes/CreateResumeModal.tsx`
- `magic-resume/src/app/app/dashboard/templates/page.tsx`
- `magic-resume/src/components/preview/IframeTemplateViewer.tsx`
- `magic-resume/src/components/shared/TemplateSheet.tsx`
- `magic-resume/src/components/templates/registry.ts`
- `magic-resume/src/config/initialResumeData.ts`
- `magic-resume/src/hooks/useAutoOnePage.ts`
- `magic-resume/src/lib/templatePreview.ts`
- `magic-resume/src/store/useResumeStore.ts`
- `magic-resume/src/types/template.ts`
- `magic-resume/src/utils/resumeLayout.ts`

验证：模板数据与切换回归 6 项通过；生产构建通过；九份模板导出 PDF 分别为 3、3、4、3、2、3、3、3、4 页，并核对 980 个正文段落与标题无遗漏；桌面独立数据回归覆盖编辑、保存、JSON/PDF 导出、导入、复制、删除及重启恢复。


## 2026-10-03：原生字段、独立版式与安全升级

9 份细节模板改为按语义保存和编辑：包含 19 段工作、34 个项目、11 段教育，以及个人优势、能力标签等富文本内容。公司、职位、项目名、角色、学校、专业和日期分别使用原生字段；跨页条目只保存一份正文，并通过分页片段引用。编辑侧栏使用清晰中文栏目名，原稿英文副标题由版式单独展示。原稿没有月份的教育日期保留年份。

每份细节模板分别设置页眉、照片框、字号、行距、栏目装饰与强调样式，记录原稿页面尺寸和可确定的段落位置。FDE 模板保留蓝灰色栏目配色，主题色仍可修改；姓名、邮箱、电话和照片统一为示例资料，不额外添加原稿没有的联系字段。长文、增删内容或模块排序变化时按实际内容排版，不保证编辑后页数不变。

新增安全升级逻辑：未修改正文的旧整页示例，以及仅修改了可唯一对应正文块的记录，可转成原生编辑条目。迁移保留用户姓名、联系方式、照片、主题与排版设置、内联格式和新增模块。段落插删、提取字段变更、页面隐藏或重排、模块 ID 冲突等无法无歧义转换的情况保留完整旧记录，继续使用兼容预览；不覆盖或猜测用户文字。

主要新增或调整（以下代码路径位于 `magic-resume/`）：

- `src/config/detailTemplateContent.json`：结构化正文、原稿分页和位置数据；旧 `detailTemplates.json` 保留用于兼容核对。
- `src/config/templateSeeds.ts`：独立示例副本、原稿排版默认值与统一示例资料。
- `src/components/templates/detail/`：独立版式配置、原生字段渲染、分页映射及旧格式兼容。
- `src/lib/upgradeDetailResume.ts`、`src/store/useResumeStore.ts`：加载与导入时的安全升级。
- `src/types/resume.ts`：原稿分页片段类型。
- `src/components/ui/unified-date-input.tsx`、`src/components/ui/unified-date-range-input.tsx`、`src/components/editor/Field.tsx`、`src/components/editor/education/EducationItem.tsx`：年份原值编辑、日期同步与教育条目标题。
- `src/app/app/dashboard/resumes/ResumeCardItem.tsx`：细节模板卡片直接显示中文模板名称。
- `src/utils/resumeLayout.ts`、`src/utils/export.ts`：原稿页面尺寸与导出分页处理。
- `tests/template-library.test.ts`、`tests/detail-layout.test.ts`、`tests/detail-upgrade.test.ts`：数据、编辑分页与迁移回归。

本轮内容检查将 980 个原始文本块逐一对应到结构化内容，核对正文及提取字段无遗漏，并对全部原始块分别模拟修改：865 个正文块进入对应原生字段，115 个标题或提取字段修改保留旧记录。相关自动化测试覆盖跨页正文、追加内容、模块排序、用户身份与主题保留、原对象不变和不确定修改回退。视觉排版与 PDF 导出另行验证，不将数据测试结果等同于绝对像素一致。

验证结果：19 项数据、分页和迁移测试通过，生产构建通过；9 份模板实际导出共 28 页，865 个正文块均可在导出文本中找到。已逐份对照页眉、栏目和跨页连接，并复核原稿页码。浏览器验证覆盖九份模板换色、公司/岗位/正文编辑、撤销重做、刷新保存、纯年份日期和长图导出；独立桌面测试覆盖原生字段编辑、绿色主题及真实 PDF 导出，导出 PDF 为 3 页并保留全部正文和编辑结果。记录原稿中的短页尺寸用于来源核对，当前预览及导出统一使用 A4、短页底部留白；图片来源无法确定原字体，因此不承诺逐像素一致。
