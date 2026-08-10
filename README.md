# 今天吃什么 — 库存 + 食谱匹配 + 购物清单

一个单人使用、本地优先的网页应用：记录 pantry/冰箱库存并自动估算克数，基于库存推荐能做的菜，粘贴/贴链接食谱自动匹配缺什么，最后按每周计划生成购物清单。

## 当前 MVP 范围

- ✅ 库存录入：一句自然语言描述（如"五包海苔"）自动解析出名称/数量/估算克数，确认后保存；支持按 pantry/冰箱/冷冻室分组、保质期字段（手动录入）。
- ✅ 内置约 30 条常见中式食材换算表 + 同义词词典（如 生抽≈酱油、海苔≈紫菜）。
- ✅ 内置 10 道起步食谱，首页根据当前库存自动推荐：能做 / 缺一点调料没关系 / 缺得比较多（高亮）。
- 🚧 后续阶段（见 `/root/.claude/plans/plan-solution-1-dreamy-eagle.md`）：粘贴/链接录入自定义食谱、拍照/条码录入库存、每周计划与购物清单生成。

## 开发

```bash
npm install
mkdir -p data
npm run db:push   # 把 lib/db/schema.ts 的 schema 同步到本地 SQLite（data/app.db）
npm run db:seed   # 灌入起步食材词典 + 起步食谱
npm run dev        # http://localhost:3000
```

其他常用命令：

```bash
npm test            # 跑 lib/food-engine 的单元测试（解析器/词典匹配/克数估算/匹配分档）
npx tsc --noEmit     # 类型检查
npx eslint .         # lint
npm run build        # 生产构建
```

## 核心目录

- `lib/food-engine/` — 离线、确定性的核心引擎：文本解析（`parser.ts`）、同义词模糊匹配（`dictionary.ts`）、克数估算（`quantity.ts`）、库存↔食谱匹配与分档（`match.ts`）、批量推荐（`suggest.ts`）。
- `lib/db/schema.ts` — Drizzle schema（食材词典、库存、食谱、每周计划）。
- `lib/seed/` — 起步食材换算表和起步食谱数据 + 灌入脚本。
- `app/inventory/` — 库存录入/管理页面。
- `app/page.tsx` — 首页推荐仪表盘。

## 持久化说明

数据存在本地 SQLite 文件（`data/app.db`，已加入 `.gitignore`），适合 `npm run dev`/`npm run start` 在本机或小型自托管服务器上跑。这在 Vercel 这类无状态 serverless 平台上不持久，如果以后需要多端访问，可以迁移到 Turso/libSQL 或 Postgres（与 Drizzle 基本无缝切换）。
