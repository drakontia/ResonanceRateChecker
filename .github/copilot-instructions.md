# Resonance Rate Checker — Copilot Coding Agent Instructions

## このドキュメントについて

ｰ この文書は GitHub Copilot Coding Agent が本リポジトリで安全かつ正確に開発タスクを実施するための実務ガイドです。
- 現行コードベース（Next.js 16 / TypeScript / Tailwind v4）に沿った運用ルールを補足しています。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。

## 前提条件

- 回答は必ず日本語でしてください。
- コードの変更をする際、変更量が200行を超える可能性が高い場合は、事前に「この指示では変更量が200行を超える可能性がありますが、実行しますか?」とユーザーに確認をとるようにしてください。
- 何か大きい変更を加える場合、まず何をするのか計画を立てた上で、ユーザーに「このような計画で進めようと思います。」と提案してください。この時、ユーザーから計画の修正を求められた場合は計画を修正して、再提案をしてください。

## 目的 / スコープ
- ゲーム「レゾナンス：無限号列車」の相場チェック Web アプリの機能追加・改善・バグ修正。
- 仕様への準拠、型安全、UI/UX一貫性の維持。
- 変更は最小限で、既存挙動・公開 API を壊さない。

## 技術スタックと前提
- Framework: Next.js 16.x（App Router, Turbopack）
- Language: TypeScript 5.9.x
- Styling: Tailwind CSS 4.1.x
- Tests: Vitest（ユニット）、Playwright（E2E）
- Package manager: pnpm
- **リンター/フォーマッター**: ESLint + Prettier
- **型チェック**: TypeScript strict mode

## 主要ドメイン仕様（要点）

## データ構造（実装の基準）

## ファイル構成（主要）
- `app/` … Next.js App Router
- `components/` … UI/ロジックコンポーネント（`DeckBuilder.tsx`, `DeckDisplay.tsx`, `CardSelector.tsx` 等）
- `hooks/` … 状態管理（`useDeckBuilder.ts`）
- `lib/` … ドメインデータ/ユーティリティ
- `__tests__/` … Playwright/Vitest テスト
- `types/` … 型定義
- `scripts/` … データ入力支援スクリプト

## アーキテクチャ指針

### コンポーネント設計

- **Atomic Design の部分的採用**: `/components/ui` に基本コンポーネント、`/components` 内に機能特化コンポーネント
- **Composition Pattern**: 小さなコンポーネントを組み合わせて複雑な UI を構築
- **Container/Presentational Pattern**: ロジックと表示を分離 (hooks でロジックを抽出)

### 状態管理の方針

- **ローカル状態**: `useState` / `useReducer` で管理
- **グローバル状態**: Zustand で管理

## ディレクトリ・ファイル命名規則

### コンポーネント

- **ファイル名**: PascalCase (例: `TaskList.tsx`, `TaskCard.tsx`)
- **ディレクトリ**: ケバブケース (例: `task-list/`, `calendar-view/`)
- **index.ts**: 各ディレクトリに配置し、外部へのエクスポートを集約

### フック

- **ファイル名**: camelCase + `use` プレフィックス (例: `useTaskList.ts`, `useAuth.ts`)

### ユーティリティ

- **ファイル名**: camelCase (例: `formatDate.ts`, `validateEmail.ts`)

### 型定義

- **ファイル名**: camelCase または PascalCase (例: `task.types.ts`, `Task.ts`)
- **型名**: PascalCase (例: `Task`, `User`, `ApiResponse<T>`)

## UI 実装ガイド

### コンポーネント設計原則

- **Single Responsibility**: 1つのコンポーネントは1つの責務のみ
- **Props の型定義**: 全ての props に明示的な型を定義
- **デフォルトエクスポートを避ける**: Named export を使用し、リファクタリングを容易に
- **children パターン**: 柔軟性が必要な場合は `children` を活用

### スタイリング

- **Tailwind CSS をベースに使用**: ユーティリティファーストのアプローチ
- **共通スタイルの定義**: `styles/globals.css` でカスタムユーティリティクラスを定義
- **CSS Modules**: コンポーネント固有の複雑なスタイルが必要な場合のみ使用
- **レスポンシブ対応**: Tailwind のブレークポイント (`sm:`, `md:`, `lg:`) を活用

### アクセシビリティ (a11y)

- **セマンティック HTML**: 適切な HTML タグを使用 (`<button>`, `<nav>`, `<main>` 等)
- **aria 属性**: 必要に応じて `aria-label`, `aria-describedby` 等を付与
- **キーボード操作**: すべての操作をキーボードで実行可能に
- **フォーカス管理**: `focus-visible` で適切なフォーカススタイルを適用

### パフォーマンス最適化

