# Chirashi Kitchen データベース設計書

## 概要

このドキュメントは、Chirashi KitchenのDynamoDB設計を定義します。

### 技術スタック
- **データベース**: AWS DynamoDB
- **バックエンド**: AWS Lambda (Python 3.12)
- **認証**: JWT

### 設計方針
- **マルチテーブル設計**: 各エンティティの独立性が高いため、マルチテーブル設計を採用
- **アクセスパターン最適化**: 主要なクエリパターンに基づいてGSIを設計
- **非正規化**: パフォーマンス向上のため、必要に応じてデータを重複させる

---

## テーブル一覧

1. [Users](#1-users---ユーザー)
2. [Admins](#2-admins---管理者)
3. [Companies](#3-companies---企業)
4. [Stores](#4-stores---店舗)
5. [Flyers](#5-flyers---チラシ)
6. [Articles](#6-articles---コラム)
7. [Products](#7-products---商品)
8. [PriceHistory](#8-pricehistory---価格履歴)
9. [FavoriteStores](#9-favoritstores---お気に入り店舗)
10. [Recipes](#10-recipes---aiレシピ)

---

## 1. Users - ユーザー

### テーブル名
`chirashi-kitchen-users`

### 説明
一般ユーザーの情報を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| userId | String | PK (Partition Key) | ユーザーID（UUID） |

### GSI（Global Secondary Index）

#### GSI-1: EmailIndex
- **Purpose**: メールアドレスでユーザーを検索（ログイン時）
- **PK**: email (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| userId | String | ○ | ユーザーID（UUID） | `user_a1b2c3d4` |
| email | String | ○ | メールアドレス（一意） | `user@example.com` |
| name | String | ○ | ユーザー名 | `山田太郎` |
| passwordHash | String | ○ | パスワードハッシュ（bcrypt） | `$2b$12$...` |
| favoriteStoreIds | List<String> |  | お気に入り店舗IDリスト | `["store_001", "store_002"]` |
| createdAt | String | ○ | 作成日時（ISO 8601） | `2024-01-01T00:00:00Z` |
| updatedAt | String | ○ | 更新日時（ISO 8601） | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. ユーザーIDでユーザー情報取得（PK）
2. メールアドレスでユーザー検索（GSI-1）
3. ユーザー情報更新（PK）

---

## 2. Admins - 管理者

### テーブル名
`chirashi-kitchen-admins`

### 説明
管理者アカウント情報を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| adminId | String | PK (Partition Key) | 管理者ID（UUID） |

### GSI（Global Secondary Index）

#### GSI-1: UsernameIndex
- **Purpose**: ユーザー名でログイン
- **PK**: username (String)
- **Projection**: ALL

#### GSI-2: CompanyIndex
- **Purpose**: 企業IDで管理者一覧取得
- **PK**: companyId (String)
- **SK**: role (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| adminId | String | ○ | 管理者ID（UUID） | `admin_001` |
| username | String | ○ | ユーザー名（ログインID） | `admin001` |
| name | String | ○ | 表示名 | `管理者太郎` |
| email | String | ○ | メールアドレス | `admin@example.com` |
| passwordHash | String | ○ | パスワードハッシュ | `$2b$12$...` |
| role | String | ○ | 役割 | `system_admin` / `company_admin` / `store_user` |
| companyId | String |  | 所属企業ID（company_admin, store_userの場合） | `company_001` |
| companyName | String |  | 所属企業名（非正規化） | `スーパーAグループ` |
| storeId | String |  | 所属店舗ID（store_userの場合） | `store_001` |
| storeName | String |  | 所属店舗名（非正規化） | `スーパーA 新宿店` |
| lastLoginAt | String |  | 最終ログイン日時 | `2024-01-15T10:00:00Z` |
| createdAt | String | ○ | 作成日時 | `2024-01-01T00:00:00Z` |
| updatedAt | String | ○ | 更新日時 | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. 管理者IDで管理者情報取得（PK）
2. ユーザー名でログイン（GSI-1）
3. 企業IDで管理者一覧取得（GSI-2）
4. 役割で絞り込み（GSI-2のSK）

---

## 3. Companies - 企業

### テーブル名
`chirashi-kitchen-companies`

### 説明
企業情報を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| companyId | String | PK (Partition Key) | 企業ID（UUID） |

### GSI（Global Secondary Index）

#### GSI-1: ContractStatusIndex
- **Purpose**: 契約状態で企業を検索・フィルタリング
- **PK**: contractStatus (String)
- **SK**: contractPlan (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| companyId | String | ○ | 企業ID（UUID） | `company_001` |
| name | String | ○ | 企業名 | `スーパーAグループ` |
| contactPerson | String | ○ | 担当者氏名 | `山田太郎` |
| email | String | ○ | 連絡先メールアドレス | `contact@superA.com` |
| phone | String | ○ | 電話番号 | `03-1234-5678` |
| address | String | ○ | 住所 | `東京都千代田区1-1-1` |
| contractStatus | String | ○ | 契約状態 | `active` / `expired` / `suspended` |
| contractPlan | String | ○ | 契約プラン | `basic` / `standard` / `premium` |
| contractStartDate | String | ○ | 契約開始日 | `2023-01-01` |
| contractEndDate | String | ○ | 契約終了日 | `2024-12-31` |
| storeCount | Number |  | 登録店舗数（計算値） | `15` |
| createdAt | String | ○ | 作成日時 | `2023-01-01T00:00:00Z` |
| updatedAt | String | ○ | 更新日時 | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. 企業IDで企業情報取得（PK）
2. 契約状態で企業一覧取得（GSI-1）
3. 契約プランで絞り込み（GSI-1のSK）

---

## 4. Stores - 店舗

### テーブル名
`chirashi-kitchen-stores`

### 説明
店舗情報を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| storeId | String | PK (Partition Key) | 店舗ID（UUID） |

### GSI（Global Secondary Index）

#### GSI-1: CompanyIndex
- **Purpose**: 企業IDで店舗一覧取得
- **PK**: companyId (String)
- **SK**: storeId (String)
- **Projection**: ALL

#### GSI-2: RegionIndex
- **Purpose**: 地域で店舗検索
- **PK**: prefecture (String)
- **SK**: region (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| storeId | String | ○ | 店舗ID（UUID） | `store_001` |
| companyId | String | ○ | 所属企業ID | `company_001` |
| companyName | String | ○ | 所属企業名（非正規化） | `スーパーAグループ` |
| name | String | ○ | 店舗名 | `スーパーA 新宿店` |
| logo | String |  | ロゴURL | `https://example.com/logos/store_001.png` |
| address | String | ○ | 住所 | `東京都新宿区新宿1-1-1` |
| prefecture | String | ○ | 都道府県 | `東京都` |
| region | String | ○ | 地方 | `関東` |
| phone | String | ○ | 電話番号 | `03-1234-5678` |
| openingHours | String |  | 営業時間 | `9:00-21:00` |
| salePeriod | String |  | セール期間 | `毎週金曜日はポイント5倍` |
| createdAt | String | ○ | 作成日時 | `2023-01-01T00:00:00Z` |
| updatedAt | String | ○ | 更新日時 | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. 店舗IDで店舗情報取得（PK）
2. 企業IDで店舗一覧取得（GSI-1）
3. 都道府県で店舗検索（GSI-2）
4. 地方で絞り込み（GSI-2のSK）

---

## 5. Flyers - チラシ

### テーブル名
`chirashi-kitchen-flyers`

### 説明
チラシ情報を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| flyerId | String | PK (Partition Key) | チラシID（UUID） |

### GSI（Global Secondary Index）

#### GSI-1: StoreIndex
- **Purpose**: 店舗IDでチラシ一覧取得
- **PK**: storeId (String)
- **SK**: validFrom (String)
- **Projection**: ALL

#### GSI-2: RegionIndex
- **Purpose**: 地域でチラシ検索
- **PK**: prefecture (String)
- **SK**: validFrom (String)
- **Projection**: ALL

#### GSI-3: CompanyIndex
- **Purpose**: 企業IDでチラシ一覧取得（管理画面用）
- **PK**: companyId (String)
- **SK**: validFrom (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| flyerId | String | ○ | チラシID（UUID） | `flyer_001` |
| storeId | String | ○ | 店舗ID | `store_001` |
| storeName | String | ○ | 店舗名（非正規化） | `スーパーA 新宿店` |
| storeLogo | String |  | 店舗ロゴURL（非正規化） | `https://example.com/logos/store_001.png` |
| companyId | String | ○ | 企業ID（非正規化） | `company_001` |
| companyName | String | ○ | 企業名（非正規化） | `スーパーAグループ` |
| imageUrl | String | ○ | チラシ画像URL（S3） | `https://s3.../flyers/flyer_001.jpg` |
| validFrom | String | ○ | 掲載開始日 | `2024-01-15` |
| validUntil | String | ○ | 掲載終了日 | `2024-01-21` |
| address | String | ○ | 店舗住所（非正規化） | `東京都新宿区新宿1-1-1` |
| prefecture | String | ○ | 都道府県（非正規化） | `東京都` |
| region | String | ○ | 地方（非正規化） | `関東` |
| phone | String |  | 店舗電話番号（非正規化） | `03-1234-5678` |
| openingHours | String |  | 営業時間（非正規化） | `9:00-21:00` |
| description | String |  | チラシ説明 | `新春大セール開催中！` |
| createdBy | String | ○ | 作成者（管理者ID） | `admin_001` |
| createdAt | String | ○ | 作成日時 | `2024-01-15T00:00:00Z` |
| updatedAt | String | ○ | 更新日時 | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. チラシIDでチラシ詳細取得（PK）
2. 店舗IDでチラシ一覧取得（GSI-1）
3. 都道府県でチラシ検索（GSI-2）
4. 企業IDでチラシ一覧取得（GSI-3）

---

## 6. Articles - コラム

### テーブル名
`chirashi-kitchen-articles`

### 説明
コラム記事を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| articleId | Number | PK (Partition Key) | コラムID（自動採番） |

### GSI（Global Secondary Index）

#### GSI-1: StatusIndex
- **Purpose**: ステータスで記事を検索・絞り込み
- **PK**: status (String)
- **SK**: publishedAt (String)
- **Projection**: ALL

#### GSI-2: CategoryIndex
- **Purpose**: カテゴリで記事を検索
- **PK**: category (String)
- **SK**: publishedAt (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| articleId | Number | ○ | コラムID（自動採番） | `1` |
| title | String | ○ | タイトル | `2024年の食品値上げ情報まとめ` |
| content | String | ○ | 本文 | `2024年も多くの食品が...` |
| images | List<String> |  | 画像URLリスト | `["https://...jpg"]` |
| publishedAt | String |  | 公開日時 | `2024-01-15T10:00:00Z` |
| category | String | ○ | カテゴリ | `値上げ情報` / `特売情報` / `節約術` / `レシピ` / `その他` |
| tags | List<String> |  | タグリスト | `["食品", "値上げ", "2024年"]` |
| status | String | ○ | ステータス | `published` / `draft` |
| createdBy | String | ○ | 作成者（管理者ID） | `admin_001` |
| updatedBy | String | ○ | 更新者（管理者ID） | `admin_001` |
| createdAt | String | ○ | 作成日時 | `2024-01-10T00:00:00Z` |
| updatedAt | String | ○ | 更新日時 | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. コラムIDで詳細取得（PK）
2. ステータスで記事一覧取得（GSI-1）
3. カテゴリで記事検索（GSI-2）
4. 公開日時の降順でソート（GSI-1, GSI-2のSK）

---

## 7. Products - 商品

### テーブル名
`chirashi-kitchen-products`

### 説明
商品情報を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| productId | String | PK (Partition Key) | 商品ID（UUID） |

### GSI（Global Secondary Index）

#### GSI-1: CategoryIndex
- **Purpose**: カテゴリで商品検索
- **PK**: category (String)
- **SK**: productName (String)
- **Projection**: ALL

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| productId | String | ○ | 商品ID（UUID） | `prod_001` |
| name | String | ○ | 商品名 | `豚バラ肉` |
| category | String | ○ | カテゴリ | `精肉` |
| currentPrice | Number | ○ | 現在価格 | `298` |
| previousPrice | Number |  | 前回価格 | `320` |
| lowestPrice | Number | ○ | 最安値 | `198` |
| lowestStoreName | String |  | 最安値の店舗名 | `スーパーA` |
| lastUpdated | String | ○ | 最終更新日時 | `2024-01-15T12:00:00Z` |
| createdAt | String | ○ | 作成日時 | `2024-01-01T00:00:00Z` |
| updatedAt | String | ○ | 更新日時 | `2024-01-15T00:00:00Z` |

### アクセスパターン
1. 商品IDで商品情報取得（PK）
2. カテゴリで商品検索（GSI-1）
3. 商品名で検索（GSI-1のSK + FilterExpression）

### 備考
- AI分析レポートは商品詳細取得時にリアルタイム生成するため、DBには保存しない

---

## 8. PriceHistory - 価格履歴

### テーブル名
`chirashi-kitchen-price-history`

### 説明
商品の価格推移を記録

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| productId | String | PK (Partition Key) | 商品ID |
| timestamp | String | SK (Sort Key) | タイムスタンプ（ISO 8601） |

### GSI（Global Secondary Index）
なし（PKとSKで効率的にクエリ可能）

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| productId | String | ○ | 商品ID | `prod_001` |
| timestamp | String | ○ | タイムスタンプ（ISO 8601） | `2024-01-15T00:00:00Z` |
| price | Number | ○ | 価格 | `298` |
| storeId | String | ○ | 店舗ID | `store_001` |
| storeName | String | ○ | 店舗名（非正規化） | `スーパーA` |
| date | String | ○ | 日付（YYYY-MM-DD） | `2024-01-15` |

### アクセスパターン
1. 商品IDとタイムスタンプ範囲で価格履歴取得（PK + SK）
2. 期間指定で価格推移取得（PK + SK range query）

---

## 9. FavoriteStores - お気に入り店舗

### テーブル名
`chirashi-kitchen-favorite-stores`

### 説明
ユーザーのお気に入り店舗を管理

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| userId | String | PK (Partition Key) | ユーザーID |
| storeId | String | SK (Sort Key) | 店舗ID |

### GSI（Global Secondary Index）
なし（PKとSKで効率的にクエリ可能）

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| userId | String | ○ | ユーザーID | `user_a1b2c3d4` |
| storeId | String | ○ | 店舗ID | `store_001` |
| storeName | String | ○ | 店舗名（非正規化） | `スーパーA 新宿店` |
| storeLogo | String |  | 店舗ロゴURL（非正規化） | `https://example.com/logos/store_001.png` |
| address | String | ○ | 住所（非正規化） | `東京都新宿区新宿1-1-1` |
| phone | String |  | 電話番号（非正規化） | `03-1234-5678` |
| notificationEnabled | Boolean | ○ | 新着チラシ通知有効フラグ | `true` |
| addedAt | String | ○ | 追加日時 | `2024-01-01T00:00:00Z` |

### アクセスパターン
1. ユーザーIDでお気に入り店舗一覧取得（PK）
2. ユーザーIDと店舗IDで特定のお気に入り取得（PK + SK）
3. お気に入り店舗の追加・削除・更新（PK + SK）

---

## 10. Recipes - AIレシピ

### テーブル名
`chirashi-kitchen-recipes`

### 説明
AIが生成したレシピを保存

### キー設計

| 属性名 | 型 | キー種別 | 説明 |
|--------|-----|----------|------|
| flyerId | String | PK (Partition Key) | チラシID |

### GSI（Global Secondary Index）
なし（チラシIDで直接アクセス）

### 属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| flyerId | String | ○ | チラシID | `flyer_001` |
| recipeText | String | ○ | レシピ本文（Markdown） | `# おすすめレシピ\n\n## 豚バラ肉と...` |
| ingredients | List<Map> |  | 食材リスト | `[{"name": "豚バラ肉", "price": 298}]` |
| generatedAt | String | ○ | 生成日時 | `2024-01-15T12:34:56Z` |
| ttl | Number |  | TTL（30日後に自動削除） | `1706097600` (Unix timestamp) |

### アクセスパターン
1. チラシIDでレシピ取得（PK）
2. レシピキャッシュ（再生成を避けるため）

### 備考
- TTL（Time To Live）を設定し、30日後に自動削除
- 同じチラシに対して再度レシピ生成を依頼された場合、キャッシュから返却

---

## 通知設定の管理

### 実装方法
ユーザーの通知設定は **Users テーブル** に以下の属性を追加して管理します。

### 追加属性

| 属性名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| notificationSettings | Map |  | 通知設定 | 以下参照 |

#### notificationSettings の構造
```json
{
  "categories": ["特売情報", "新着チラシ", "価格変動"],
  "frequency": "daily",
  "priceChangeThreshold": 10
}
```

---

## DynamoDB設計のベストプラクティス

### 1. パーティションキーの選択
- 均等に分散されるキーを選択（hotspot回避）
- ユーザーID、店舗ID、商品IDなどのUUIDを使用

### 2. ソートキーの活用
- 範囲クエリが必要な場合はソートキーを使用（タイムスタンプ、日付など）
- PriceHistory: timestamp をソートキーにして期間指定クエリを実現

### 3. GSI（Global Secondary Index）の設計
- 主要なクエリパターンに基づいて設計
- プロジェクションタイプは通常 `ALL` を選択（読み取りコスト削減）

### 4. 非正規化
- JOINができないため、頻繁にアクセスするデータは非正規化して保存
- 例: Flyersテーブルに店舗名、企業名を保存

### 5. TTL（Time To Live）の活用
- 一時的なデータ（AIレシピなど）は自動削除
- コスト削減とストレージ管理の自動化

### 6. Sparse Index
- 特定の属性が存在する場合のみGSIに含める
- publishedAt が存在する記事のみ公開記事として検索可能

---

## データ整合性の管理

### 非正規化データの更新
企業名や店舗名を変更した場合、関連するテーブルのデータも更新する必要があります。

#### 更新が必要なケース
1. **企業名変更**
   - Admins テーブルの companyName
   - Stores テーブルの companyName
   - Flyers テーブルの companyName

2. **店舗名・情報変更**
   - Admins テーブルの storeName
   - Flyers テーブルの storeName
   - FavoriteStores テーブルの storeName

#### 実装方法
- Lambda関数で一括更新を実行
- DynamoDB Streams + Lambda で自動更新（推奨）

---

## インデックス戦略

### 読み取りパターンの最適化
1. **完全一致検索**: パーティションキー
2. **範囲検索**: ソートキー
3. **複数属性での検索**: GSI
4. **テキスト検索**: FilterExpression または Amazon OpenSearch Service

### コスト最適化
- GSIのプロジェクションタイプを適切に選択
- 不要なGSIは作成しない
- On-Demand課金 vs プロビジョニング課金を検討

---

## セキュリティ

### アクセス制御
- IAMロールによる最小権限の原則
- Lambda実行ロールに必要な権限のみ付与

### データ暗号化
- DynamoDB暗号化（AWS managed key または CMK）
- パスワードはbcryptでハッシュ化
- JWTトークンで認証

### 監査ログ
- DynamoDB Streams + CloudWatch Logs
- 重要な操作（管理者操作など）をログ記録

---

## パフォーマンス最適化

### 1. バッチ処理
- BatchGetItem / BatchWriteItem を使用
- 最大25件まで一括処理可能

### 2. パラレルスキャン
- 大量データのスキャンが必要な場合
- 通常は避けるべき（GSIで代替）

### 3. DAX（DynamoDB Accelerator）
- 読み取り負荷が高い場合に検討
- マイクロ秒単位のレイテンシ

### 4. キャッシング戦略
- Lambda内でキャッシュ（グローバル変数）
- ElastiCache（Redis/Memcached）の利用

---

## バックアップとリカバリ

### Point-in-Time Recovery（PITR）
- 35日間のバックアップ保持
- 秒単位でのリストア可能

### On-Demand Backup
- 手動バックアップの作成
- 長期保存が必要な場合

---

## モニタリング

### CloudWatch メトリクス
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- ThrottledRequests
- UserErrors
- SystemErrors

### アラート設定
- スロットリング発生時
- エラー率が閾値を超えた時
- 読み取り/書き込みキャパシティ使用率

---

## 移行・拡張性

### 将来の拡張
1. **地域拡大**: グローバルテーブルの検討
2. **データ量増加**: パーティション戦略の見直し
3. **新機能追加**: GSIの追加や属性の拡張

### データ移行
- DynamoDB Import/Export（S3経由）
- AWS Data Pipeline
- カスタムスクリプト（SDK）

---

## まとめ

このDB設計は、Chirashi Kitchenのフロント機能とAPI設計に基づいて作成されています。DynamoDBの特性を最大限活用し、以下の点を重視しています：

1. **アクセスパターン最適化**: 主要なクエリをGSIで効率化
2. **非正規化**: パフォーマンス向上のためデータを重複
3. **スケーラビリティ**: パーティションキーの均等分散
4. **コスト最適化**: 適切なインデックス設計とTTL活用

レビュー後、必要に応じて調整・拡張してください。
