// お知らせのモックデータ
export const notifications = [
  {
    id: 1,
    title: '新規掲載スーパー追加のお知らせ - 関東エリアに5店舗追加',
    content: '関東エリアに新たに5つのスーパーマーケットが追加されました。イオンスタイル新宿店、マルエツプチ六本木店、ライフ中野店など、人気の店舗のチラシ情報をご覧いただけます。ぜひお気に入り店舗に登録して、最新のお得情報をチェックしてください。',
    publishedAt: '2025-01-15T10:00:00Z',
    category: '新規掲載'
  },
  {
    id: 2,
    title: 'システムメンテナンスのお知らせ - 1月20日(月) 2:00-4:00',
    content: '2025年1月20日(月) 午前2時から午前4時まで、システムメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけませんので、予めご了承ください。ご不便をおかけいたしますが、何卒よろしくお願いいたします。',
    publishedAt: '2025-01-12T14:30:00Z',
    category: 'メンテナンス'
  },
  {
    id: 3,
    title: 'お気に入り店舗数の上限を50店舗に拡張しました',
    content: 'ユーザーの皆様からのご要望にお応えし、お気に入り店舗の登録上限を従来の20店舗から50店舗に拡張いたしました。より多くの店舗のチラシ情報を一括でチェックできるようになりました。これからもユーザーの皆様により便利にご利用いただけるよう、機能改善を続けてまいります。',
    publishedAt: '2025-01-10T09:00:00Z',
    category: '機能追加'
  },
  {
    id: 4,
    title: '年末年始の営業時間変更のお知らせ',
    content: 'カスタマーサポートの年末年始の営業時間についてお知らせいたします。12月29日(金)から1月3日(水)まで、お問い合わせ対応をお休みさせていただきます。1月4日(木)より通常営業となります。休業期間中にいただいたお問い合わせは、営業開始後に順次対応させていただきます。',
    publishedAt: '2024-12-25T16:00:00Z',
    category: 'お知らせ'
  },
  {
    id: 5,
    title: 'AI レシピ提案機能の精度向上アップデート',
    content: 'チラシの食材からAIがレシピを提案する機能の精度を大幅に向上させました。より季節に合ったレシピや、アレルギー対応レシピの提案が可能になりました。また、提案されたレシピをSNSで簡単にシェアできる機能も追加されています。ぜひお試しください。',
    publishedAt: '2024-12-20T11:00:00Z',
    category: '機能改善'
  },
  {
    id: 6,
    title: '通知機能のカスタマイズ設定が可能になりました',
    content: 'お気に入り店舗の新着チラシ通知について、通知タイミングをカスタマイズできるようになりました。リアルタイム通知、朝8時の一括通知、夕方18時の一括通知の3つから選択可能です。マイページの通知設定からご変更いただけます。',
    publishedAt: '2024-12-15T13:30:00Z',
    category: '機能追加'
  },
  {
    id: 7,
    title: 'セキュリティ強化のアップデートを実施しました',
    content: 'お客様の個人情報をより安全に保護するため、セキュリティ機能を強化するアップデートを実施いたしました。二段階認証の設定も可能になりましたので、マイページのセキュリティ設定からご確認ください。',
    publishedAt: '2024-12-10T10:00:00Z',
    category: 'セキュリティ'
  },
  {
    id: 8,
    title: '東北エリアに10店舗の新規掲載スーパーが追加されました',
    content: '東北エリアに新たに10店舗のスーパーマーケットが追加されました。仙台市、盛岡市、郡山市など、主要都市のスーパーのチラシ情報をご覧いただけます。地域の皆様により便利にご利用いただけるよう、今後も掲載店舗の拡充を進めてまいります。',
    publishedAt: '2024-12-05T09:00:00Z',
    category: '新規掲載'
  },
  {
    id: 9,
    title: 'スマートフォンアプリの iOS版をリリースしました',
    content: 'チラシ キッチンのスマートフォンアプリ iOS版をApp Storeにてリリースいたしました。アプリではプッシュ通知でお得な情報をいち早くお届けします。また、オフラインでもチラシを閲覧できる機能も搭載しています。ぜひダウンロードしてご利用ください。',
    publishedAt: '2024-11-28T15:00:00Z',
    category: 'アプリリリース'
  },
  {
    id: 10,
    title: 'チラシ検索機能に地図表示を追加しました',
    content: '店舗検索時に地図上で店舗の位置を確認できる機能を追加しました。現在地から近い順に店舗を並び替えることも可能です。外出先でも近くのお得なチラシを簡単に見つけられます。',
    publishedAt: '2024-11-22T12:00:00Z',
    category: '機能追加'
  },
  {
    id: 11,
    title: 'システム障害復旧のお知らせ',
    content: '11月18日に発生していたシステム障害は復旧いたしました。ご利用の皆様には大変ご迷惑をおかけし、誠に申し訳ございませんでした。再発防止に努めてまいります。',
    publishedAt: '2024-11-20T08:00:00Z',
    category: '障害情報'
  },
  {
    id: 12,
    title: 'ポイント還元キャンペーン開始のお知らせ',
    content: '11月15日より、新規ユーザー登録キャンペーンを開始いたします。期間中に新規登録いただいた方には、提携店舗で使える500円分のポイントをプレゼント。さらにお友達紹介で追加200ポイントも獲得できます。この機会にぜひご登録ください。',
    publishedAt: '2024-11-10T10:30:00Z',
    category: 'キャンペーン'
  }
]

// お知らせをIDで検索
export function getNotificationById(id) {
  return notifications.find(notification => notification.id === parseInt(id))
}

// お知らせを検索（タイトルと本文）
export function searchNotifications(query) {
  if (!query) return notifications

  const lowerQuery = query.toLowerCase()
  return notifications.filter(notification =>
    notification.title.toLowerCase().includes(lowerQuery) ||
    notification.content.toLowerCase().includes(lowerQuery) ||
    notification.category.toLowerCase().includes(lowerQuery)
  )
}

// 最新のお知らせを取得
export function getLatestNotifications(limit = 3) {
  return [...notifications]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)
}

// 年月でグループ化されたお知らせを取得
export function getNotificationsByMonth() {
  const grouped = {}

  notifications.forEach(notification => {
    const date = new Date(notification.publishedAt)
    const yearMonth = `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`

    if (!grouped[yearMonth]) {
      grouped[yearMonth] = []
    }
    grouped[yearMonth].push(notification)
  })

  // 年月の降順でソート
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const [yearA, monthA] = a.match(/(\d+)年(\d+)月/).slice(1, 3)
    const [yearB, monthB] = b.match(/(\d+)年(\d+)月/).slice(1, 3)
    return yearB * 100 + parseInt(monthB) - (yearA * 100 + parseInt(monthA))
  })

  const result = []
  sortedKeys.forEach(key => {
    result.push({
      yearMonth: key,
      notifications: grouped[key].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    })
  })

  return result
}
