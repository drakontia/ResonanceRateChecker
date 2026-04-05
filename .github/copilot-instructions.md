# Resonance Rate Checker — Copilot Coding Agent Instructions

## このドキュメントについて

- この文書は GitHub Copilot Coding Agent が本リポジトリで安全かつ正確に開発タスクを実施するための実務ガイドです。
- 現行コードベース（Next.js 16 / TypeScript / Tailwind v4）に沿った運用ルールを示しています。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。

## 前提条件

- 回答は必ず日本語でしてください。
- コードの変更をする際、変更量が200行を超える可能性が高い場合は、事前に「この指示では変更量が200行を超える可能性がありますが、実行しますか?」とユーザーに確認をとるようにしてください。
- 何か大きい変更を加える場合、まず何をするのか計画を立てた上で、ユーザーに「このような計画で進めようと思います。」と提案してください。この時、ユーザーから計画の修正を求められた場合は計画を修正して、再提案をしてください。

## 目的 / スコープ
- ゲーム「レゾナンス：無限号列車」の相場チェック Web アプリ（`resonance-trade-center`）の機能追加・改善・バグ修正。
- 仕様への準拠、型安全、UI/UX一貫性の維持。
- 変更は最小限で、既存挙動・公開 API を壊さない。

## 技術スタック
- Framework: Next.js 16.x（App Router）
- Language: TypeScript（strict mode）
- Styling: Tailwind CSS 4.x + shadcn/ui（Radix UI ベース）
- テーブル: TanStack Table (`@tanstack/react-table`)
- Tests: Vitest（jsdom 環境）+ React Testing Library
- Package manager: pnpm
- Linter: ESLint（`eslint-config-next`）
- Deploy: Vercel（本番 URL: `https://resonance.drakontia.com`）

## 開発・テスト手順

```bash
pnpm install          # 依存関係のインストール
pnpm dev              # 開発サーバー起動
pnpm lint             # ESLint 実行
pnpm test             # Vitest 全テスト実行（一回）
pnpm test:watch       # Vitest ウォッチモード
pnpm test:coverage    # カバレッジレポート生成（80% 閾値）
pnpm build            # プロダクションビルド
pnpm start            # プロダクション起動
```

**単一テストの実行:**
```bash
# ファイルを指定
pnpm test tests/unit/lib/priceTableUtils.test.ts
# テスト名でフィルタ
pnpm test -- --reporter=verbose -t "buildPriceMaps"
```

テストファイルは `tests/unit/` 配下に配置する（`vitest.config.ts` の `include` 設定が `tests/**/*.{test,spec}.{ts,tsx}`）。

## アーキテクチャ概要

### ページ構成（App Router）

| ページ | ルート | 概要 |
|--------|--------|------|
| `app/page.tsx` | `/` | 商品一覧 (cards tab) + 価格表 (favorites tab) の複合ページ |
| `app/overview/page.tsx` | `/overview` | 商品カード一覧（ステーション別） |
| `app/prices/page.tsx` | `/prices` | 全商品×全ステーションの価格テーブル |
| `app/api/trade/route.ts` | `/api/trade` | 外部 API プロキシ（GET: 相場データ取得、POST: キャッシュ revalidate） |

すべてのページは `"use client"` で動作する（クライアントサイドレンダリング）。

### データフロー

```
外部 TRADE_API_URL
  → GET /api/trade（Next.js キャッシュ 10 分 / revalidate タグ 'trade'）
    → クライアント fetch('/api/trade')
      → useState でデータ保持
        → lib/priceTableUtils.ts でテーブル用データ変換
          → TanStack DataTable で表示
```

- 自動リフレッシュ: フロントエンドで 5 分間隔の `setInterval`
- GitHub Actions `update-trade.yml` が 10 分毎に `POST /api/trade` を呼び出してキャッシュを破棄

### 主要ドメインデータ（静的ファイル）

- `lib/cityDb.ts` — ステーション ID → 日本語名のマップ（`Record<string, string>`）
- `lib/tradeDb.ts` — 商品 ID → 日本語名のマップ（`Record<string, string>`）
- これらは自動生成ファイル（コメントに明記）。直接編集しないこと。

### 型定義（`types/trade.ts`）