- **React.memo**: 不要な再レンダリングを防ぐ
- **useMemo / useCallback**: 高コストな計算や関数の再生成を防ぐ
- **Code Splitting**: React.lazy + Suspense で遅延ロード
- **画像最適化**: WebP 形式、適切なサイズ、lazy loading

## テスト戦略

### 単体テスト (Vitest)

- **hooks**: `@testing-library/react-hooks` でテスト
- **utils**: 純粋関数のロジックをテスト
- **stores**: Zustand ストアのアクションと状態変化をテスト

### コンポーネントテスト (React Testing Library)

- **ユーザーインタラクション**: `fireEvent` / `userEvent` でイベントをシミュレート
- **非同期処理**: `waitFor` で非同期レンダリングを待機

### E2E テスト (Playwright / Cypress)

- **主要フロー**: キャラクター選択 → カード追加 → ヒラメキ編集 → 共有のフローをテスト
- **クロスブラウザ**: Chrome でテスト

## 開発・テスト手順
- 依存関係の導入・開発起動
  ```bash
  pnpm install
  pnpm dev
  ```
- ユニットテスト（必須）
  ```bash
  pnpm test            # Vitest 実行
  pnpm test:ui         # Vitest UI（必要時）
  ```
- E2E（必要に応じて変更影響が UI に及ぶ場合に）
  ```bash
  pnpm test:playwright # Playwright 実行
  ```
- ビルド/起動確認（PR前の最終確認）
  ```bash
  pnpm build
  pnpm start
  ```

## 実装ルール
- 型安全: すべて TypeScript で厳密に型定義を尊重（`types/index.ts` を参照）。
- UI: Tailwind v4 記法に準拠。Shadcn UI コンポーネントのスタイル/アクセシビリティを維持。
- 最小変更: 既存 API/挙動を壊さず、差分を限定的に。
- ドメイン整合性: ヒラメキ/神ヒラメキのルール、ポイント算出のルールを守る。

## 変更の作法（PR作成の指針）
- ブランチ: `feature/<短く要点>` / `fix/<短く要点>` など意味のある名前。
- コミット: 1つの目的に絞った小さなコミット。メッセージは動詞先行で簡潔に。
- PR説明: 目的/背景、仕様への整合性、UI変更のスクリーンショット（必要時）、テスト実行結果の要約。
- テスト: 変更に関係するユニットテストを追加/更新。UIに影響がある場合は E2E 更新も検討。

## コーディング規約・ベストプラクティス

### TypeScript の作法

- **strict モード**: `tsconfig.json` で `strict: true`
- **any の禁止**: `no-explicit-any` ルールを有効化
- **型推論の活用**: 冗長な型注釈は避け、推論に任せる
- **ユニオン型**: 状態を明示的に表現 (例: `type Status = 'idle' | 'loading' | 'success' | 'error'`)

### React の作法

- **関数コンポーネント**: クラスコンポーネントは使用しない
- **hooks のルール**: トップレベルでのみ呼び出し、条件分岐内で呼び出さない
- **useEffect の依存配列**: 正確に指定し、不要な再実行を防ぐ
- **key prop**: リストレンダリング時に一意で安定した key を使用

### 非同期処理

- **async/await**: Promise チェーンよりも優先
- **エラーハンドリング**: try-catch で必ずエラーをキャッチ
- **AbortController**: 不要なリクエストはキャンセル

### インポート順序

1. React 関連
2. 外部ライブラリ
3. 内部モジュール (features, shared, lib)
4. 型定義
5. スタイル

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { TaskList } from '@/features/task/components';
import { Button } from '@/components/ui';
import { formatDate } from '@/utils';

import type { Task } from '@/features/task/types';

import styles from './Home.module.css';
```

### コメント

- **JSDoc**: 複雑な関数には JSDoc コメントを付与
- **TODO コメント**: 一時的な実装には `// TODO:` を残す
- **コメントアウト**: 不要なコードは削除し、コメントアウトは残さない

## 破壊的変更の禁止例
- 型定義の互換性を壊す変更（引数/戻り値の型を勝手に変更）
- i18nキー構造の破壊（既存キーの削除・意味変更）
- 既存コンポーネントの公開プロップの後方互換性を損なう変更

## セキュリティ / 品質
- XSS/CSRF 等は Next.js/React 標準挙動に準拠しつつ、危険な HTML を挿入しない。
- コード整形は既存のスタイルに合わせる。不要なリファクタリングは避ける。
- 大規模改修は要分割・段階的 PR。

## 失敗時の対応
- ビルド/テスト失敗時は差分を見直し、最小修正で復旧。
- i18nエラー（キー欠落等）はフォールバックを暫定使用し、キーを追って追加。

