// ==========================================
//  📝 Multi Store - checkout.js
//  منطق الطلب + 58 ولاية
// ==========================================

import { db, collection, addDoc, serverTimestamp } from './firebase-config.js';

// ==========================================
//  الولايات الـ 58
// ==========================================
const WILAYAS = [
  { code: '01', name: 'أدرار', office: 600, home: 1000, days: '3-7' },
  { code: '02', name: 'الشلف', office: 350, home: 600, days: '1-2' },
  { code: '03', name: 'الأغواط', office: 500, home: 750, days: '1-3' },
  { code: '04', name: 'أم البواقي', office: 400, home: 700, days: '1-3' },
  { code: '05', name: 'باتنة', office: 350, home: 650, days: '1-3' },
  { code: '06', name: 'بجاية', office: 300, home: 550, days: '1-3' },
  { code: '07', name: 'بسكرة', office: 500, home: 800, days: '2-4' },
  { code: '08', name: 'بشار', office: 700, home: 1050, days: '3-7' },
  { code: '09', name: 'البليدة', office: 0, home: 250, days: '24h' },
  { code: '10', name: 'البويرة', office: 400, home: 600, days: '1-2' },
  { code: '11', name: 'تمنراست', office: 600, home: 1200, days: '1-3' },
  { code: '12', name: 'تبسة', office: 450, home: 700, days: '1-3' },
  { code: '13', name: 'تلمسان', office: 400, home: 700, days: '1-3' },
  { code: '14', name: 'تيارت', office: 400, home: 700, days: '1-3' },
  { code: '15', name: 'تيزي وزو', office: 350, home: 550, days: '1-2' },
  { code: '16', name: 'الجزائر', office: 100, home: 250, days: '1-2' },
  { code: '17', name: 'الجلفة', office: 500, home: 750, days: '1-2' },
  { code: '18', name: 'جيجل', office: 400, home: 600, days: '1-3' },
  { code: '19', name: 'سطيف', office: 350, home: 550, days: '1-3' },
  { code: '20', name: 'سعيدة', office: 450, home: 750, days: '1-3' },
  { code: '21', name: 'سكيكدة', office: 400, home: 650, days: '1-3' },
  { code: '22', name: 'سيدي بلعباس', office: 400, home: 650, days: '1-3' },
  { code: '23', name: 'عنابة', office: 350, home: 550, days: '1-3' },
  { code: '24', name: 'قالمة', office: 400, home: 700, days: '1-3' },
  { code: '25', name: 'قسنطينة', office: 350, home: 550, days: '1-3' },
  { code: '26', name: 'المدية', office: 400, home: 600, days: '1-2' },
  { code: '27', name: 'مستغانم', office: 400, home: 600, days: '1-3' },
  { code: '28', name: 'المسيلة', office: 400, home: 650, days: '2-4' },
  { code: '29', name: 'معسكر', office: 400, home: 650, days: '1-3' },
  { code: '30', name: 'ورقلة', office: 500, home: 800, days: '2-4' },
  { code: '31', name: 'وهران', office: 300, home: 550, days: '1-3' },
  { code: '32', name: 'البيض', office: 550, home: 850, days: '2-4' },
  { code: '33', name: 'إليزي', office: null, home: null, days: 'غير متوفر' },
  { code: '34', name: 'برج بوعريريج', office: 400, home: 600, days: '1-3' },
  { code: '35', name: 'بومرداس', office: 350, home: 500, days: '1-2' },
  { code: '36', name: 'الطارف', office: 400, home: 700, days: '1-3' },
  { code: '37', name: 'تندوف', office: null, home: null, days: 'غير متوفر' },
  { code: '38', name: 'تيسمسيلت', office: 400, home: 700, days: '1-3' },
  { code: '39', name: 'الوادي', office: 500, home: 800, days: '2-4' },
  { code: '40', name: 'خنشلة', office: 450, home: 700, days: '1-3' },
  { code: '41', name: 'سوق أهراس', office: 450, home: 800, days: '1-3' },
  { code: '42', name: 'تيبازة', office: 350, home: 500, days: '1-2' },
  { code: '43', name: 'ميلة', office: 400, home: 650, days: '1-3' },
  { code: '44', name: 'عين الدفلى', office: 400, home: 600, days: '1-2' },
  { code: '45', name: 'النعامة', office: 600, home: 900, days: '1-3' },
  { code: '46', name: 'عين تموشنت', office: 450, home: 600, days: '1-3' },
  { code: '47', name: 'غرداية', office: 500, home: 850, days: '2-4' },
  { code: '48', name: 'غليزان', office: 450, home: 600, days: '1-3' },
  { code: '49', name: 'تيميمون', office: 700, home: 1200, days: '3-7' },
  { code: '50', name: 'برج باجي مختار', office: null, home: null, days: 'غير متوفر' },
  { code: '51', name: 'أولاد جلال', office: 500, home: 800, days: '3-7' },
  { code: '52', name: 'بني عباس', office: 1100, home: 1100, days: '3-7' },
  { code: '53', name: 'عين صالح', office: 700, home: 1200, days: '3-7' },
  { code: '54', name: 'عين قزام', office: null, home: null, days: 'غير متوفر' },
  { code: '55', name: 'تقرت', office: 500, home: 850, days: '2-4' },
  { code: '56', name: 'جانت', office: null, home: null, days: 'غير متوفر' },
  { code: '57', name: 'المغير', office: 900, home: 900, days: '2-4' },
  { code: '58', name: 'المنيعة', office: 600, home: 900, days: '3-7' }
];

