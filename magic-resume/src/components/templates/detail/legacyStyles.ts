/** Included in the document itself so previews, browser print and PDF share it. */
export const DETAIL_TEMPLATE_CSS = `
  .detail-resume { width: 100%; overflow-wrap: anywhere; }
  .detail-resume [data-detail-page] { position: relative; box-sizing: border-box; overflow: visible; }
  .detail-resume [data-detail-page-body] { display: flow-root; box-sizing: border-box; padding-bottom: 20px; }
  .detail-resume [data-detail-page] + [data-detail-page] { break-before: page; page-break-before: always; }
  .detail-resume [data-detail-page] + [data-detail-page]::before { content: ""; position: absolute; top: 0; left: 0; right: 0; border-top: 1px solid #e5e5e5; pointer-events: none; }
  .detail-resume .detail-header { display: flex; align-items: center; gap: 20px; margin: 0 0 18px; break-inside: avoid; }
  .detail-resume .detail-header-right { flex-direction: row-reverse; }
  .detail-resume .detail-header-info { flex: 1; min-width: 0; }
  .detail-resume .detail-name { color: #202020; font-size: 27px; line-height: 1.3; font-weight: 700; margin: 0 0 8px; }
  .detail-resume .detail-job { font-size: 1.15em; font-weight: 600; margin: 0 0 6px; }
  .detail-resume .detail-contact { display: flex; flex-wrap: wrap; column-gap: 16px; row-gap: 4px; }
  .detail-resume .detail-photo { flex-shrink: 0; object-fit: cover; }
  .detail-resume .detail-item + .detail-item { margin-top: var(--detail-section-gap, 12px); }
  .detail-resume .detail-item-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 14px; margin: 0 0 5px; }
  .detail-resume .detail-item-title { font-weight: 700; font-size: 1.12em; color: var(--detail-accent); }
  .detail-resume .detail-item-date { margin-left: auto; color: #666; }
  .detail-resume .detail-rich-text p { margin: 0 0 var(--detail-paragraph-gap, 5px); line-height: inherit; }
  .detail-resume .detail-rich-text p:empty { min-height: 1em; }
  .detail-resume .detail-rich-text h1,
  .detail-resume .detail-rich-text h2 { font-size: 1.18em; font-weight: 700; line-height: 1.45; color: var(--detail-accent); border-bottom: 1px solid currentColor; margin: 12px 0 7px; padding-bottom: 3px; break-after: avoid; }
  .detail-resume .detail-rich-text h3,
  .detail-resume .detail-rich-text h4 { font-size: 1.06em; font-weight: 700; line-height: inherit; margin: 8px 0 4px; break-after: avoid; }
  .detail-resume .detail-rich-text > :first-child { margin-top: 0; }
  .detail-resume .detail-rich-text ul,
  .detail-resume .detail-rich-text ol { margin: 3px 0 7px; padding-left: 1.45em; }
  .detail-resume .detail-rich-text ul { list-style-type: disc; }
  .detail-resume .detail-rich-text ol { list-style-type: decimal; }
  .detail-resume .detail-rich-text li { margin: 0 0 3px; padding: 0; }
  .detail-resume .detail-rich-text li > p { margin-bottom: 3px; }
  .detail-resume .detail-rich-text strong { font-weight: 700; }
  .detail-resume .detail-rich-text table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 6px 0; }
  .detail-resume .detail-rich-text td,
  .detail-resume .detail-rich-text th { padding: 3px 5px; border: 1px solid #d4d4d4; vertical-align: top; }
  .detail-resume .detail-rich-text img { max-width: 100%; height: auto; }
  .detail-resume .detail-rich-text blockquote { border-left: 2px solid #b5b5b5; padding-left: 10px; margin: 6px 0; }
  .detail-resume[data-detail-layout="detail-ai-product"] .detail-name { font-size: 34px; }
  .detail-resume[data-detail-layout="detail-ai-product"] .detail-rich-text h2 { border-bottom-width: 2px; padding-bottom: 7px; }
  .detail-resume[data-detail-layout="detail-graduate-fde"] .detail-rich-text h2 { border: 0; border-left: 3px solid var(--detail-accent); background: color-mix(in srgb, var(--detail-accent) 8%, white); padding: 3px 7px; }
  .detail-resume[data-detail-layout="detail-civil-transition"] .detail-rich-text h2 { border-left: 2px solid var(--detail-accent); padding-left: 6px; }
  .detail-resume .detail-page-number { position: absolute; bottom: 6px; left: 0; right: 0; text-align: center; color: #8a8a8a; font-size: 9px; pointer-events: none; }
  @media print {
    .detail-resume [data-detail-page] { min-height: 0 !important; }
    .detail-resume [data-detail-page]::before { display: none; }
    .detail-resume .detail-page-number { display: none; }
    .detail-resume .detail-rich-text p,
    .detail-resume .detail-rich-text li { orphans: 1; widows: 1; }
  }
`;
