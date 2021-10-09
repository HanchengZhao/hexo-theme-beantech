---
title: Dan Abramov在 SED的采访
catalog: true
date: 2019-05-17 16:26:33
subtitle:
header-img: https://miro.medium.com/max/2000/1*HSisLuifMO6KbLfPOKtLow.jpeg
tags:
  - React
  - podcast
  - Software Engineering Daily
---

![dan](https://miro.medium.com/max/3150/1*xxVEfOOAmIKHWOUloRKLhw.jpeg)

Facebook 访谈系列终于请到 Dan Abramov, 我记得上次听到他上 Software Engineering Daily的时候还是以 Redux作者的身份，貌似那时还只是 React社区的活跃成员，结尾聊到说可能下一步计划是加入一家大公司吧，果然没多久就去了 Facebook。

那时对他的印象就是非常的谦逊，而且解释起很多问题非常的详尽明白，这也能从他后来的个人博客 Overreacted.io风格看的出来。同时让我极度佩服的一点是，不管别人在 github issue上怎么样尖酸刻薄地评论和揶揄，他都能很心平气和地解释，这和很多技术大牛的盛气凌人形成鲜明反差。当然他在podcast里也提到了其实这在初期对他自己的生活产生了很大困扰，因为那时候老是想在社交平台上去和人argue，导致睡眠都不好，于是后来晚上强迫自己不用社交软件, 不带公司电脑回家。另外他聊到他今年也不像年轻时候那样冲动，毕竟都 26 了。。（我一直以为他 30 多了，果然大牛都是年少成名）。以下是他聊到几个我觉得比较有意思点，摘录了一下。

### 是何契机开始用 React?

Dan当时是在一家 Startup 工作，当时本来是要开发一个 iPad 应用，但是后来准备开发 Web 版本，然后需要写一个复杂的单页应用。他试了像 Backbone 这样的框架都发现限制很大，在同事的推荐下用 React 写了一个 like button 然后感觉越用越顺手，开始用 React 重写整个应用。当时他感觉 React 给他带来的工作效率之高使得他可以边重写边发布新功能，这差不多是 2014 年的事。那时候社区工具很不完善，像React-router这样的库都还没有，所以他自己为了解决自己的问题创建了好多库，而正好 React 生态也慢慢开始活跃，他也就受到了很多关注。之后他在 15 年就选择加入了 Facebook。

### React的发展也是个 dogfooding 的过程

人们想到 Facebook 可能最先想到 Newsfeed, 但是当初 Jordan 创造 React 时候是因为要做 Ads, 因为整个前端极其复杂，里面有相当多的表单串联，验证，预览，下拉菜单以及地图。当时 React 被创造出来就是为了解决这些问题，然后才慢慢地被 UI 的其它部分所采用。现在 Facebook 内部如果包括 React Native有大概十万个 React 组件，所以如果他们要做 API 的改动，最先影响的肯定是他们自己，这也是为什么 React 长期保持相对稳定的原因。（也许这也是为什么这么多人喜欢用有大厂背书的库的原因，然而大厂背书也不一定稳定啊，google就是很好的例子）

### Sebastian Markbåge的迷弟

Dan 提到了两个人，算是 React 的 Visionary，早期是 Jordan，现在就是 Sebastian （记得他在demo React hooks 的时候也说自己只是个 Demo guy，一切的想法都是Sebastian提出来的）。听完podcast的感觉就是 Dan 是Sebastian的超级迷弟。比如主持人问Dan什么时候选择尊重前人的经验，什么时候又要抛弃所谓的"best practices"，他说 "I try to listen to what Sebastian says." 他提到Sebastian一直都会想更长远以及更底层的问题，比如看到社区里的一些解决方案后会思考，“为什么是这么做的？为什么要这样去解决这个问题？为什么这会是一个问题？”，同时他会把自己关于对计算机底层和浏览器的工作原理的理解结合起来，从一个更高的层面去想问题。像 React 16对于底层的重写和hooks API的诞生都是这样。

### 大公司里的开源项目

Dan 这里同时提到了 Flow 和 React Native 两个项目。大公司的开源项目往往侧重点会不一样，比如他们会把解决内部的问题放在第一位。像 Flow，很多人会觉得他们没有倾听社区的反馈，但实际上并不是他们不关心，而是 FB 内部使用 Flow 的规模在疯狂增长，远超出其性能改进所能应对的程度。所以他们只能花大量的时间先将 Flow scale到 FB 代码库规模的程度。（当然侧面也说明了 Flow 性能确实不行，被 TS 取代也是很正常的Image）。而 React Native 是因为它的surface area比 React 要多很多，而且和内部测试基建结合得相当紧密，即使过了 CI 也有可能break内部产品，所以也就没法像 React那样做到github优先发布的流程。

### Where do you see React in five years?

（好熟悉的behavior question). 首先 Dan 觉得很难讲，因为很多点子都是之前没法预见的，比如hooks API,其实就是Sebastian几个月前突然想到的。不过他提到几个方向应该会涉及，一个就是 Data fetching, 目前 React 库自身并不提供任何功能。很多人会把 React 看成一个 view library, 但是如果将它看成是一个 User interface library, 那么中间等待的过程，以及如何将它展现给用户其实都是和 UI 相关的。很多之前谈过的feature比如suspense，time slicing 都会成为react 稳定api的一部分。另外关于手势操作，动画处理，抽象出为所有设备提供 UI 的共通层都会是未来考虑的一部分。

### 听完想法

使用一个工具和创造一个工具看待问题的视角是很不一样的，这也是了解底层实现原理的重要性所在。好像目前很多工具的诞生都是某些程序员为了解决自己的一些痛点，然后发现这也是大家的痛点从而被推广开的。尤雨溪之前谈到 Vue 诞生也是为了满足他自己快速迭代开发的需求而诞生的。Dan 这集里其实讲到的细节并不多，更多是high level的讲，具体的东西写在了他的博客里，值得到时候逐片做个摘要。另外发现像这样能洋洋洒洒地给别人讲明白一个东西也是一种能力，不然为什么 Dan 是 React 的门面担当而不是Sebastian。