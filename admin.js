// ==========================================
//  🖥️ Multi Store - admin.js
//  لوحة التحكم + إدارة الطلبات
// ==========================================

import { db, auth, collection, doc, updateDoc, deleteDoc, onSnapshot, signOut, onAuthStateChanged } from './firebase-config.js';

// ==========================================
//  التحقق من الدخول
// ==========================================
onAuthStateChanged(auth, function(user) {
  if (!user) {
    window.location.href = 'admin-login.html';
    return;
  }
  console.log('✅ Admin:', user.email);
});

// ==========================================
//  العناصر
// ==========================================
const logoutBtn = document.getElementById('logoutBtn');
const loadingDiv = document.getElementById('loadingDiv');
const ordersContainer = document.getElementById('ordersContainer');
const emptyOrders = document.getElementById('emptyOrders');
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');
const deliveredCount = document.getElementById('deliveredCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

// ==========================================
//  الحالة
// ==========================================
let orders = [];

// ==========================================
//  تحميل الطلبات
// ==========================================
function loadOrders() {
  const ordersRef = collection(db, 'orders');
  
  onSnapshot(ordersRef, function(snapshot) {
    orders = [];
    
    snapshot.forEach(function(docSnap) {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    orders.sort(function(a, b) {
      const t1 = a.created_at && a.created_at.seconds ? a.created_at.seconds : 0;
      const t2 = b.created_at && b.created_at.seconds ? b.created_at.seconds : 0;
      return t2 - t1;
    });
    
    console.log('📦 Orders:', orders.length);
    renderOrders();
    updateStats();
  }, function(error) {
    console.error('❌ Error:', error);
    if (loadingDiv) {
      loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>حدث خطأ</p>';
    }
  });
}

// ==========================================
//  الإحصائيات
// ==========================================
function updateStats() {
  const total = orders.length;
  const pending = orders.filter(o => o.status !== 'delivered').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  
  if (totalCount) totalCount.textContent = total;
  if (pendingCount) pendingCount.textContent = pending;
  if (deliveredCount) deliveredCount.textContent = delivered;
}

// ==========================================
//  عرض الطلبات
// ==========================================
function renderOrders() {
  if (!ordersContainer) return;
  
  if (loadingDiv) loadingDiv.style.display = 'none';
  
  if (orders.length === 0) {
    ordersContainer.style.display = 'none';
    if (emptyOrders) emptyOrders.style.display = 'block';
    return;
  }
  
  if (emptyOrders) emptyOrders.style.display = 'none';
  ordersContainer.style.display = 'grid';
  
  ordersContainer.innerHTML = orders.map(function(order) {
    const isDelivered = order.status === 'delivered';
    const date = formatDate(order.created_at);
    const shortId = order.id.substring(0, 6).toUpperCase();
    
    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">#${shortId}</div>
            <span class="order-date">${date}</span>
          </div>
          <span class="order-status ${isDelivered ? 'delivered' : 'pending'}">
            ${isDelivered ? '✅ تم التسليم' : '⏳ قيد الانتظار'}
          </span>
        </div>
        
        <div class="order-info">
          <div class="order-info-row">
            <i class="fas fa-user"></i>
            <strong>${escapeHtml(order.customer_name || 'غير محدد')}</strong>
          </div>
          <div class="order-info-row">
            <i class="fas fa-phone"></i>
            ${escapeHtml(order.phone || '-')}
          </div>
          <div class="order-info-row">
            <i class="fas fa-map-marker-alt"></i>
            ${escapeHtml(order.wilaya || '-')}
          </div>
        </div>
        
        <div class="order-total">
          <span>💰 الإجمالي</span>
          <strong>${(order.total || 0).toLocaleString()} دج</strong>
        </div>
        
        <div class="order-actions">
          <button class="btn-action btn-view" onclick="window.viewOrder('${order.id}')">
            <i class="fas fa-eye"></i> تفاصيل
          </button>
          ${!isDelivered ? `
            <button class="btn-action btn-delivered" onclick="window.markDelivered('${order.id}')">
              <i class="fas fa-check"></i> تم التسليم
            </button>
          ` : ''}
          <button class="btn-action btn-delete" onclick="window.deleteOrder('${order.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
//  تفاصيل الطلب
// ==========================================
window.viewOrder = function(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const date = formatDate(order.created_at);
  const shortId = order.id.substring(0, 6).toUpperCase();
  
  let productsHtml = '';
  if (order.products && order.products.length > 0) {
    productsHtml = order.products.map(function(p) {
      return `
        <div class="modal-product">
          <span>${escapeHtml(p.name)} × ${p.quantity}</span>
          <strong>${(p.price * p.quantity).toLocaleString()} دج</strong>
        </div>
      `;
    }).join('');
  } else {
    productsHtml = '<p style="color:#666;">لا توجد منتجات</p>';
  }
  
  modalBody.innerHTML = `
    <div class="modal-section">
      <h4><i class="fas fa-user"></i> بيانات العميل</h4>
      <div class="modal-row"><span>الاسم</span><span>${escapeHtml(order.customer_name || '-')}</span></div>
      <div class="modal-row"><span>الهاتف</span><span>${escapeHtml(order.phone || '-')}</span></div>
      <div class="modal-row"><span>الولاية</span><span>${escapeHtml(order.wilaya || '-')}</span></div>
      <div class="modal-row"><span>العنوان</span><span>${escapeHtml(order.address || '-')}</span></div>
      ${order.notes ? `<div class="modal-row"><span>ملاحظات</span><span>${escapeHtml(order.notes)}</span></div>` : ''}
    </div>
    
    <div class="modal-section">
      <h4><i class="fas fa-shopping-bag"></i> المنتجات</h4>
      ${productsHtml}
    </div>
    
    <div class="modal-section">
      <h4><i class="fas fa-money-bill-wave"></i> الحساب</h4>
      <div class="modal-row"><span>مجموع المنتجات</span><span>${(order.subtotal || 0).toLocaleString()} دج</span></div>
      <div class="modal-row"><span>التوصيل</span><span>${(order.shipping || 0).toLocaleString()} دج</span></div>
      <div class="modal-row" style="border:none; padding-top:12px;">
        <span style="color:#ffd700; font-weight:900;">الإجمالي</span>
        <span style="color:#ffd700; font-size:18px; font-weight:900;">${(order.total || 0).toLocaleString()} دج</span>
      </div>
    </div>
    
    <div class="modal-section">
      <h4><i class="fas fa-info-circle"></i> معلومات</h4>
      <div class="modal-row"><span>رقم الطلب</span><span>#${shortId}</span></div>
      <div class="modal-row"><span>التاريخ</span><span>${date}</span></div>
      <div class="modal-row"><span>الحالة</span><span>${order.status === 'delivered' ? '✅ تم التسليم' : '⏳ قيد الانتظار'}</span></div>
    </div>
    
    <button class="btn-action btn-view" style="width:100%; padding:14px; margin-top:10px; font-size:14px;" onclick="window.closeModal()">
      <i class="fas fa-times"></i> إغلاق
    </button>
  `;
  
  modalOverlay.classList.add('active');
};

window.closeModal = function() {
  modalOverlay.classList.remove('active');
};

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
  });
}

// ==========================================
//  تم التسليم
// ==========================================
window.markDelivered = async function(orderId) {
  if (!confirm('هل تم تسليم هذا الطلب؟')) return;
  
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'delivered',
      delivered_at: new Date().toISOString()
    });
    console.log('✅ Delivered:', orderId);
  } catch (error) {
    console.error('❌ Error:', error);
    alert('حدث خطأ');
  }
};

// ==========================================
//  حذف
// ==========================================
window.deleteOrder = async function(orderId) {
  if (!confirm('هل تريد حذف هذا الطلب نهائياً؟')) return;
  
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    console.log('🗑️ Deleted:', orderId);
  } catch (error) {
    console.error('❌ Error:', error);
    alert('حدث خطأ');
  }
};

// ==========================================
//  تسجيل الخروج
// ==========================================
if (logoutBtn) {
  logoutBtn.addEventListener('click', async function() {
    if (!confirm('هل تريد تسجيل الخروج؟')) return;
    
    try {
      await signOut(auth);
      window.location.href = 'admin-login.html';
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  });
}

// ==========================================
//  دوال مساعدة
// ==========================================
function formatDate(timestamp) {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) date = timestamp.toDate();
  else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
  else date = new Date(timestamp);
  
  if (isNaN(date.getTime())) return '-';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
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
console.log('✅ admin.js loaded');
loadOrders();