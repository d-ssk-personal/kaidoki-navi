買い時ナビ - 価格変動通知アプリ
2025年問題による物価高騰に対応する、価格変動を自動監視・通知するWebアプリケーションです。

🎯 プロジェクトの目的
商品の価格変動を自動収集し、「値上げ」「値下げ」「タイムセール」をユーザーへ通知
AIにより、情報を節約向けに分かりやすく要約
ユーザーが賢い買い物で家計を守ることをサポート
🏗️ 技術スタック
フロントエンド
Vue.js 3 - メインフレームワーク
Vue Router - ルーティング
Pinia - 状態管理
Chart.js / vue-chartjs - グラフ表示
Axios - HTTP通信
Vite - ビルドツール
バックエンド（今後実装予定）
AWS Lambda
API Gateway
DynamoDB
CloudWatch (定期実行)
通知機能（今後実装予定）
LINE Messaging API
Firebase Cloud Messaging (PWA用)
AI処理（今後実装予定）
OpenAI (GPT-3.5/4)
📦 プロジェクト構成
kaidoki-navi/
├── public/
│   └── index.html              # HTMLテンプレート
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css        # 共通スタイル
│   ├── components/
│   │   ├── Header.vue          # ヘッダーコンポーネント
│   │   ├── Footer.vue          # フッターコンポーネント
│   │   ├── PriceChart.vue      # 価格グラフコンポーネント
│   │   └── ProductCard.vue     # 商品カードコンポーネント
│   ├── views/
│   │   ├── TopPage.vue         # トップページ
│   │   ├── ItemDetail.vue      # 商品詳細ページ
│   │   ├── Settings.vue        # 通知設定ページ
│   │   └── Legal.vue           # 法的情報ページ
│   ├── router/
│   │   └── index.js            # ルーター設定
│   ├── store/
│   │   └── index.js            # Pinia ストア
│   ├── services/
│   │   └── api.js              # API通信サービス
│   ├── App.vue                 # ルートコンポーネント
│   └── main.js                 # エントリーポイント
├── package.json                # 依存関係
├── vite.config.js             # Vite設定
└── README.md                   # このファイル
🚀 セットアップ手順
1. リポジトリのクローン
bash
git clone https://github.com/d-ssk-personal/kaidoki-navi.git
cd kaidoki-navi
2. 依存パッケージのインストール
bash
npm install
3. 開発サーバーの起動
bash
npm run dev
ブラウザで http://localhost:5173 にアクセスしてください。

4. ビルド
bash
npm run build
ビルドされたファイルは dist/ ディレクトリに出力されます。

5. プレビュー
bash
npm run preview
📄 主要ファイルの作成手順
プロジェクトを構築するために、以下のファイルを順番に作成してください:

package.json - プロジェクトの依存関係を定義
vite.config.js - Viteの設定
public/index.html - HTMLテンプレート
src/main.js - アプリケーションのエントリーポイント
src/App.vue - ルートコンポーネント
src/assets/styles/main.css - 共通スタイル
src/router/index.js - ルーター設定
src/store/index.js - Pinia ストア
src/services/api.js - API通信サービス
コンポーネントファイル (Header.vue, Footer.vue, ProductCard.vue, PriceChart.vue)
ページファイル (TopPage.vue, ItemDetail.vue, Settings.vue, Legal.vue)
🎨 画面構成
1. トップページ (/top)
サービス説明
3つの特徴セクション
人気商品の価格推移一覧
CTAセクション
2. 商品詳細ページ (/item/:id)
現在価格と価格変動情報
AI分析レポート
過去の価格推移グラフ（30日〜180日）
価格変動履歴テーブル
お気に入り登録機能
3. 通知設定ページ (/settings)
LINE/Web Push通知設定
通知カテゴリ選択
通知頻度設定
価格変動閾値設定
お気に入り商品管理
4. 法的情報ページ (/legal)
利用規約
プライバシーポリシー
お問い合わせフォーム
🔄 現在の実装状況
✅ 完了
Vue.js 3プロジェクトのセットアップ
全ページのUI実装
ルーティング設定
状態管理（Pinia）
モックデータによる動作確認
レスポンシブデザイン
🚧 今後実装予定
バックエンドAPI接続
スクレイピング機能（AWS Lambda）
LINE Messaging API連携
Web Push通知機能
AI要約機能（OpenAI API）
PWA対応
Google AdSense設定
📝 Git コミット手順
bash
# 初回コミット
git add .
git commit -m "feat: 初回コミット - フロントエンドの基本構造とUI実装

- Vue 3 + Vite でプロジェクトセットアップ
- トップページ、商品詳細、設定、法的情報ページを実装
- レスポンシブデザイン対応
- モックデータでの動作確認可能"

# リモートリポジトリにプッシュ
git push origin main
🌟 今後の開発予定
Phase 1: バックエンド構築
AWS Lambda関数の作成
DynamoDB設計・実装
API Gateway設定
スクレイピング機能実装
Phase 2: 通知機能実装
LINE Messaging API連携
Web Push通知実装
通知ロジックの最適化
Phase 3: AI機能実装
OpenAI API連携
価格分析アルゴリズム
節約アドバイス生成
Phase 4: 本番環境デプロイ
AWS環境セットアップ
ドメイン取得・SSL設定
Google AdSense申請・設定
📮 お問い合わせ
プロジェクトに関する質問や提案がありましたら、Issueを作成してください。

📄 ライセンス
このプロジェクトは開発中です。ライセンスは後日決定します。

開発開始日: 2025年11月 最終更新: 2025年11月

