// ==========================================
//  📂 Multi Store - admin-categories.js
//  إدارة الفئات
// ==========================================

import { db, auth, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, onAuthStateChanged } from './firebase-config.js';

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
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');
const loadingDiv = document.getElementById('loadingDiv');
const emptyState = document.getElementById('emptyState');
const categoriesCount = document.getElementById('categoriesCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const categoryNameInput = document.getElementById('categoryName');
const categoryOrderInput = document.getElementById('categoryOrder');
const iconPreview = document.getElementById('iconPreview');
const iconPicker = document.getElementById('iconPicker');
const saveCategoryBtn = document.getElementById('saveCategoryBtn');

// ==========================================
//  الحالة
// ==========================================
let categories = [];
let editingId = null;
let selectedIcon = 'fas fa-tag';

// ==========================================
//  تحميل الفئات
// ==========================================
function loadCategories() {
  const categoriesRef = collection(db, 'categories');
  
  onSnapshot(categoriesRef, function(snapshot) {
    categories = [];
    
    snapshot.forEach(function(docSnap) {
      categories.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    categories.sort(function(a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    
    console.log('📂 Categories:', categories.length);
    renderCategories();
  }, function(error) {
    console.error('❌ Error:', error);
    if (loadingDiv) {
      loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>حدث خطأ</p>';
    }
  });
}

// ==========================================
//  عرض الفئات
// ==========================================
function renderCategories() {
  if (!categoriesList) return;
  
  if (loadingDiv) loadingDiv.style.display = 'none';
  if (categoriesCount) categoriesCount.textContent = categories.length;
  
  if (categories.length === 0) {
    categoriesList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  categoriesList.style.display = 'grid';
  
  categoriesList.innerHTML = categories.map(function(cat) {
    const icon = cat.icon || 'fas fa-tag';
    
    return `
      <div class="category-item">
        <div class="category-icon">
          <i class="${icon}"></i>
        </div>
        <div class="category-info">
          <div class="category-name">${escapeHtml(cat.name)}</div>
          <div class="category-order">ترتيب: ${cat.order || 1}</div>
        </div>
        <div class="category-actions">
          <button class="btn-icon btn-edit" onclick="window.editCategory('${cat.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-delete" onclick="window.deleteCategory('${cat.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
//  فتح الإضافة
// ==========================================
addCategoryBtn.addEventListener('click', function() {
  editingId = null;
  modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة فئة';
  categoryNameInput.value = '';
  categoryOrderInput.value = categories.length + 1;
  selectedIcon = 'fas fa-tag';
  updateIconSelection();
  modalOverlay.classList.add('active');
  categoryNameInput.focus();
});

// ==========================================
//  فتح التعديل
// ==========================================
window.editCategory = function(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return;
  
  editingId = categoryId;
  modalTitle.innerHTML = '<i class="fas fa-edit"></i> تعديل فئة';
  categoryNameInput.value = cat.name || '';
  categoryOrderInput.value = cat.order || 1;
  selectedIcon = cat.icon || 'fas fa-tag';
  updateIconSelection();
  modalOverlay.classList.add('active');
  categoryNameInput.focus();
};

// ==========================================
//  اختيار الأيقونة
// ==========================================
if (iconPicker) {
  const iconOptions = iconPicker.querySelectorAll('.icon-option');
  
  iconOptions.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      selectedIcon = btn.dataset.icon;
      updateIconSelection();
    });
  });
}

function updateIconSelection() {
  const iconOptions = iconPicker.querySelectorAll('.icon-option');
  
  iconOptions.forEach(function(btn) {
    if (btn.dataset.icon === selectedIcon) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
  
  iconPreview.innerHTML = `<i class="${selectedIcon}"></i>`;
}

// ==========================================
//  إغلاق
// ==========================================
function closeModal() {
  modalOverlay.classList.remove('active');
  editingId = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) {
  if (e.target === modalOverlay) closeModal();
});

// ==========================================
//  حفظ الفئة
// ==========================================
saveCategoryBtn.addEventListener('click', async function() {
  const name = categoryNameInput.value.trim();
  const order = parseInt(categoryOrderInput.value) || 1;
  
  if (!name) {
    showToast('❌ أدخل اسم الفئة');
    categoryNameInput.focus();
    return;
  }
  
  saveCategoryBtn.disabled = true;
  saveCategoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
  
  try {
    const categoryData = {
      name: name,
      icon: selectedIcon,
      order: order
    };
    
    if (editingId) {
      const categoryRef = doc(db, 'categories', editingId);
      await updateDoc(categoryRef, categoryData);
      console.log('✅ Updated:', editingId);
      showToast('✅ تم تعديل الفئة');
    } else {
      categoryData.created_at = serverTimestamp();
      await addDoc(collection(db, 'categories'), categoryData);
      console.log('✅ Added');
      showToast('✅ تم إضافة الفئة');
    }
    
    closeModal();
    
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('❌ حدث خطأ');
  } finally {
    saveCategoryBtn.disabled = false;
    saveCategoryBtn.innerHTML = '<i class="fas fa-save"></i> حفظ الفئة';
  }
});

// ==========================================
//  حذف
// ==========================================
window.deleteCategory = async function(categoryId) {
  if (!confirm('هل تريد حذف هذه الفئة؟')) return;
  
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    console.log('🗑️ Deleted:', categoryId);
    showToast('✅ تم الحذف');
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('❌ حدث خطأ');
  }
};

// ==========================================
//  إشعار
// ==========================================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(145deg, var(--primary), var(--primary-dark)); color: white;
    padding: 14px 24px; border-radius: 12px;
    font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 14px;
    z-index: 99999; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    max-width: 90vw; text-align: center;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================
//  التشغيل
// ==========================================
console.log('✅ admin-categories.js loaded');
loadCategories();