// ==========================================
//  السلة
// ==========================================
let cart = JSON.parse(localStorage.getItem('multiStoreCart') || '[]');

// ==========================================
//  التشغيل
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  
  const loadingDiv = document.getElementById('loadingDiv');
  const checkoutContent = document.getElementById('checkoutContent');
  const emptyCart = document.getElementById('emptyCart');
  const orderItems = document.getElementById('orderItems');
  const productsSubtotalEl = document.getElementById('productsSubtotal');
  const shippingCostEl = document.getElementById('shippingCost');
  const grandTotalEl = document.getElementById('grandTotal');
  const wilayaSelect = document.getElementById('customerWilaya');
  const confirmBtn = document.getElementById('confirmOrderBtn');
  
  if (cart.length === 0) {
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    return;
  }
  
  if (loadingDiv) loadingDiv.style.display = 'none';
  if (checkoutContent) checkoutContent.style.display = 'block';
  
  // ملء الولايات
  WILAYAS.forEach(function(w) {
    const option = document.createElement('option');
    option.value = w.code;
    
    if (w.office === null) {
      option.textContent = `${w.code} - ${w.name} (غير متوفر)`;
      option.disabled = true;
    } else {
      option.textContent = `${w.code} - ${w.name}`;
    }
    
    wilayaSelect.appendChild(option);
  });
  
  // عرض المنتجات
  function renderOrderItems() {
    orderItems.innerHTML = cart.map(function(item) {
      return `
        <div class="order-item">
          <div>
            <div class="order-item-name">${escapeHtml(item.name)}</div>
            <div class="order-item-qty">الكمية: ${item.quantity}</div>
          </div>
          <div class="order-item-price">${(item.price * item.quantity).toLocaleString()} دج</div>
        </div>
      `;
    }).join('');
  }
  
  // حساب الإجمالي
  function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    productsSubtotalEl.textContent = subtotal.toLocaleString() + ' دج';
    
    const wilayaCode = wilayaSelect.value;
    
    if (!wilayaCode) {
      shippingCostEl.textContent = 'اختر الولاية';
      grandTotalEl.textContent = subtotal.toLocaleString() + ' دج';
      return;
    }
    
    const wilaya = WILAYAS.find(w => w.code === wilayaCode);
    if (!wilaya || wilaya.home === null) {
      shippingCostEl.textContent = 'غير متوفر';
      grandTotalEl.textContent = subtotal.toLocaleString() + ' دج';
      return;
    }
    
    const shipping = wilaya.home;
    shippingCostEl.textContent = shipping.toLocaleString() + ' دج';
    grandTotalEl.textContent = (subtotal + shipping).toLocaleString() + ' دج';
  }
  
  wilayaSelect.addEventListener('change', calculateTotals);
  
  // تأكيد الطلب
  confirmBtn.addEventListener('click', async function() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const wilayaCode = wilayaSelect.value;
    const address = document.getElementById('customerAddress').value.trim();
    const notes = document.getElementById('customerNotes').value.trim();
    
    if (!name) { showToast('❌ أدخل الاسم'); return; }
    if (!phone || phone.length < 9) { showToast('❌ أدخل رقم هاتف صحيح'); return; }
    if (!wilayaCode) { showToast('❌ اختر الولاية'); return; }
    if (!address || address.length < 5) { showToast('❌ أدخل العنوان'); return; }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const wilaya = WILAYAS.find(w => w.code === wilayaCode);
    const shipping = wilaya.home;
    const total = subtotal + shipping;
    
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    
    try {
      await addDoc(collection(db, 'orders'), {
        customer_name: name,
        phone: phone,
        wilaya: wilaya.code + ' - ' + wilaya.name,
        address: address,
        notes: notes || '',
        products: cart.map(i => ({ 
          id: i.id, 
          name: i.name, 
          price: i.price, 
          quantity: i.quantity 
        })),
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'pending',
        created_at: serverTimestamp()
      });
      
      console.log('✅ Order saved');
      localStorage.removeItem('multiStoreCart');
      showSuccess();
      
    } catch (error) {
      console.error('❌ Error:', error);
      showToast('❌ حدث خطأ، حاول مرة أخرى');
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> تأكيد الطلب';
    }
  });
  
  // إشعار
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(145deg, var(--primary), var(--primary-dark)); color: white;
      padding: 14px 24px; border-radius: 12px;
      font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 14px;
      z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      max-width: 90vw; text-align: center;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  
  // رسالة النجاح
  function showSuccess() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.9);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      padding: 20px;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
        border: 3px solid #4caf50;
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        max-width: 400px;
        font-family: 'Cairo', sans-serif;
      ">
        <div style="font-size: 70px; margin-bottom: 20px;">✅</div>
        <h2 style="color: #4caf50; font-size: 24px; margin-bottom: 15px;">تم استلام طلبك!</h2>
        <p style="color: #b0b0b0; font-size: 15px; margin-bottom: 25px;">
          سنتواصل معك قريباً
        </p>
        <a href="index.html" style="
          display: inline-block;
          padding: 14px 35px;
          background: linear-gradient(145deg, var(--primary), var(--primary-dark));
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
        ">🏠 العودة للرئيسية</a>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
  
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // التشغيل
  renderOrderItems();
  calculateTotals();
  console.log('✅ checkout.js loaded');
});