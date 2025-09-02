import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/js-request-transform/',
  lang: 'zh-CN',
  title: 'js-request-transform',
  description: '一个为前端使用的数据模型转换层/序列化层',
  themeConfig: {
    socialLinks: [
      { 
        icon: {
          svg: '<svg role="img" viewBox="0 0 1024 1024"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z"/></svg>'
        },
        link: 'https://gitee.com/imengyu/js-request-transform'
      },
      { icon: 'github', link: 'https://github.com/imengyu/js-request-transform' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 imengyu.top'
    },
    nav: [
      { text: '教程', link: '/guide/start' },
      { text: 'API 参考', link: '/api/index' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '起步',
          items: [
            { text: '开始之前', link: '/guide/start' },
            { text: '安装', link: '/guide/install' },
            { text: '如何使用', link: '/guide/useage' },
          ]
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          link: '/api/index'
        },
      ]
    },
  },
});