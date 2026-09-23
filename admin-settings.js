// ==========================================
//  ⚙️ Multi Store - admin-settings.js
//  حفظ الإعدادات في Firebase
// ==========================================

import { db, auth, collection, doc, setDoc, onSnapshot, serverTimestamp, onAuthStateChanged } from './firebase-config.js';

// ==========================================
//  التحقق من الدخول
// ==========================================
onAuthStateChanged(auth, function(user) {
  if (!user) {
    window.location.href = 'admin-login.html';
    return;
  }
});

// ==========================================
//  العناصر
// ==========================================
const loadingDiv = document.getElementById('loadingDiv');
const settingsContent = document.getElementById('settingsContent');
const storeNameInput = document.getElementById('storeName');
const storeDescriptionInput = document.getElementById('storeDescription');
const whatsappNumberInput = document.getElementById('whatsappNumber');
const logoUrlInput = document.getElementById('logoUrl');
const logoPreview = document.getElementById('logoPreview');
const primaryColorInput = document.getElementById('primaryColor');
const primaryColorText = document.getElementById('primaryColorText');
const secondaryColorInput = document.getElementById('secondaryColor');
const secondaryColorText = document.getElementById('secondaryColorText');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// ==========================================
//  الحالة
// ==========================================
let currentSettings = {};

// ==========================================
//  تحميل الإعدادات
// ==========================================
function loadSettings() {
  const settingsRef = collection(db, 'settings');
  
  onSnapshot(settingsRef, function(snapshot) {
    if (snapshot.empty) {
      console.log('ℹ️ No settings, using defaults');
      currentSettings = {};
      populateForm({});
      showContent();
      return;
    }
    
    snapshot.forEach(function(docSnap) {
      currentSettings = { id: docSnap.id, ...docSnap.data() };
    });
    
    console.log('⚙️ Settings loaded:', currentSettings);
    populateForm(currentSettings);
    showContent();
  }, function(error) {
    console.error('❌ Error:', error);
    if (loadingDiv) {
      loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>حدث خطأ</p>';
    }
  });
}

function showContent() {
  if (loadingDiv) loadingDiv.style.display = 'none';
  if (settingsContent) settingsContent.style.display = 'block';
}

function populateForm(settings) {
  if (storeNameInput) storeNameInput.value = settings.store_name || '';
  if (storeDescriptionInput) storeDescriptionInput.value = settings.store_description || '';
  if (whatsappNumberInput) whatsappNumberInput.value = settings.whatsapp_number || '';
  
  if (logoUrlInput) logoUrlInput.value = settings.logo_url || '';
  updateLogoPreview();
  
  const primary = settings.primary_color || '#e63946';
  const secondary = settings.secondary_color || '#0a0a0a';
  
  if (primaryColorInput) primaryColorInput.value = primary;
  if (primaryColorText) primaryColorText.value = primary;
  if (secondaryColorInput) secondaryColorInput.value = secondary;
  if (secondaryColorText) secondaryColorText.value = secondary;
}

// ==========================================
//  معاينة الشعار
// ==========================================
window.updateLogoPreview = function() {
  const url = logoUrlInput.value.trim();
  
  if (url) {
    logoPreview.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-exclamation-triangle\\'></i>'">`;
  } else {
    logoPreview.innerHTML = '<i class="fas fa-store"></i>';
  }
};

// ==========================================
//  الألوان
// ==========================================
window.updatePrimaryColor = function() {
  const color = primaryColorInput.value;
  if (primaryColorText) primaryColorText.value = color;
};

window.updatePrimaryColorText = function() {
  const color = primaryColorText.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    primaryColorInput.value = color;
  }
};

window.updateSecondaryColor = function() {
  const color = secondaryColorInput.value;
  if (secondaryColorText) secondaryColorText.value = color;
};

window.updateSecondaryColorText = function() {
  const color = secondaryColorText.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    secondaryColorInput.value = color;
  }
};

// ==========================================
//  حفظ
// ==========================================
saveBtn.addEventListener('click', async function() {
  const storeName = storeNameInput.value.trim();
  const storeDescription = storeDescriptionInput.value.trim();
  const whatsappNumber = whatsappNumberInput.value.trim();
  const logoUrl = logoUrlInput.value.trim();
  const primaryColor = primaryColorInput.value;
  const secondaryColor = secondaryColorInput.value;
  
  if (!storeName) {
    showStatus('❌ أدخل اسم المتجر', 'error');
    storeNameInput.focus();
    return;
  }
  
  if (!whatsappNumber) {
    showStatus('❌ أدخل رقم واتساب', 'error');
    whatsappNumberInput.focus();
    return;
  }
  
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
  
  try {
    const settingsData = {
      store_name: storeName,
      store_description: storeDescription,
      whatsapp_number: whatsappNumber,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      updated_at: serverTimestamp()
    };
    
    // حفظ في مستند 'main'
    const settingsRef = doc(db, 'settings', 'main');
    await setDoc(settingsRef, settingsData, { merge: true });
    
    console.log('✅ Settings saved');
    showStatus('✅ تم حفظ الإعدادات بنجاح', 'success');
    
  } catch (error) {
    console.error('❌ Error:', error);
    showStatus('❌ حدث خطأ، حاول مرة أخرى', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ الإعدادات';
  }
});

function showStatus(message, type) {
  saveStatus.textContent = message;
  saveStatus.className = 'save-status ' + type;
  
  setTimeout(function() {
    saveStatus.className = 'save-status';
  }, 3000);
}

// ==========================================
//  التشغيل
// ==========================================
console.log('✅ admin-settings.js loaded');
loadSettings();