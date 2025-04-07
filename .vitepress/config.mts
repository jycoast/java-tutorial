import { defineConfig } from 'vitepress'
import nav from './configs/nav'
import sidebar from './configs/sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Java Tutorial',
  description: '',
  lastUpdated: true,
  cleanUrls: true,
  base: '/',
  markdown: {
    math: true,
    headers: {
      level: [1, 6], // 确保解析1-6级标题
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  themeConfig: {
    outline: {
      level: [1, 3], // 支持显示从1级到3级标题
    },
    outlineTitle: '本页目录',
    lastUpdatedText: '上次更新',
    logo: '/logo.svg',
    search: {
      provider: 'local',
    },
    
    // 导航栏
    nav,

    // 侧边栏
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jycoast' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present jiyongchao'
    }
  }
})
