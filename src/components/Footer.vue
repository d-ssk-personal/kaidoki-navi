<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">チラシ キッチン</h3>
        <p class="footer-description">
          チラシからレシピを提案。<br>
          生活に役立つコラムも毎日配信。
        </p>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-heading">サービス</h4>
        <ul class="footer-links">
          <li><router-link to="/top">ホーム</router-link></li>
          <li><router-link to="/settings">通知設定</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-heading">法的情報</h4>
        <ul class="footer-links">
          <li><router-link to="/legal">利用規約</router-link></li>
          <li><router-link to="/legal">プライバシーポリシー</router-link></li>
          <li><router-link to="/legal">お問い合わせ</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-heading">法人のお客様</h4>
        <ul class="footer-links">
          <li><router-link to="/for-business">サービス紹介</router-link></li>
          <li><router-link to="/for-business#contact">お問い合わせ</router-link></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 チラシ キッチン. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background-color: #1f2937;
  color: white;
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.footer-description {
  color: #9ca3af;
  line-height: 1.6;
}

.footer-heading {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  color: #9ca3af;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: 20px;
  text-align: center;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>