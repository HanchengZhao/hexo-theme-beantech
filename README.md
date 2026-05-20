> Ported Theme of [Hux Blog](https://github.com/Huxpro/huxpro.github.io), Thank [Huxpro](https://github.com/Huxpro) for designing such a flawless theme.
> 
> This BeanTech theme created by [YuHsuan](http://beantech.org) modified from the original Porter [Kaijun](http://kaijun.rocks/hexo-theme-huxblog/)

# [Live Demo](http://beantech.org)
![BeanTech Desktop](http://beantech.org/img/beantech-desktop.png)

# Usage

```bash
git clone https://github.com/YenYuHsuan/hexo-theme-beantech.git ./hexo-beantech
cd hexo-beantech
npm install
```

## Configuration

Edit `_config.yml` with your own info.

### Deployment
```yml
deploy:
  type: git
  repo: https://github.com/<yourAccount>/<repo>
  branch: <your-branch>
```

### Sidebar
```yml
sidebar: true
sidebar-about-description: "<your description>"
sidebar-avatar: img/<your avatar path>
widgets:
  - featured-tags
  - short-about
  - recent-posts
  - friends-blog
  - archive
  - category
```

### Post tags on homepage
```yml
home_posts_tag: true   # show post tags below each preview
```

# Features

## 🌙 Dark Mode

Click the moon/sun icon in the top-right navigation bar to toggle dark mode. The preference is saved in `localStorage` and persists across visits. The theme also respects your OS-level `prefers-color-scheme` setting by default.

![Dark Mode Toggle](http://beantech.org/img/beantech-desktop.png)

## 🌐 On-Device AI Translation

Powered by Google Chrome's built-in Gemini Nano model. Click the globe icon in the navigation bar to translate page content — no data leaves your machine.

### Setup

1. Open `chrome://flags/#translation-api`
2. Set **Translation API** to **Enabled**
3. Relaunch Chrome

### Usage

- Click the **globe icon** (🌐) in the top-right navbar to open the language dropdown
- Select a target language: English, 简体中文, 日本語, Español, Français, Deutsch
- The page content will be translated via on-device AI
- Your language preference is saved — it automatically applies when navigating between pages
- Click **Show Original** to restore the source text

> **Note:** Currently supported in desktop versions of Google Chrome with the Translation API flag enabled.

# Hexo Basics

```bash
hexo new post "<post name>"
hexo clean && hexo generate   # build static files
hexo server                   # local preview
hexo deploy                   # deploy to your repo
```

# Credits

- [Hux Blog](https://github.com/Huxpro/huxpro.github.io) — original design
- [Kaijun](http://kaijun.rocks/hexo-theme-huxblog/) — original Hexo port
- [YuHsuan](http://beantech.org) — BeanTech theme

Please [Star](https://github.com/HanchengZhao/hexo-theme-beantech) this project if you like it! [Follow](https://github.com/HanchengZhao) would also be appreciated!
Peace!
