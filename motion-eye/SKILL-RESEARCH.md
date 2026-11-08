# Anti-slop motion skill：市场调研

调研日期：2026-11-08。下面 6 个仓库的原文都 clone 下来读过（不是只看搜索摘要）。

## 现有的动效 skill

| 仓库 | 规模 | 做什么 | 许可 |
|---|---|---|---|
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | 18 个 skill，今天还在更新 | 写动画（animate）、严格评审（review-animations，"十条不可妥协标准"）、全库审计（improve-animations）、删多余动画（remove-animations）、编排、性能、手势、Apple 设计、术语表（animation-vocabulary）、多版本对比原型（prototype） | MIT |
| [LottieFiles/motion-design-skill](https://github.com/lottiefiles/motion-design-skill) | 1 个 skill + 4 份参考 | 通用原则：时长表、曲线、"情绪 → 动效"映射、按品牌性格选参数 | MIT |
| [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) | 1 个 skill，两种模式 | 按 Emil、Jakub Krehel、Jhey Tompkins 三位的视角构建或审计；**审计会专门找 "AI-slop motion"，输出带循环 demo 的 HTML 报告** | MIT |
| [Ferousco-dev/anti-slop-design](https://github.com/Ferousco-dev/anti-slop-design) | 通用反 slop | 其中一章是"动效 slop 分类"：20 种模式（所有元素淡入、`transition: all`、装饰性视差、无限循环、打字机标题、到处撒彩带……） | MIT |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 大型通用设计 skill | 有一个"动效强度"旋钮；**规定"每个页面都要在三个地方动"**，这一点和 Emil、Anthropic 的建议相反 | 见仓库 |
| [anthropics/skills · frontend-design](https://github.com/anthropics/skills) | 官方 | 动效只有一段：每个区块淡入上滑、每张卡片 hover 都有过渡，是"AI 生成"的默认样子；用户操作带来的动效受欢迎 | — |

## 结论

**1. "AI 动效坏习惯清单"已经有人做了，而且做得不错。**Emil 的 review/remove，Kyle 的 anti-checklist，Ferousco 的 20 条，基本覆盖了常见的 AI 动效 slop。再做一份清单，没有差异化。

**2. Emil 本人的 skill 是事实标准。**作者权威、覆盖面广、持续更新、MIT 许可。直接正面竞争没有意义；更好的姿态是兼容它、补它没做的。

**3. 读完原文后，确认还空着的几块：**

| 空白 | 现状 | 证据 |
|---|---|---|
| **训练人的眼光** | 所有 skill 都只给 AI 装规则。Emil 建议人"用慢放、第二天再看"，但没提供练习工具 | 6 个仓库里没有交互练习 |
| **中文** | 只在 Emil 的 break-ui 测试数据里出现中文字符 | 全文检索 CJK 字符 |
| **每条规则标明出处、写出分歧** | Emil 依据个人经验；Ferousco 文末有参考链接，但不是逐条对应；各家互相矛盾的地方（离场 ease-in、"每页必须动"）没人讲清楚 | 逐个读 |
| **在浏览器里实测运行时的动效** | 现有 skill 都是"读代码"。库的默认值（如 Tailwind 的 `transition`、Framer Motion 的默认 spring）在代码里看不到，只有页面跑起来才知道真实时长和曲线 | 检索 `getAnimations`、录屏、逐帧，没有一个 skill 实测 |

最后一条是我的推断：技术上可行（`document.getAnimations()` 能读出页面正在运行的每个动画的真实时长和曲线），但还没有验证效果。

## 可能的定位（待定）

- **A. "Motion Eye" 伴侣 skill**：不重写规则，直接引用 Emil 等人的 skill；只做一件事：AI 每改一处动效，就指向训练网站的对应课程（"这条对应第 7 课：小弹层 150–250ms"），让人和 AI 用同一套语言。
- **B. 浏览器实测审计**：用 Playwright 打开页面、触发交互，读出真实的动效参数，对照有出处的规则打分，生成 A/B 对比（改前/改后）。
- **C. 中文版**：上面任一方向的中英双语版本。

## 注意

- 引用别人的规则可以，但不复制他们的原文。这些仓库都是 MIT，复制需要保留版权声明；更好的做法是链接过去。
- 发布前要在真实项目上试用，证明它比"只装 Emil 的 skill"更好，否则没有理由让人安装。
