const { ipcRenderer } = require('electron');
// The renderer gets no Node API or arbitrary IPC bridge.
window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.nativeGlass = 'true';
  let scheduled = false, last = '', watched = new Set();
  ipcRenderer.on('glass:refresh', () => { last = ''; schedule(); });
  const resize = new ResizeObserver(schedule);
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const elements = [...document.querySelectorAll('[data-glass-surface]')];
      for (const element of watched) if (!elements.includes(element)) { resize.unobserve(element); watched.delete(element); }
      for (const element of elements) if (!watched.has(element)) { watched.add(element); resize.observe(element); }
      const rects = elements.slice(0,8).map(element => {
        const r = element.getBoundingClientRect();
        const kind = element.classList.contains('glass-workspace') ? 'workspace' : element.classList.contains('glass-rail') ? 'rail' : element.classList.contains('glass-statusbar') ? 'footer' : '';
        return {x:r.x,y:r.y,width:r.width,height:r.height,radius:parseFloat(getComputedStyle(element).borderRadius)||0,kind};
      });
      const layout = { rects, viewport: { width: innerWidth, height: innerHeight } };
      const encoded=JSON.stringify(layout);
      if (encoded!==last) {last=encoded; ipcRenderer.send('glass:layout',layout);}
    });
  }
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('resize',schedule);
  schedule();
});
