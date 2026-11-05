/* Resolve the browser-local theme before styles paint. No network or account state. */
(()=>{
  let preference='system';
  try{const stored=localStorage.getItem('sub-theme'),saved=stored==='dusk'?'evening':stored;if(['dark','light','evening'].includes(saved))preference=saved}catch{}
  const theme=preference==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):preference;
  document.documentElement.dataset.theme=theme;
  document.documentElement.dataset.themePreference=preference;
  document.documentElement.dataset.preferredTheme=theme;
  document.documentElement.style.colorScheme=theme==='dark'?'dark':'light';
})();
