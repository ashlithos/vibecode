# Motion Eye · 动效眼力

A comparison gym for interaction-motion craft: 61 A/B pairs of Web/SaaS components (56 core + 5 advanced), in Chinese and English (toggle at the top). Each pair is the same component twice, differing by one or two parameters. You guess which is better, slow it down, read why, see the easing curve, then fix the weaker version with sliders.

Open `index.html` in a browser (or the published artifact). Keys: `A`/`B` guess · `R` replay · `Q` play A then B · `S` slow-mo ×4 · `←`/`→` navigate. Each lesson has a "where to look" hint, and every reveal lists its sources (checked against the original pages, Nov 2026) or marks the rule as industry consensus.

## 怎么练
猜 → 看哪里 → 轮流播放 + 慢放 → 说出原因、修好它（知觉学习：专家的区别在于知道该看哪里）

## 看任何动效的 6 个问题
1. **目的**：它在解释什么？还是纯装饰？
2. **曲线**：进场在减速吗？屏幕内移动有加减速吗？
3. **时长**：和距离、大小、使用频率相称吗？
4. **空间**：从原因处出现吗？方向符合布局吗？
5. **顺序**：眼睛知道先看哪里吗？有没有人在排队？
6. **手感**：按下有反应吗？可打断吗？松手后像物理世界吗？

## 大纲（9 章 · 56 组基础 + 5 组进阶）

| 章 | 主题 | 课 |
|---|---|---|
| 1 缓动 Easing | 感觉从哪来 | 进场用 ease-out · 内置曲线太软 · 屏幕内移动用 ease-in-out · 循环运动用 linear · 高频菜单不要回弹 · 永久离场可以加速 |
| 2 时长 Duration | 快慢的分寸 | 小弹层 150–250ms · 离场比进场快 · hover 要几乎同步 · 距离越远时间越长 · 越常用越少动 · 页面切换别拖 · **进阶：tooltip 预热** |
| 3 空间 Origin & Space | 从哪来，到哪去 | 从按钮处长出来 · 不要从 scale(0) 开始 · 位移要小 · 从所在的边进来 · 方向跟随导航 · 指示器滑过去 · 贴边的从边上来 |
| 4 编排 Choreography | 先后与节奏 | 列表要错峰 · 错峰不能太长 · 错峰要有上限 · 先有空间再放内容 · 离场一起走 · 重叠不要排队 |
| 5 反馈 Feedback | 手感 | 按下要有反应 · 按下反馈要轻 · hover 是提示不是表演 · 状态变化时尺寸不变 · 先反馈后确认 · 开关要"拨"过去 · 完成值得一个小奖励 · 错误：轻轻摇头 · **进阶：图标原地变形** |
| 6 连续性 Continuity | 不要瞬移 | 展开要有过程 · 删除后让邻居滑过来 · 重排要可追踪 · 跳动的数字要等宽 · 内容替换用交叉淡入 · 骨架 = 内容的形状 · 新来的旧的让位 · **进阶：卡片长成详情页** |
| 7 等待 Waiting | 时间感知 | spinner 要延迟出现 · 出现了就多待一会 · 等待动画要安静 · 进度条让结尾加速 · 骨架屏胜过 spinner · 长等待要说明进展 |
| 8 克制 Restraint | 少即是多 | 页面加载少统一快 · 不变的东西就静止 · 只动 transform 和 opacity · 尊重减弱动态效果 · 一个产品一套动效 · 高频更新不加进场动画 |
| 9 物理 Physics | 手势与弹簧 | 动画必须可打断 · 手势之后用 spring · 边界用阻尼不要硬停 · spring 默认少回弹 · **进阶：用速度判断意图 · 继承松手的速度** |

## Files
- `lessons.js` — the curriculum: chapters, lessons (good/bad params, why, rule), sources, knob definitions. Add a lesson by adding an object here.
- `lessons-i18n.js` — English text for every lesson and chapter, plus the "where to look" hints in both languages.
- `demos.js` — 34 reusable demo components (dropdown, tabs, modal, toast, list, drag…), driven by params.
- `engine.js` — easing math (cubic-bezier, spring → CSS `linear()`), per-stage animation context, FLIP, simulated cursor.
- `app.js` — routing, guess/reveal/lab flow, progress (stored only in your browser).
