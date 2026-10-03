export const DETAIL_TEMPLATE_CSS = `
  .detail-v2 { width: calc(100% + 2 * var(--detail-page-padding)); margin: calc(-1 * var(--detail-page-padding)); overflow-wrap: anywhere; }
  .detail-v2 * { box-sizing: border-box; }
  .detail-v2 [data-detail-page] { position: relative; overflow: visible; padding: var(--detail-page-padding) var(--detail-page-padding) 0; }
  .detail-v2 [data-detail-page-body] { display: flow-root; position: relative; }
  .detail-v2 [data-detail-page] + [data-detail-page] { break-before: page; page-break-before: always; }
  .detail-v2 .detail-v2-header { display: grid; column-gap: 20px; margin-bottom: 20px; break-inside: avoid; }
  .detail-v2 .detail-v2-photo { grid-area: photo; object-fit: cover; display: block; max-width: 100%; }
  .detail-v2 .detail-v2-identity { grid-area: identity; min-width: 0; }
  .detail-v2 .detail-v2-header-details { grid-area: details; min-width: 0; }
  .detail-v2 .detail-v2-name { color: var(--detail-accent); font-size: var(--detail-name-size); font-weight: 700; line-height: 1.15; margin: 0 0 10px; }
  .detail-v2 .detail-v2-target { font-size: var(--detail-title-size); line-height: 1.45; margin: 0 0 8px; }
  .detail-v2 .detail-v2-kicker { color: #bcbcbc; font-size: 12px; margin: 0 0 32px; }
  .detail-v2 .detail-v2-contact { display: flex; flex-wrap: wrap; gap: 7px 20px; font-size: 1em; }
  .detail-v2 .detail-v2-field { display: inline-flex; align-items: baseline; gap: 3px; min-width: 0; }
  .detail-v2 .detail-v2-field-icon { flex-shrink: 0; align-self: center; color: var(--detail-accent); }
  .detail-v2 .detail-v2-field-label { display: none; white-space: nowrap; }
  .detail-v2 .detail-v2-header-education { display: flex; flex-wrap: wrap; gap: 0 10px; margin-top: 12px; }
  .detail-v2 .detail-v2-header-skills { margin-top: 10px; font-size: 0.95em; }
  .detail-v2 .detail-v2-header-portrait-right { grid-template-areas: "identity photo" "details photo"; grid-template-columns: 1fr auto; align-items: start; }
  .detail-v2 .detail-v2-header-portrait-left,
  .detail-v2 .detail-v2-header-operations { grid-template-areas: "photo identity" "photo details"; grid-template-columns: auto 1fr; column-gap: 36px; align-items: start; }
  .detail-v2 .detail-v2-header-compact-grid { grid-template-areas: "photo identity details"; grid-template-columns: auto minmax(90px, 1fr) minmax(240px, 1.9fr); align-items: center; gap: 14px; margin-bottom: 12px; }
  .detail-v2 .detail-v2-header-compact-grid .detail-v2-contact { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
  .detail-v2 .detail-v2-header-compact-grid .detail-v2-name { margin-bottom: 8px; }
  .detail-v2 .detail-v2-header-insurance { grid-template-areas: "identity photo" "details photo"; grid-template-columns: 1fr auto; column-gap: 30px; margin-bottom: 20px; }
  .detail-v2 .detail-v2-header-insurance .detail-v2-contact { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 15px; }
  .detail-v2 .detail-v2-header-insurance .detail-v2-field-icon { display: none; }
  .detail-v2 .detail-v2-header-insurance .detail-v2-field-label { display: inline; }
  .detail-v2 .detail-v2-mark { display: flex; gap: 3px; height: 10px; margin: 0 0 13px; }
  .detail-v2 .detail-v2-mark i { width: 33px; background: var(--detail-accent); }
  .detail-v2 .detail-v2-mark i + i { width: 4px; }
  .detail-v2 .detail-v2-section-title { display: flex; align-items: baseline; gap: 7px; font-size: var(--detail-heading-size); font-weight: 700; line-height: 1.4; margin: var(--detail-section-gap) 0 8px; color: var(--detail-accent); position: relative; break-after: avoid; }
  .detail-v2 .detail-v2-english { color: #aaa; font-size: 0.94em; font-weight: 400; }
  .detail-v2 .detail-v2-heading-underline { border-bottom: 1px solid var(--detail-accent); padding-bottom: 7px; }
  .detail-v2 .detail-v2-heading-tab-line { border-bottom: 1.333px solid var(--detail-accent); padding-bottom: 9px; margin-bottom: 20px; }
  .detail-v2 .detail-v2-heading-tab-line::after { content: ""; position: absolute; bottom: -1.333px; left: 0; width: 164px; height: 4px; background: var(--detail-accent); }
  .detail-v2 .detail-v2-heading-gray-band,
  .detail-v2 .detail-v2-heading-bar-band { background: #eeeff1; border-left: 3px solid var(--detail-accent); padding: 3px 8px; }
  .detail-v2 .detail-v2-heading-icon-line { border-bottom: 1px solid #c8c8c8; padding: 0 0 5px 10px; font-weight: 400; }
  .detail-v2 .detail-v2-section-icon { position: absolute; left: -28px; top: 0; width: 27px; height: 27px; border: 1px solid var(--detail-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--detail-accent); }
  .detail-v2 .detail-v2-fragment { display: flow-root; }
  .detail-v2 .detail-v2-fragment:first-child .detail-v2-section-title { margin-top: 0; }
  .detail-v2 .detail-v2-header + .detail-v2-fragment .detail-v2-section-title { margin-top: 0; }
  .detail-v2 .detail-v2-entry-header { display: grid; grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto; align-items: baseline; gap: 6px 18px; font-size: var(--detail-item-title-size); line-height: 1.45; margin: 10px 0 6px; break-inside: avoid; break-after: avoid; }
  .detail-v2 .detail-v2-entry-primary { color: var(--detail-accent); font-weight: 700; }
  .detail-v2 .detail-v2-entry-secondary { font-weight: 400; }
  .detail-v2 .detail-v2-entry-date { text-align: right; color: #777; white-space: nowrap; font-size: 0.86em; }
  .detail-v2[data-detail-item-order="role-company-date"] .detail-v2-entry-header[data-entry-section="experience"] { grid-template-columns: auto 1fr auto; }
  .detail-v2[data-detail-item-order="role-company-date"] .detail-v2-entry-header[data-entry-section="experience"] .detail-v2-entry-secondary { order: -1; color: var(--detail-accent); font-weight: 700; }
  .detail-v2[data-detail-item-order="role-company-date"] .detail-v2-entry-header[data-entry-section="experience"] .detail-v2-entry-primary { font-weight: 400; color: inherit; font-size: 0.833333em; }
  .detail-v2[data-detail-item-order="date-company-role"] .detail-v2-entry-header { grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .detail-v2[data-detail-item-order="date-company-role"] .detail-v2-entry-date { order: -1; text-align: left; color: var(--detail-accent); font-weight: 700; font-size: 1em; }
  .detail-v2 .detail-v2-education-inline { display: flex; flex-wrap: wrap; gap: 4px; margin: 0; font-size: 1em; font-weight: 400; }
  .detail-v2 .detail-v2-education-inline .detail-v2-entry-primary { color: inherit; font-weight: inherit; }
  .detail-v2 .detail-v2-education-inline .detail-v2-entry-date { display: none; }
  .detail-v2 .detail-v2-rich { line-height: inherit; }
  .detail-v2 .detail-v2-rich p { margin: 0 0 var(--detail-paragraph-gap); line-height: inherit; }
  .detail-v2 .detail-v2-rich h1,
  .detail-v2 .detail-v2-rich h2 { font-weight: 700; font-size: var(--detail-heading-size); color: var(--detail-accent); border-bottom: 1px solid var(--detail-accent); margin: 15px 0 8px; padding-bottom: 5px; break-after: avoid; }
  .detail-v2 .detail-v2-rich h3,
  .detail-v2 .detail-v2-rich h4 { font-weight: 600; font-size: 1em; margin: 10px 0 8px; break-after: avoid; }
  .detail-v2 .detail-v2-rich > :first-child { margin-top: 0; }
  .detail-v2 .detail-v2-rich strong { font-weight: 700; }
  .detail-v2 .detail-v2-rich ul,
  .detail-v2 .detail-v2-rich ol { padding-left: 1.4em; margin: 0 0 7px; }
  .detail-v2 .detail-v2-rich ul { list-style: disc; }
  .detail-v2 .detail-v2-rich ol { list-style: decimal; }
  .detail-v2 .detail-v2-rich li { margin: 0; }
  .detail-v2 .detail-v2-rich blockquote { border-left: 2px solid var(--detail-accent); margin: 7px 0; padding-left: 10px; }
  .detail-v2 .detail-v2-rich table { width: 100%; border-collapse: collapse; }
  .detail-v2 .detail-v2-rich td,
  .detail-v2 .detail-v2-rich th { border: 1px solid #ccc; padding: 3px 6px; }
  .detail-v2 .detail-v2-rich img { max-width: 100%; height: auto; }
  .detail-v2 .detail-v2-certificates { display: flex; flex-wrap: wrap; gap: 8px; }
  .detail-v2 .detail-v2-page-number { position: absolute; bottom: auto; right: auto; color: #777; line-height: 1; transform: translateX(-50%); }
  .detail-v2 .detail-v2-page-number-right { right: auto; }
  .detail-v2 .detail-v2-page-number-center { left: 50%; transform: translateX(-50%); }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-header { margin-top: -10.667px; margin-bottom: 25px; min-height: 176px; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-header-details { align-self: end; padding-bottom: 8px; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-contact { font-size: 12px; gap: 7px 20px; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-field-icon { color: #bababa; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-rich h4 { font-size: 10.667px; font-weight: 700; margin: 17px 0 13px; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-entry-header[data-entry-section="projects"] { font-size: 13.333px; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-entry-header[data-entry-section="projects"] .detail-v2-entry-date { font-size: 9.333px; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-header { margin-bottom: 31px; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-target { margin-bottom: 10px; }
  .detail-v2[data-detail-layout="detail-product-practice"] [data-resume-section-id="selfEvaluation"] .detail-v2-rich { line-height: 1.6; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-rich h4,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-rich h4 { color: #999; margin: 16px 0 13px; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-entry-date,
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-entry-date,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-entry-date { font-weight: 700; font-style: italic; letter-spacing: -0.4px; color: var(--detail-accent); font-size: 1em; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-entry-header[data-entry-section="projects"] .detail-v2-entry-secondary,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-entry-header[data-entry-section="projects"] .detail-v2-entry-secondary { justify-self: start; font-size: 10.667px; background: var(--detail-accent); color: #fff; border-radius: 9px; padding: 2px 9px; font-weight: 500; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-header-compact-grid { grid-template-columns: auto 1.1fr 2.1fr; gap: 16px; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-field-custom:last-child { grid-column: 1 / -1; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-entry-header { grid-template-columns: 1.4fr 1.3fr auto; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-entry-header { grid-template-columns: 1.6fr 1fr auto; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-entry-primary { font-weight: 500; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-section-title { font-weight: 500; padding-bottom: 1px; margin-bottom: 5px; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-header { min-height: 122.667px; margin-bottom: 12px; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-header { font-size: 12px; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-primary,
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-date { font-weight: 700; }
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-entry-header[data-entry-section="projects"] { background: #edf2f5; padding: 4px 6px; }
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-header { column-gap: 16px; margin-bottom: 8px; }
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-header + [data-resume-section-id="selfEvaluation"] { border-top: 1px solid var(--detail-accent); padding-top: 12px; }
  .detail-v2[data-detail-source-layout="true"] [data-detail-source-y] > .detail-v2-section-title,
  .detail-v2[data-detail-source-layout="true"] [data-detail-source-y] > .detail-v2-entry-header:first-child { margin-top: 0; }
  .detail-v2 .detail-v2-rich .detail-v2-bullet { padding-left: 1.15em; text-indent: -1.15em; }
  .detail-v2 .detail-v2-rich .detail-v2-bullet-continuation { padding-left: 1.15em; }
  .detail-v2[data-detail-layout="detail-product-practice"] [data-resume-section-id="selfEvaluation"] .detail-v2-rich p:has(>strong:first-child):not(:first-child),
  .detail-v2[data-detail-layout="detail-ai-product-master"] [data-resume-section-id="selfEvaluation"] .detail-v2-rich p:has(>strong:first-child):not(:first-child),
  .detail-v2[data-detail-layout="detail-design-operations"] [data-resume-section-id="selfEvaluation"] .detail-v2-rich p:nth-child(2n+3) { margin-top: 10.667px; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-entry-date { font-style: normal; letter-spacing: 0; font-weight: 400; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-rich h4 { color: #999; font-weight: 500; margin: 4px 0; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-rich h4,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-rich h4 { margin: 7px 0 5px; font-weight: 400; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-rich h3,
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-rich h4 { font-weight: 400; margin: 4px 0; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-entry-header { margin: 4px 0; line-height: 1.28; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-section-title { font-weight: 400; letter-spacing: 2px; line-height: 1.2; }
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-section-title { font-weight: 400; line-height: 1.45; padding: 3px 10px; }
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-entry-primary,
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-entry-secondary,
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-entry-date { font-weight: 400; color: inherit; font-size: 1em; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-section-title { padding: 1.6px 10px; line-height: 1.4; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-header { font-size: var(--detail-item-title-size); }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-secondary,
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-date { color: var(--detail-accent); font-weight: 700; font-size: 1em; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-rich { color: #595959; padding-left: 13.333px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-entry-header { padding-left: 13.333px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-entry-header[data-entry-section="projects"] { display: flex; gap: 10px; font-size: 14px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-entry-header[data-entry-section="projects"] .detail-v2-entry-date { order: 0; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-entry-header { grid-template-columns: 18% 64% 18%; gap: 0; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-entry-header { grid-template-columns: 19% 61% 20%; gap: 0; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-entry-header { grid-template-columns: 43% 34% 23%; gap: 0; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-entry-header { grid-template-columns: 22% 53% 25%; gap: 0; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-entry-header { grid-template-columns: 56% 23% 21%; gap: 0; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-entry-header { grid-template-columns: 40% 35% 25%; gap: 0; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-entry-header { grid-template-columns: 34% 34% 32%; gap: 0; }
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-entry-header { grid-template-columns: 35% 44% 21%; gap: 0; }
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-entry-header { grid-template-columns: 40% 37% 23%; gap: 0; }
  .detail-v2 .detail-v2-header .detail-v2-education-inline { display: inline-flex; }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-header,
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-header { grid-template-rows: 78px auto; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-mark { display: none; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-header-education { margin-top: 7px; font-size: 12px; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-header-skills { margin-top: 24px; }
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-header { margin-top: -16.667px; margin-left: -12.96px; }
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-header-education { margin-top: 5px; }
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-header-skills { margin-top: 8px; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-target { font-size: 12px; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-name { font-size: 26px; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-contact { font-size: 10.667px; gap: 5px 12px; }
  .detail-v2[data-detail-layout="detail-mechanical-transition"] .detail-v2-contact { font-size: 10.667px; gap: 6px 12px; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-header { grid-template-areas: "identity details photo"; grid-template-columns: 1fr 1fr auto; }
  .detail-v2[data-detail-layout="detail-graduate-fde"] .detail-v2-contact { flex-direction: column; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-header { margin-top: -13.333px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-contact { gap: 8px 12px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"][data-detail-source-layout="true"] [data-detail-source-page="2"] { padding-right: calc(var(--detail-page-padding) - 17.947px); }
  .detail-v2[data-detail-layout="detail-insurance-transition"][data-detail-source-layout="true"] [data-detail-source-page="3"] { padding-right: calc(var(--detail-page-padding) - 22.827px); }
  .detail-v2[data-detail-layout="detail-insurance-transition"][data-detail-source-layout="true"] [data-detail-source-page]:not([data-detail-source-page="1"]) .detail-v2-rich,
  .detail-v2[data-detail-layout="detail-insurance-transition"][data-detail-source-layout="true"] [data-detail-source-page]:not([data-detail-source-page="1"]) .detail-v2-entry-header { padding-left: 6.493px; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-entry-header,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-entry-header { grid-template-columns: fit-content(60%) minmax(0, 1fr) auto; gap: 0 12px; }
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-entry-header[data-entry-section="projects"] { grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; font-size: 12.667px; }
  .detail-v2[data-detail-layout="detail-civil-transition"] .detail-v2-contact { font-size: 11px; gap: 8px; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-target { font-size: 17.333px; }
  .detail-v2[data-detail-layout="detail-design-transition"] .detail-v2-header-compact-grid { grid-template-columns: auto 1.5fr 2fr; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-contact,
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-contact,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-contact { gap: 4px 12px; font-size: 12px; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-field-custom,
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-field-custom,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-field-custom { order: -1; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-custom-label,
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-custom-label,
  .detail-v2[data-detail-layout="detail-design-operations"] .detail-v2-custom-label { display: none; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] .detail-v2-header-education { gap: 5px 12px; margin-top: 19px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-header { margin-top: -13.333px; grid-template-rows: 92px 1fr; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-identity { padding-top: 0; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-name { margin-top: -2px; margin-bottom: 11px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-header-details { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px 15px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-contact { display: contents; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-field-phone { order: 0; width: 48%; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-field-custom { order: 1; width: 45%; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-header-education { order: 2; margin: 0; width: 48%; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-field-email { order: 3; width: 45%; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-rich h2.detail-v2-inline-section-title { position: relative; display: flex; align-items: baseline; gap: 7px; font-size: 20px; line-height: 1.4; font-weight: 400; border-color: #c8c8c8; padding: 0 0 5px; margin: 0 0 8px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-rich .detail-v2-inline-section-title .detail-v2-english { font-size: 16px; }
  .detail-v2[data-detail-layout="detail-insurance-transition"] .detail-v2-header-skills { order: 4; flex-basis: 100%; }
  .detail-v2[data-detail-layout="detail-insurance-transition"][data-detail-source-layout="true"] [data-detail-source-page="1"] { padding-right: calc(var(--detail-page-padding) - 9.8px); }
  .detail-v2[data-detail-layout="detail-product-practice"] .detail-v2-header-details { padding-top: 12px; }
  .detail-v2[data-detail-layout="detail-ai-product"] .detail-v2-entry-header[data-entry-section="experience"] .detail-v2-entry-secondary { padding-right: 12px; }
  .detail-v2[data-detail-layout="detail-ai-product-master"] [data-resume-item-id="detail-ai-product-master-project-1"] .detail-v2-rich p:nth-child(n+6):nth-child(-n+18) { line-height: 1.6; }
  [data-detail-print-document] .detail-v2 { width: 100%; margin: 0; }
  .detail-v2[data-detail-source-layout="false"] .detail-v2-page-number,
  .detail-v2:has([data-detail-physical-pages]:not([data-detail-physical-pages="1"])) .detail-v2-page-number { display: none !important; }
  @media print {
    .detail-v2 { width: 100%; margin: 0; }
    .detail-v2 [data-detail-page] { min-height: 0 !important; }
    .detail-v2 .detail-v2-page-number { display: block; }
    .detail-v2 .detail-v2-rich p,
    .detail-v2 .detail-v2-rich li { orphans: 1; widows: 1; }
  }
`;
