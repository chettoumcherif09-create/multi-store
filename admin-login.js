// ==========================================
//  🔐 Multi Store - admin-login.js
//  تسجيل الدخول باستخدام Firebase Auth
// ==========================================

import { auth, signInWithEmailAndPassword, onAuthStateChanged } from './firebase-config.js';

// ==========================================
//  التشغيل
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('errorMsg');
  
  // إذا كان مسجل دخول → انتقل للوحة
  onAuthStateChanged(auth, function(user) {
    if (user) {
      window.location.href = 'admin.html';
    }
  });
  
  // ==========================================
  //  تسجيل الدخول
  // ==========================================
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      showError('❌ أدخل البريد وكلمة المرور');
      return;
    }
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    errorMsg.classList.remove('show');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged سينقلنا تلقائياً
    } catch (error) {
      console.error('❌ Login error:', error.code);
      
      let msg = '❌ حدث خطأ';
      
      if (error.code === 'auth/invalid-email') {
        msg = '❌ البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/user-not-found') {
        msg = '❌ لا يوجد حساب بهذا البريد';
      } else if (error.code === 'auth/wrong-password') {
        msg = '❌ كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-credential') {
        msg = '❌ بيانات الدخول غير صحيحة';
      } else if (error.code === 'auth/too-many-requests') {
        msg = '❌ محاولات كثيرة، حاول لاحقاً';
      }
      
      showError(msg);
      
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
    }
  });
  
  // ==========================================
  //  إظهار الخطأ
  // ==========================================
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('show');
    
    setTimeout(function() {
      errorMsg.classList.remove('show');
    }, 5000);
  }
  
  console.log('🔐 Admin Login: Ready');
});