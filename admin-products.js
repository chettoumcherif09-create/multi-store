// ==========================================
//  📦 Multi Store - admin-products.js
//  إدارة المنتجات
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
const addProductBtn = document.getElementById('addProductBtn');
const productsList = document.getElementById('productsList');
const loadingDiv = document.getElementById('loadingDiv');
const emptyState = document.getElementById('emptyState');
const productsCount = document.getElementById('productsCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productCategoryInput = document.getElementById('productCategory');
const productDescriptionInput = document.getElementById('productDescription');
const productImageInput = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');
const saveProductBtn = document.getElementById('saveProductBtn');

// ==========================================
//  الحالة
// ==========================================
let products = [];
let categories = [];
let editingId = null;

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
    fillCategorySelect();
  }, function(error) {
    console.error('❌ Error loading categories:', error);
  });
}

// ==========================================
//  ملء قائمة الفئات
// ==========================================
function fillCategorySelect() {
  if (!productCategoryInput) return;
  
  const currentValue = productCategoryInput.value;
  
  let html = '<option value="">-- اختر الفئة --</option>';
  
  categories.forEach(function(cat) {
    html += `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
  });
  
  productCategoryInput.innerHTML = html;
  
  if (currentValue) {
    productCategoryInput.value = currentValue;
  }
}

// ==========================================
//  تحميل المنتجات
// ==========================================
function loadProducts() {
  const productsRef = collection(db, 'products');
  
  onSnapshot(productsRef, function(snapshot) {
    products = [];
    
    snapshot.forEach(function(docSnap) {
      products.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    products.sort(function(a, b) {
      const t1 = a.created_at && a.created_at.seconds ? a.created_at.seconds : 0;
      const t2 = b.created_at && b.created_at.seconds ? b.created_at.seconds : 0;
      return t2 - t1;
    });
    
    console.log('📦 Products:', products.length);
    renderProducts();
  }, function(error) {
    console.error('❌ Error loading products:', error);
    if (loadingDiv) {
      loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>حدث خطأ</p>';
    }
  });
}

// ==========================================
//  عرض المنتجات
// ==========================================
function renderProducts() {
  if (!productsList) return;
  
  if (loadingDiv) loadingDiv.style.display = 'none';
  if (productsCount) productsCount.textContent = products.length;
  
  if (products.length === 0) {
    productsList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  productsList.style.display = 'grid';
  
  productsList.innerHTML = products.map(function(product) {
    const imgHtml = product.image 
      ? `<img src="${product.image}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i>'">`
      : '<i class="fas fa-image"></i>';
    
    const categoryName = getCategoryName(product.category);
    
    return `
      <div class="product-item">
        <div class="product-item-image">${imgHtml}</div>
        <div class="product-item-info">
          <div class="product-item-name">${escapeHtml(product.name)}</div>
          <div class="product-item-meta">
            <span class="product-item-price">${(product.price || 0).toLocaleString()} دج</span>
            ${categoryName ? `<span class="product-item-category">${escapeHtml(categoryName)}</span>` : ''}
          </div>
        </div>
        <div class="product-item-actions">
          <button class="btn-icon btn-edit" onclick="window.editProduct('${product.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-delete" onclick="window.deleteProduct('${product.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryName(categoryId) {
  if (!categoryId) return '';
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.name : '';
}

// ==========================================
//  فتح الإضافة
// ==========================================
addProductBtn.addEventListener('click', function() {
  editingId = null;
  modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة منتج';
  productNameInput.value = '';
  productPriceInput.value = '';
  productCategoryInput.value = '';
  productDescriptionInput.value = '';
  productImageInput.value = '';
  updatePreview();
  modalOverlay.classList.add('active');
  productNameInput.focus();
});

// ==========================================
//  فتح التعديل
// ==========================================
window.editProduct = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  editingId = productId;
  modalTitle.innerHTML = '<i class="fas fa-edit"></i> تعديل منتج';
  productNameInput.value = product.name || '';
  productPriceInput.value = product.price || '';
  productCategoryInput.value = product.category || '';
  productDescriptionInput.value = product.description || '';
  productImageInput.value = product.image || '';
  updatePreview();
  modalOverlay.classList.add('active');
  productNameInput.focus();
};

// ==========================================
//  معاينة الصورة
// ==========================================
window.updatePreview = function() {
  const url = productImageInput.value.trim();
  
  if (url) {
    imagePreview.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-exclamation-triangle\\'></i>'">`;
  } else {
    imagePreview.innerHTML = '<i class="fas fa-image"></i>';
  }
};

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
//  حفظ المنتج
// ==========================================
saveProductBtn.addEventListener('click', async function() {
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  const category = productCategoryInput.value;
  const description = productDescriptionInput.value.trim();
  const image = productImageInput.value.trim();
  
  if (!name) {
    showToast('❌ أدخل اسم المنتج');
    productNameInput.focus();
    return;
  }
  
  if (!price || price <= 0) {
    showToast('❌ أدخل سعراً صحيحاً');
    productPriceInput.focus();
    return;
  }
  
  if (!category) {
    showToast('❌ اختر الفئة');
    productCategoryInput.focus();
    return;
  }
  
  saveProductBtn.disabled = true;
  saveProductBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
  
  try {
    const productData = {
      name: name,
      price: price,
      category: category,
      description: description,
      image: image
    };
    
    if (editingId) {
      const productRef = doc(db, 'products', editingId);
      await updateDoc(productRef, productData);
      console.log('✅ Updated:', editingId);
      showToast('✅ تم تعديل المنتج');
    } else {
      productData.created_at = serverTimestamp();
      await addDoc(collection(db, 'products'), productData);
      console.log('✅ Added');
      showToast('✅ تم إضافة المنتج');
    }
    
    closeModal();
    
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('❌ حدث خطأ');
  } finally {
    saveProductBtn.disabled = false;
    saveProductBtn.innerHTML = '<i class="fas fa-save"></i> حفظ المنتج';
  }
});

// ==========================================
//  حذف
// ==========================================
window.deleteProduct = async function(productId) {
  if (!confirm('هل تريد حذف هذا المنتج؟')) return;
  
  try {
    await deleteDoc(doc(db, 'products', productId));
    console.log('🗑️ Deleted:', productId);
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
console.log('✅ admin-products.js loaded');
loadCategories();
loadProducts();