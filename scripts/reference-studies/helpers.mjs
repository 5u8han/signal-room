export function mark(id,title,detail,section=false){const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');return`id="${escape(id)}" data-study="${escape(title)}" data-design="${escape(detail)}"${section?' data-kind="section"':''}`}
export const arrow='<span class="study-arrow" aria-hidden="true">↗</span>';
