// ==========================================
//  🎯 Multi Store - app.js
//  منطق المتجر الكامل
// ==========================================

import { db, collection, onSnapshot } from './firebase-config.js';

// ==========================================
//  المتغيرات
// ==========================================
let products = [];
let categories = [];
let settings = {};
let cart = JSON.parse(localStorage.getItem('multiStoreCart') || '[]');
let currentCategory = 'all';

// ==========================================
//  التشغيل
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  
  const cartBtn = document.getElementById('cartBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const categoriesContainer = document.getElementById('categoriesContainer');
  
  // ===== الإعدادات =====
  function loadSettings() {
    const settingsRef = collection(db, 'settings');
    
    onSnapshot(settingsRef, function(snapshot) {
      settings = {};
      
      snapshot.forEach(function(doc) {
        settings = { id: doc.id, ...doc.data() };
      });
      
      console.log('⚙️ Settings loaded:', settings);
      applySettings();
    }, function(error) {
      console.error('❌ Error loading settings:', error);
    });
  }
  
  function applySettings() {
    const storeName = settings.store_name || 'متجري';
    const storeDescription = settings.store_description || 'أفضل المنتجات بأفضل الأسعار';
    const whatsappNumber = settings.whatsapp_number || '0542698759';
    const primaryColor = settings.primary_color || '#e63946';
    const secondaryColor = settings.secondary_color || '#0a0a0a';
    
    const elStoreName = document.getElementById('storeName');
    const elHeroName = document.getElementById('heroStoreName');
    const elHeroDesc = document.getElementById('heroDescription');
    const elFooterName = document.getElementById('footerStoreName');
    const elFooterYear = document.getElementById('footerYear');
    const elWhatsappNum = document.getElementById('whatsappNumber');
    const elWhatsappBtn = document.getElementById('whatsappBtn');
    
    if (elStoreName) elStoreName.textContent = storeName;
    if (elHeroName) elHeroName.textContent = storeName;
    if (elHeroDesc) elHeroDesc.textContent = storeDescription;
    if (elFooterName) elFooterName.textContent = storeName;
    if (elFooterYear) elFooterYear.textContent = storeName;
    if (elWhatsappNum) elWhatsappNum.textContent = whatsappNumber;
    
    if (elWhatsappBtn) {
      elWhatsappBtn.href = 'https://wa.me/213' + whatsappNumber.replace(/\D/g, '');
    }
    
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--bg-primary', secondaryColor);
    
    document.title = storeName;
  }
  
  // ===== الفئات =====
  function loadCategories() {
    const categoriesRef = collection(db, 'categories');
    
    onSnapshot(categoriesRef, function(snapshot) {
      categories = [];
      
      snapshot.forEach(function(doc) {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      console.log('📂 Categories loaded:', categories.length);
      renderCategories();
    }, function(error) {
      console.error('❌ Error loading categories:', error);
    });
  }
  
  function renderCategories() {
    if (!categoriesContainer) return;
    
    let html = `
      <button class="category-btn active" data-category="all">
        <i class="fas fa-th"></i> الكل
      </button>
    `;
    
    categories.forEach(function(cat) {
      const icon = cat.icon || 'fas fa-tag';
      html += `
        <button class="category-btn" data-category="${cat.id}">
          <i class="${icon}"></i> ${escapeHtml(cat.name)}
        </button>
      `;
    });
    
    categoriesContainer.innerHTML = html;
    
    const buttons = categoriesContainer.querySelectorAll('.category-btn');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderProducts();
      });
    });
  }
  
  // ===== المنتجات =====
  function loadProducts() {
    const productsRef = collection(db, 'products');
    
    onSnapshot(productsRef, function(snapshot) {
      products = [];
      
      snapshot.forEach(function(doc) {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name || '',
          price: data.price || 0,
          category: data.category || '',
          description: data.description || '',
          image: data.image || ''
        });
      });
      
      console.log('📦 Products loaded:', products.length);
      renderProducts();
    }, function(error) {
      console.error('❌ Error loading products:', error);
    });
  }
  
  function renderProducts() {
    if (!productsGrid) return;
    
    const filtered = currentCategory === 'all' 
      ? products 
      : products.filter(p => p.category === currentCategory);
    
    if (filtered.length === 0) {
      productsGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    productsGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    
    productsGrid.innerHTML = filtered.map(function(product) {
      const categoryName = getCategoryName(product.category);
      
      const imageHtml = product.image 
        ? `<img src="${product.image}" alt="${escapeHtml(product.name)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i>'">`
        : '<i class="fas fa-image"></i>';
      
      return `
        <div class="product-card">
          <div class="product-image">
            ${imageHtml}
          </div>
          <div class="product-info">
            ${categoryName ? `<span class="product-category">${escapeHtml(categoryName)}</span>` : ''}
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            ${product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : ''}
            <div class="product-price">${product.price.toLocaleString()}</div>
            <div class="product-actions">
              <button class="btn-add" onclick="window.addToCart('${product.id}')">
                <i class="fas fa-cart-plus"></i> أضف
              </button>
              <button class="btn-buy" onclick="window.buyNow('${product.id}')">
                <i class="fas fa-bolt"></i> اشترِ
              </button>
            </div>
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
  
  // ===== السلة =====
  window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ 
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1 
      });
    }
    
    saveCart();
    updateCartCount();
    showToast('✅ أضيف للسلة');
  };
  
  window.buyNow = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    cart = [{ 
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1 
    }];
    saveCart();
    updateCartCount();
    window.location.href = 'checkout.html';
  };
  
  window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
  };
  
  function saveCart() {
    localStorage.setItem('multiStoreCart', JSON.stringify(cart));
  }
  
  function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = total;
  }
  
  function renderCart() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
      cartItems.innerHTML = '';
      if (cartEmpty) cartEmpty.style.display = 'flex';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';
    
    cartItems.innerHTML = cart.map(function(item) {
      const imgHtml = item.image 
        ? `<img src="${item.image}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i>'">`
        : '<i class="fas fa-image"></i>';
      
      return `
        <div class="cart-item">
          <div class="cart-item-image">${imgHtml}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHtml(item.name)}</div>
            <div class="cart-item-price">${item.price.toLocaleString()} دج × ${item.quantity}</div>
          </div>
          <button class="cart-item-remove" onclick="window.removeFromCart('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    }).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = total.toLocaleString() + ' دج';
  }
  
  // ===== فتح/إغلاق السلة =====
  function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    renderCart();
  }
  
  function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
  
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  
  // ===== إتمام الطلب =====
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) {
        showToast('🛒 السلة فارغة');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
  
  // ===== إشعار =====
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(145deg, var(--primary), var(--primary-dark));
      color: white; padding: 12px 24px; border-radius: 12px;
      font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 14px;
      z-index: 9999; box-shadow: 0 4px 20px rgba(230, 57, 70, 0.5);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // ===== التشغيل =====
  console.log('✅ Multi Store: app.js loaded');
  
  updateCartCount();
  loadSettings();
  loadCategories();
  loadProducts();
});