<template>
  <div class="legal-page">
    <h1 class="page-title">法的情報</h1>
    
    <div class="legal-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="legal-content">
      <!-- 利用規約 -->
      <section v-if="activeTab === 'terms'" class="legal-section">
        <h2 class="section-title">利用規約</h2>
        <div class="content-card">
          <div class="legal-text">
            <h3>第1条（適用）</h3>
            <p>
              本規約は、買い時ナビ（以下「本サービス」といいます）の利用に関する条件を、
              本サービスを利用するすべてのユーザー（以下「ユーザー」といいます）と
              当サービス運営者（以下「当社」といいます）との間で定めるものです。
            </p>

            <h3>第2条（利用登録）</h3>
            <p>
              ユーザーは、本規約に同意の上、当社の定める方法によって利用登録を申請し、
              当社がこれを承認することによって、利用登録が完了するものとします。
            </p>

            <h3>第3条（禁止事項）</h3>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
              <li>当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>本サービスによって得られた情報を商業的に利用する行為</li>
              <li>当社のサービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正な目的を持って本サービスを利用する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>

            <h3>第4条（本サービスの提供の停止等）</h3>
            <p>
              当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
              本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
            <ul>
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当社が本サービスの提供が困難と判断した場合</li>
            </ul>

            <h3>第5条（免責事項）</h3>
            <p>
              当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
              ただし、本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が
              消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
            </p>

            <h3>第6条（サービス内容の変更等）</h3>
            <p>
              当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、
              これによってユーザーに生じた損害について一切の責任を負いません。
            </p>

            <h3>第7条（利用規約の変更）</h3>
            <p>
              当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
              なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
            </p>

            <h3>第8条（準拠法・裁判管轄）</h3>
            <p>
              本規約の解釈にあたっては、日本法を準拠法とします。
              本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
            </p>

            <p class="legal-date">2025年1月1日 制定</p>
          </div>
        </div>
      </section>

      <!-- プライバシーポリシー -->
      <section v-if="activeTab === 'privacy'" class="legal-section">
        <h2 class="section-title">プライバシーポリシー</h2>
        <div class="content-card">
          <div class="legal-text">
            <p>
              買い時ナビ（以下「当サービス」）は、ユーザーの個人情報について以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
            </p>

            <h3>1. 収集する情報</h3>
            <p>当サービスでは、以下の情報を収集する場合があります。</p>
            <ul>
              <li>LINE連携時のユーザーID</li>
              <li>通知設定情報（カテゴリ、頻度等）</li>
              <li>お気に入り商品情報</li>
              <li>サービス利用履歴</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
            </ul>

            <h3>2. 情報の利用目的</h3>
            <p>収集した情報は、以下の目的で利用します。</p>
            <ul>
              <li>本サービスの提供・運営のため</li>
              <li>価格変動の通知を行うため</li>
              <li>ユーザーからのお問い合わせに対応するため</li>
              <li>サービスの改善・開発のため</li>
              <li>利用規約違反への対応のため</li>
              <li>統計データの作成のため</li>
            </ul>

            <h3>3. 情報の第三者提供</h3>
            <p>
              当サービスは、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
            </p>

            <h3>4. 個人情報の開示</h3>
            <p>
              ユーザーは、当サービスに対して、個人情報保護法の定めに基づき自己の個人情報の開示を求めることができます。
            </p>

            <h3>5. 個人情報の訂正および削除</h3>
            <p>
              ユーザーは、当サービスの保有する自己の個人情報が誤った情報である場合には、
              個人情報保護法の定めに基づき、個人情報の訂正、追加または削除を請求することができます。
            </p>

            <h3>6. Cookie（クッキー）について</h3>
            <p>
              当サービスでは、より良いサービス提供のためCookieを使用することがあります。
              Cookieの使用を望まない場合は、ブラウザの設定でCookieを無効にすることができます。
            </p>

            <h3>7. プライバシーポリシーの変更</h3>
            <p>
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
              ユーザーに通知することなく変更することができるものとします。
            </p>

            <h3>8. お問い合わせ窓口</h3>
            <p>
              本ポリシーに関するお問い合わせは、下記のお問い合わせフォームよりご連絡ください。
            </p>

            <p class="legal-date">2025年1月1日 制定</p>
          </div>
        </div>
      </section>

      <!-- お問い合わせ -->
      <section v-if="activeTab === 'contact'" class="legal-section">
        <h2 class="section-title">お問い合わせ</h2>
        <div class="content-card">
          <p class="contact-description">
            本サービスに関するご質問・ご要望がございましたら、下記フォームよりお問い合わせください。
          </p>

          <form class="contact-form" @submit.prevent="submitContact">
            <div class="form-group">
              <label for="name" class="form-label">お名前 *</label>
              <input 
                type="text" 
                id="name" 
                v-model="contactForm.name"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">メールアドレス *</label>
              <input 
                type="email" 
                id="email" 
                v-model="contactForm.email"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="category" class="form-label">お問い合わせ種別 *</label>
              <select 
                id="category" 
                v-model="contactForm.category"
                class="form-select"
                required
              >
                <option value="">選択してください</option>
                <option value="service">サービスについて</option>
                <option value="technical">技術的な問題</option>
                <option value="privacy">個人情報について</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div class="form-group">
              <label for="message" class="form-label">お問い合わせ内容 *</label>
              <textarea 
                id="message" 
                v-model="contactForm.message"
                class="form-textarea"
                rows="6"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary btn-large"
              :disabled="submitting"
            >
              {{ submitting ? '送信中...' : '送信する' }}
            </button>

            <p v-if="contactMessage" :class="['contact-message', contactMessageClass]">
              {{ contactMessage }}
            </p>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Legal',
  data() {
    return {
      activeTab: 'terms',
      tabs: [
        { id: 'terms', label: '利用規約' },
        { id: 'privacy', label: 'プライバシーポリシー' },
        { id: 'contact', label: 'お問い合わせ' }
      ],
      contactForm: {
        name: '',
        email: '',
        category: '',
        message: ''
      },
      submitting: false,
      contactMessage: '',
      contactMessageClass: ''
    }
  },
  methods: {
    async submitContact() {
      try {
        this.submitting = true
        this.contactMessage = ''
        
        // 実際のAPI呼び出しはここに実装
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.contactMessage = 'お問い合わせを受け付けました。ご連絡ありがとうございます。'
        this.contactMessageClass = 'success'
        
        // フォームをリセット
        this.contactForm = {
          name: '',
          email: '',
          category: '',
          message: ''
        }
      } catch (error) {
        console.error('お問い合わせ送信エラー:', error)
        this.contactMessage = '送信に失敗しました。時間をおいて再度お試しください。'
        this.contactMessageClass = 'error'
      } finally {
        this.submitting = false
        
        setTimeout(() => {
          this.contactMessage = ''
        }, 5000)
      }
    }
  }
}
</script>

<style scoped>
.legal-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 32px;
  color: var(--text-primary);
}

.legal-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 2px solid var(--border-color);
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

.legal-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.content-card {
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.legal-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px;
  color: var(--text-primary);
}

.legal-text p {
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.legal-text ul {
  margin: 16px 0;
  padding-left: 24px;
}

.legal-text li {
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.legal-date {
  text-align: right;
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 32px;
}

/* お問い合わせフォーム */
.contact-description {
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 32px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.contact-message {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.contact-message.success {
  background-color: #d1fae5;
  color: var(--secondary-color);
}

.contact-message.error {
  background-color: #fee2e2;
  color: var(--danger-color);
}

@media (max-width: 768px) {
  .content-card {
    padding: 20px;
  }
  
  .legal-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    min-width: 100px;
  }
}
</style>