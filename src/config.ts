export interface LinkData {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  pic?: string;
  fa?: string;
}

export interface Category {
  name: string;
  maxItemsPerRow?: number; // 特定分类的每行最多显示数量，如果不填则默认使用全局默认值
  links: LinkData[];
}

export const siteConfig = {
  siteTitle: "Murasame's Homepage",
  faviconUrl: "/avatar.jpg", // 在这里修改您的网站图标（favicon）链接
  backgroundUrl: "/static/Murasame.jpg", // 在这里修改您的自定义背景图链接
  footer: "Powered by <a href='https://github.com/LeiSureLyYrsc' target='_blank'>MurasameNoa</a> | © 2026<br> <a href='https://beian.miit.gov.cn/' target='_blank'>鄂ICP备2015120188号-3</a>", // 配置底层页脚支持正常HTML语法
  footerIsFixed: false, // 页脚是否常驻悬浮于底部。设为 true 时固定悬浮，设为 false 时随页面滚动到底部显示
  blurConfig: {
    glassBlur: "24px", // 毛玻璃卡片的模糊度
    bgBlur: "24px", // 背景层的模糊度
    bgScale: "1.05", // 背景层抗白边的放大比例
    enableHoverZoom: true, // 是否开启鼠标悬停时的背景放大动画
    hoverZoomScale: "1.3", // 鼠标悬停时的背景放大比例
    hoverZoomDelay: 300, // 鼠标悬停放大动画的触发延迟时间(毫秒)
    bgDrift: true, // 是否开启背景图的缓慢漂浮动画
    showToggle: true, // 是否在左侧个人介绍显示模糊开关
    defaultEnabled: true, // 页面默认是否开启模糊
  },
  profile: {
    avatarUrl: "/avatar.jpg",
    names: ["Murasame", "丛雨", "ムラサメ"], // 名字，支持打字机滚动效果显示多个
    typewriterName: true, // 是否开启名字的打字机滚动效果
    roles: ["Ciallo～(∠・ω< )⌒★", "柚子厨", "最爱丛雨"], // 身份描述
    typewriterRole: true, // 是否开启身份描述的打字机滚动效果
    typewriterCursor: "_", // 打字机光标形状，默认为下划线
    bio: "我已经下了决心，要与深爱的少女一起在这片土地生活下去。我对此无比自豪。"
  },
  socialLinks: [
    {
      name: "GitHub",
      url: "https://github.com/LeiSureLyYrsc",
      fa: "fa-brands fa-github text-2xl"
    },
    {
      name: "Email",
      url: "mailto:contact@sbhfy.cn",
      fa: "fa-solid fa-envelope text-xl"
    }
  ],
  internalLinks: [
    { name: "另一个主页", url: "https://shirayukinoa.top", fa: "fa-solid fa-house" },
    { name: "我的博客", url: "https://blog.shirayukinoa.top", fa: "fa-solid fa-pen-nib" }
  ],
  categories: [
    {
      name: "俺自己的服务",
      maxItemsPerRow: 2,
      links: [
        { title: "Murasame's Sharepoint", url: "https://share.shirayukinoa.top", description: "基于 Openlist 的云盘服务", fa: "fa-solid fa-cloud" },
        { title: "Murasame's SSO", url: "https://sso.shirayukinoa.top", description: "基于 Authentik 的单点认证服务", fa: "fa-solid fa-key" },
      ]
    },
    {
      name: "常用工具",
      links: [
        { title: "Deepseek", url: "https://chat.deepseek.com", description: "探索未至之境", fa: "fa-solid fa-brain" },
        { title: "GitHub", url: "https://github.com", description: "全球最大的开源社区", fa: "fa-brands fa-github" },
        { title: "Vercel", url: "https://vercel.com", description: "优秀的静态网站托管平台", fa: "fa-solid fa-bolt" },
        { title: "Cloudflare", url: "https://cloudflare.com", description: "CDN与全能服务", fa: "fa-brands fa-cloudflare" }
      ]
    },
    {
      name: "设计 & 开发",
      links: [
        { title: "Astro", url: "https://astro.build", description: "极致性能的前端框架", fa: "fa-solid fa-rocket" },
        { title: "Tailwind CSS", url: "https://tailwindcss.com", description: "原子化 CSS 框架", fa: "fa-brands fa-css3-alt" }
      ]
    }
  ]
};