## アンチパターン

以下のパターンは避けてください。既存コードで発見した場合は、リファクタリングを提案してください。

### コンポーネント設計

- **巨大コンポーネント**: 1つのコンポーネントが200行を超える場合は分割を検討
- **Prop Drilling**: 深い階層での props バケツリレーは、Context や状態管理ライブラリで解決
- **useEffect の濫用**: データフェッチは React Query、イベントハンドラーで済む処理は useEffect を使わない

### 状態管理

- **過度なグローバル状態**: 真にグローバルな状態のみを Zustand で管理
- **useState の濫用**: 複雑な状態は useReducer で管理
- **直接的な状態変更**: イミュータブルな更新を心がける

### パフォーマンス

- **不要な再レンダリング**: React DevTools Profiler で計測し、必要に応じて最適化
- **過度な最適化**: 実測せずに useMemo/useCallback を多用しない
- **巨大なバンドル**: Code Splitting を活用し、初期ロードを軽量化

### TypeScript

- **any の濫用**: 型推論が難しい場合は `unknown` を使用し、型ガードで絞り込む
- **型アサーション (as)**: 必要最小限に留め、型の安全性を保つ
- **オプショナルの濫用**: 本当に必要な場合のみ `?` を使用

## セキュリティとプライバシー

- **環境変数**: API キーは `.env` で管理し、`.gitignore` に追加
- **XSS 対策**: ユーザー入力は適切にサニタイズ、React の JSX は自動エスケープ
- **CSRF 対策**: Firebase Authentication のトークンベース認証で対応
- **HTTPS 通信**: 本番環境では必ず HTTPS を使用
- **CSP (Content Security Policy)**: 適切な CSP ヘッダーを設定

## アクセシビリティ (a11y) ガイドライン

- **WCAG 2.1 AA レベル**: 準拠を目指す
- **スクリーンリーダー対応**: ARIA 属性を適切に使用
- **キーボードナビゲーション**: Tab, Enter, Escape キーでの操作をサポート
- **カラーコントラスト**: 4.5:1 以上のコントラスト比を維持
- **axe DevTools**: 開発時に定期的にチェック

## まとめ

このドキュメントを常に最新に保ち、新しい技術選定や設計変更があった場合は適宜更新してください。GitHub Copilot や AI ツールは、このドキュメントを参照することで、プロジェクトのコンテキストを正確に理解し、より適切なコード提案を行うことができます。

本ガイドに従い、変更は必ずテスト・ビルドで裏付けてから PR を作成してください。


## 補足ガイドライン

### API設計・通信規約
- REST API設計を基本とし、エンドポイントはスネークケースで統一。
- レスポンスはJSON形式、型定義は `types/` 配下で管理。
- エラー時はHTTPステータス+エラーコード+メッセージを返却。
- API追加時はOpenAPI仕様書（swagger）を必ず更新。

### i18n（国際化）対応
- i18n対応が必要な場合は `next-intl` を利用。
- 翻訳キーは `messages/` 配下で管理、キーはドット区切りで命名。
- デフォルト言語は日本語、追加言語はPRで段階的に導入。

### CI/CD・自動テスト運用
- GitHub ActionsでPR時にLint/TypeCheck/UnitTest/Buildを自動実行。
- すべてのチェックが通過しない限りマージ不可。
- E2Eテストは主要フロー変更時に必須。

### 依存パッケージ管理
- `pnpm` のバージョンは `package.json` の `engines` で固定。
- dependabotで定期的に依存更新、脆弱性は即時対応。

### 画像・アセット管理
- 画像は `public/images/` 配下、ファイル名は英小文字+ハイフン区切り。
- 不要アセットはPRで削除、画像最適化はWebP推奨。

### アクセシビリティ自動チェック
- axe DevTools等で自動a11yチェックを導入。
- PR時にa11yエラーが出た場合は修正必須。

### コミットメッセージ規約
- Conventional Commits（例: feat:, fix:, chore:）を推奨。
- 1コミット1目的、prefix+簡潔な説明。

### バージョン管理・リリース運用
- SemVer（MAJOR.MINOR.PATCH）を採用。
- リリース時はタグ付与、`CHANGELOG.md` を更新。

### ローカル開発環境の推奨設定
- Node.js/pnpmの推奨バージョンは `README.md` に明記。
- `.env.example` を用意し、環境変数のサンプルを記載。
- VSCode拡張（ESLint, Prettier, Tailwind CSS IntelliSense等）を推奨。

### セキュリティ脆弱性対応
- 依存パッケージの脆弱性は `pnpm audit` で定期チェック。
- 脆弱性発見時はissue化し、修正・リリースまでの流れを明記。
