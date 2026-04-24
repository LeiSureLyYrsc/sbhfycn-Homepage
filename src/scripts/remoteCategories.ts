import { ToastManager } from './toast';

// Simple SHA-256 Hash implementation using subtle crypto
export async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Define function to render Skeleton Links
export function renderSkeletons(gridElement: Element, linkCount: number) {
  let skeletons = '';
  for (let i = 0; i < linkCount; i++) {
      skeletons += '<div class="glass-card p-4 block h-full animate-pulse transition-all duration-500">' +
        '<div class="flex items-center gap-4 h-full">' +
          '<div class="flex-shrink-0 w-12 h-12 bg-slate-300 dark:bg-slate-700/50 rounded flex items-center justify-center"></div>' +
          '<div class="flex-1 min-w-0 space-y-2">' +
            '<div class="h-4 bg-slate-300 dark:bg-slate-700/50 rounded w-3/4"></div>' +
            '<div class="h-3 bg-slate-200 dark:bg-slate-700/30 rounded w-full"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  gridElement.innerHTML = skeletons;
}

// Render actual NavCards based on returned data
export function renderLinks(gridElement: Element, links: any[]) {
  let html = '';
  links.forEach((link: any) => {
      let iconHtml = '';
      if (link.icon || link.pic || link.fa) {
        let innerIcon = '';
        if (link.pic) {
          innerIcon = '<img src="' + link.pic + '" alt="' + link.title + '" class="w-full h-full object-cover rounded" />';
        } else if (link.fa) {
          innerIcon = '<i class="' + link.fa + '"></i>';
        } else {
          innerIcon = link.icon;
        }
        iconHtml = '<div class="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl text-slate-700 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300 overflow-hidden">' + innerIcon + '</div>';
      }
      
      let descHtml = link.description ? '<p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">' + link.description + '</p>' : '';

      html += '<div class="transition-all duration-500 h-full">' +
        '<a href="' + link.url + '" target="_blank" rel="noopener noreferrer" class="glass-card p-4 block h-full group transition-all duration-500 ease-out">' +
          '<div class="flex items-center gap-4 h-full">' +
            iconHtml +
            '<div class="flex-1 min-w-0">' +
              '<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">' +
                link.title +
              '</h3>' +
              descHtml +
            '</div>' +
          '</div>' +
        '</a>' +
      '</div>';
  });
  gridElement.innerHTML = html;
}

// Render Password Overlay Screen
export function renderLockOverlay(container: Element, gridElement: Element, challenge: string, uri: string) {
  const overlay = document.createElement('div');
  overlay.className = "absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-slate-900/40 rounded-xl transition-all duration-500";
  
  const uid = challenge.substring(0,6);
  overlay.innerHTML = '<div class="flex flex-col items-center justify-center w-full px-4">' +
      '<div class="flex flex-row items-center w-full max-w-md gap-3 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border-2 border-white/50 dark:border-slate-600/50 shadow-lg backdrop-blur-md transition-all">' +
          '<i class="fa-solid fa-lock text-xl text-slate-700 dark:text-slate-300 pl-2"></i>' +
          '<input type="password" id="pwd-' + uid + '" placeholder="该分类受密码保护..." class="flex-1 w-full bg-transparent px-1 py-1 text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-500 dark:placeholder-slate-400" />' +
          '<button id="btn-' + uid + '" class="px-4 md:px-5 py-1.5 md:py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm">' +
            '提交解锁' +
          '</button>' +
      '</div>' +
    '</div>';

  container.appendChild(overlay);

  const btn = overlay.querySelector('#btn-' + uid);
  const input = overlay.querySelector('#pwd-' + uid) as HTMLInputElement;

  btn?.addEventListener('click', async () => {
    const pwd = input?.value || '';
    if (!pwd) return;
    
    const pwdHash = await sha256(challenge + pwd);
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i>';

    try {
      const res = await fetch(uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge, hash: pwdHash })
      });

      if (res.status === 429) {
        ToastManager.show({
          title: "被后端服务器拉黑",
          message: "您的请求过于频繁，已被远程服务器暂时拉黑，请稍后再试",
          type: "warning",
          icon: "fa-solid fa-hand",
          position: "top-right",
          duration: 4000
        });
        btn.innerHTML = '提交解锁';
        return;
      }

      const data = await res.json();
      
      if (data.status === 'success' && data.links) {
        overlay.style.opacity = '0';
        container.classList.remove('min-h-[100px]');
        setTimeout(() => overlay.remove(), 500);
        renderLinks(gridElement, data.links);
        ToastManager.show({
          title: "解锁成功",
          message: "已成功获取远程链接配置",
          type: "success",
          icon: "fa-solid fa-check-circle",
          position: "top-right",
          duration: 3000
        });
      } else {
        btn.innerHTML = '提交解锁';
        ToastManager.show({
          title: "验证失败",
          message: data.message || "密码错误或验证超时",
          type: "error",
          icon: "fa-solid fa-triangle-exclamation",
          position: "top-right",
          duration: 4000
        });
      }
    } catch (err) {
      btn.innerHTML = '提交解锁';
      ToastManager.show({
          title: "网络错误",
          message: "请求远端服务器配置失败",
          type: "error",
          icon: "fa-solid fa-wifi",
          position: "top-right",
          duration: 4000
      });
    }
  });

  input?.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
          btn?.dispatchEvent(new Event('click'));
      }
  });
}