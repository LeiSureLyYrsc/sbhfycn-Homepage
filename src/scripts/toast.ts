import { siteConfig } from '../config';

export class ToastManager {
  static init() {
    if (!document.getElementById('toast-containers')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'toast-containers';
      document.body.appendChild(wrapper);

      ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].forEach(pos => {
        const container = document.createElement('div');
        container.id = `toast-${pos}`;
        
        let yClass = pos.startsWith('top') ? 'top-4' : 'bottom-4';
        let xClass = pos.endsWith('left') ? 'left-4' : pos.endsWith('right') ? 'right-4' : 'left-1/2 -translate-x-1/2';
        let alignClass = pos.endsWith('left') ? 'items-start' : pos.endsWith('right') ? 'items-end' : 'items-center';
        
        container.className = `fixed z-50 flex flex-col gap-2 pointer-events-none ${yClass} ${xClass} ${alignClass}`;
        if (pos.startsWith('bottom')) {
          container.classList.add('justify-end'); // Stack from bottom up
        }
        wrapper.appendChild(container);
      });
    }
  }

  static show(notice: any) {
    if (!notice.message) return;
    this.init();

    const pos = notice.position || 'top-right';
    const container = document.getElementById(`toast-${pos}`);
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto w-max max-w-sm glass-card rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 p-4 flex items-start gap-4 transform transition-all duration-300 opacity-0 translate-y-4';
    
    let iconColor = 'text-blue-500';
    if (notice.type === 'success') iconColor = 'text-emerald-500';
    else if (notice.type === 'warning') iconColor = 'text-amber-500';
    else if (notice.type === 'error') iconColor = 'text-rose-500';

    let iconHtml = notice.icon ? `<i class="${notice.icon} ${iconColor} text-xl mt-0.5"></i>` : '';

    toast.innerHTML = `
      ${iconHtml}
      <div class="flex-1 min-w-0">
        ${notice.title ? `<h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">${notice.title}</h4>` : ''}
        <p class="text-sm text-slate-600 dark:text-slate-300 break-words">${notice.message}</p>
      </div>
      <button class="toast-close text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-2">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    if (pos.startsWith('bottom')) {
      container.prepend(toast); 
    } else {
      container.appendChild(toast);
    }

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
    });

    const removeToast = () => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'scale-95');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close')?.addEventListener('click', removeToast);

    if (notice.duration !== 0) {
      setTimeout(removeToast, notice.duration || 5000);
    }
  }
}

export function initNotices() {
  if (siteConfig.notices && Array.isArray(siteConfig.notices)) {
    siteConfig.notices.forEach(notice => ToastManager.show(notice));
  }
}