主要な型：
- `Commodity` — 商品の価格情報（`price`, `quota`, `is_rise`, `is_rare`, `stock` 等）
- `Station` — `sell_price` / `buy_price` を `Record<string, Commodity>` で持つ
- `StationWithItems` — API レスポンスの変換後形式（`buyItems[]` / `sellItems[]` の配列）
- `PriceTableRow` — TanStack Table 用の行データ（`goodsJp` + ステーション ID をキーとする動的フィールド）

`Commodity.quota` は価格変動係数（`> 1` で上昇傾向 → 緑、`< 1` で下降傾向 → 赤）。

### ユーザー設定の永続化（localStorage）

| キー | 内容 |
|------|------|
| `favorites-overview` | カード一覧のお気に入り（`"stationId-goodsJp"` の配列） |
| `favorites-prices` | 価格表のお気に入り（`goodsJp` の配列） |
| `visibleStations` | 価格表で表示するステーション ID の配列 |
| `sortOrder` | ソート順（`'default'` / `'price-high'` / `'price-low'`） |
| `showPercent` | 価格を割合（%）表示するか否か（`'true'` / `'false'`） |

複数タブ対応のため `window.addEventListener('storage', ...)` でクロスタブ同期している。

### `lib/priceTableUtils.ts` の関数

価格テーブルのロジックはここに集約されている：
- `buildPriceMaps(stations)` — ステーション配列から `goodsJp → stationId → 価格` のマップを構築
- `buildTableData(...)` — TanStack Table 用の行配列に変換（動的カラム `${stationId}_quota` 等も生成）
- `calculateCellValues(...)` — セルの表示値・色クラス・ハイライト判定を算出

### 環境変数

| 変数名 | 用途 |
|--------|------|
| `TRADE_API_URL` | 外部相場 API の URL |
| `NEXT_PUBLIC_EXCLUDE_STATION_IDS` | 除外するステーション ID（カンマ区切り） |
| `NEXT_PUBLIC_EXCLUDE_COMMODITY_IDS` | 除外する商品 ID（カンマ区切り） |

## ファイル命名規則

- **コンポーネント**: PascalCase（`PriceValueCell.tsx`）
- **フック**: camelCase + `use` プレフィックス（`useFilteredAndSortedItems.ts`）
- **ユーティリティ/lib**: camelCase（`priceTableUtils.ts`）
- **型定義**: camelCase（`trade.ts`）
- **テスト**: 対象ファイル名 + `.test.ts(x)`（`tests/unit/` 配下）

## コンポーネント設計

- `components/ui/` — shadcn/ui の基本コンポーネント（カバレッジ対象外、直接編集しない）
- `components/` — 機能特化コンポーネント（named export を使用）
- クラス結合は `cn()` ユーティリティを使用（`lib/utils.ts` の `clsx` + `tailwind-merge` のラッパー）
- コンポーネントの props には必ず明示的な型定義を付与

## 状態管理

- グローバル状態管理ライブラリは**導入していない**。すべてのページレベル状態は `useState` で管理。
- ページ間共有が必要なデータは `localStorage` を経由（storage イベントでクロスタブ同期）。

## CI/CD

- PR 時: `.github/workflows/test-coverage.yml` が `pnpm test:coverage` を実行し Codecov にアップロード
- 定期: `.github/workflows/update-trade.yml` が 10 分毎に相場データのキャッシュを更新
- カバレッジ閾値: statements/branches/functions/lines すべて 80%（`vitest.config.ts`）

## 実装ルール

- 型安全: すべて TypeScript strict mode で厳密に型定義（`any` は極力使わない）。
- UI: Tailwind v4 記法に準拠。shadcn/ui コンポーネントのスタイル/アクセシビリティを維持。
- 最小変更: 既存 API/挙動を壊さず、差分を限定的に。
- 商品画像: `/public/images/items/{goodsJp}.png` のパスで配置・参照。

## PR 作成の指針

- ブランチ: `feature/<短く要点>` / `fix/<短く要点>`
- コミット: Conventional Commits 推奨（`feat:`, `fix:`, `chore:` 等）
- テスト: 変更に関係するユニットテストを追加/更新。カバレッジ 80% を維持する。

## コーディング規約

- `async/await` を優先（Promise チェーンは使わない）
- エラーハンドリングは `try-catch` で確実に行う
- 不要なコードはコメントアウトせず削除する
- 既存コンポーネントの公開 props の後方互換性を損なう変更は禁止
- セキュリティヘッダーは `next.config.ts` で一元管理されているため、個別コンポーネントで重複設定しない
