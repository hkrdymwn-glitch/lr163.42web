
// Load data from localStorage
let products = JSON.parse(localStorage.getItem('products')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let discountCodes = JSON.parse(localStorage.getItem('discountCodes')) || {
    'WELCOME10': { discount: 10, type: 'percentage' },
    'SAVE50': { discount: 50, type: 'fixed' }
};

// Load reviews data
let reviews = JSON.parse(localStorage.getItem('reviews')) || {};

// Admin authentication
let isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

// Check admin access
function checkAdminAccess() {
    const password = document.getElementById('adminPassword').value;
    const correctPassword = 'admin123'; // في التطبيق الحقيقي يجب استخدام تشفير قوي
    
    if (password === correctPassword) {
        isAdminAuthenticated = true;
        localStorage.setItem('isAdminAuthenticated', 'true');
        
        document.getElementById('adminAuthOverlay').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        
        initializeAdminPanel();
        showNotification('مرحباً بك في لوحة الإدارة!');
        
        // Auto logout after 1 hour for security
        setTimeout(() => {
            localStorage.setItem('isAdminAuthenticated', 'false');
            location.reload();
        }, 3600000);
    } else {
        showNotification('كلمة مرور خاطئة!');
        document.getElementById('adminPassword').value = '';
    }
}

// Initialize admin panel
function initializeAdminPanel() {
    updateStatistics();
    displayProducts();
    displayUsers();
    displayOrders();
    displayDiscountCodes();
    displayReviewsManagement();
    displayBannersManagement();
    
    // Setup form handlers
    setupProductForm();
    setupDiscountForm();
    setupBannerForm();
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (isAdminAuthenticated) {
        document.getElementById('adminAuthOverlay').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        initializeAdminPanel();
    }
    
    // Handle Enter key for password input
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAdminAccess();
        }
    });
});

// Update statistics
function updateStatistics() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalUsers').textContent = users.length;
    
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalSales').textContent = totalSales + ' جنيه';
}

// Setup product form
function setupProductForm() {
    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const discount = parseFloat(document.getElementById('productDiscount').value) || 0;
        const description = document.getElementById('productDescription').value;
        const featuresInput = document.getElementById('productFeatures').value;
        const features = featuresInput ? featuresInput.split(',').map(f => f.trim()) : [];
        const imageFile = document.getElementById('productImage').files[0];
        
        let imageUrl = 'https://via.placeholder.com/400x250?text=صورة+غير+متاحة';
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageUrl = e.target.result;
                addProduct(name, price, category, imageUrl, discount, description, features);
            };
            reader.readAsDataURL(imageFile);
        } else {
            addProduct(name, price, category, imageUrl, discount, description, features);
        }
    });
}

// Add product
function addProduct(name, price, category, imageUrl, discount = 0, description = '', features = []) {
    const product = {
        id: Date.now(),
        name,
        price,
        category,
        image: imageUrl,
        rating: 4.0,
        reviews: [],
        description: description || `منتج عالي الجودة من فئة ${getCategoryName(category)}`,
        features: features.length > 0 ? features : ['جودة عالية', 'ضمان شامل', 'شحن مجاني'],
        inStock: true,
        discount
    };
    
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    
    displayProducts();
    updateStatistics();
    showNotification('تم إضافة المنتج بنجاح!');
    
    // Reset form
    document.getElementById('productForm').reset();
}

// Display products in admin
function displayProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-admin-item';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-admin-image" onerror="this.src='https://via.placeholder.com/80x80?text=صورة'">
            <div class="product-admin-info">
                <strong>${product.name}</strong><br>
                <span>${product.price} جنيه</span><br>
                <small>فئة: ${getCategoryName(product.category)}</small>
            </div>
            <div class="product-admin-actions">
                <button onclick="editProduct(${product.id})" class="btn-success">تعديل</button>
                <button onclick="deleteProduct(${product.id})" class="btn-danger">حذف</button>
            </div>
        `;
        productsList.appendChild(productDiv);
    });
}

// Get category name in Arabic
function getCategoryName(category) {
    const categories = {
        'electronics': 'إلكترونيات',
        'clothing': 'ملابس',
        'home': 'منزل',
        'sports': 'رياضة'
    };
    return categories[category] || category;
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        
        // Remove existing product and let form add the updated one
        deleteProduct(productId);
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts();
        updateStatistics();
        showNotification('تم حذف المنتج بنجاح!');
    }
}

// Setup discount form
function setupDiscountForm() {
    const discountForm = document.getElementById('discountForm');
    discountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const code = document.getElementById('discountCodeInput').value.toUpperCase();
        const value = parseFloat(document.getElementById('discountValue').value);
        const type = document.getElementById('discountType').value;
        
        discountCodes[code] = { discount: value, type };
        localStorage.setItem('discountCodes', JSON.stringify(discountCodes));
        
        displayDiscountCodes();
        showNotification('تم إضافة كود الخصم بنجاح!');
        
        // Reset form
        discountForm.reset();
    });
}

// Display discount codes
function displayDiscountCodes() {
    const discountsList = document.getElementById('discountsList');
    discountsList.innerHTML = '';
    
    Object.entries(discountCodes).forEach(([code, discount]) => {
        const discountDiv = document.createElement('div');
        discountDiv.style.cssText = `
            background: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const discountText = discount.type === 'percentage' 
            ? `${discount.discount}%` 
            : `${discount.discount} جنيه`;
            
        discountDiv.innerHTML = `
            <div>
                <strong>${code}</strong><br>
                <span>خصم: ${discountText}</span>
            </div>
            <button onclick="deleteDiscountCode('${code}')" class="btn-danger">حذف</button>
        `;
        discountsList.appendChild(discountDiv);
    });
}

// Delete discount code
function deleteDiscountCode(code) {
    if (confirm('هل أنت متأكد من حذف هذا الكود؟')) {
        delete discountCodes[code];
        localStorage.setItem('discountCodes', JSON.stringify(discountCodes));
        displayDiscountCodes();
        showNotification('تم حذف كود الخصم!');
    }
}

// Display users
function displayUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.joinDate}</td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        
        const statusClass = order.status === 'completed' ? 'status-completed' : 'status-pending';
        const statusText = order.status === 'completed' ? 'مكتمل' : 'في الانتظار';
        
        const itemsList = order.items.map(item => 
            `${item.name} × ${item.quantity}`
        ).join(', ');
        
        orderDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>طلب #${order.id}</strong>
                    <span class="order-status ${statusClass}">${statusText}</span><br>
                    <strong>العميل:</strong> ${order.customerName}<br>
                    <strong>الهاتف:</strong> ${order.customerPhone}<br>
                    <strong>العنوان:</strong> ${order.customerAddress}<br>
                    <strong>المنتجات:</strong> ${itemsList}<br>
                    ${order.discountCode ? `<strong>كود الخصم:</strong> ${order.discountCode}<br>` : ''}
                    <strong>المجموع:</strong> ${order.total} جنيه<br>
                    <strong>التاريخ:</strong> ${order.date}
                </div>
                <div>
                    ${order.status === 'pending' ? 
                        `<button onclick="completeOrder(${order.id})" class="btn-success">إتمام الطلب</button>` : 
                        '<span style="color: #28a745;">✓ مكتمل</span>'
                    }
                </div>
            </div>
        `;
        ordersList.appendChild(orderDiv);
    });
}

// Complete order
function completeOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders();
        updateStatistics();
        showNotification('تم إتمام الطلب بنجاح!');
    }
}

// Display reviews management
function displayReviewsManagement() {
    const reviewsDiv = document.getElementById('reviewsManagement');
    reviewsDiv.innerHTML = '';
    
    Object.entries(reviews).forEach(([productId, productReviews]) => {
        const product = products.find(p => p.id == productId);
        if (!product) return;
        
        const productReviewsDiv = document.createElement('div');
        productReviewsDiv.style.cssText = `
            background: white;
            margin: 15px 0;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #ddd;
        `;
        
        productReviewsDiv.innerHTML = `
            <h4>${product.name} (${productReviews.length} مراجعة)</h4>
            <div style="margin: 10px 0;">
                متوسط التقييم: <strong>${product.rating.toFixed(1)} ⭐</strong>
            </div>
            ${productReviews.map(review => `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <strong>${review.name}</strong>
                        <div>
                            <span>${generateStars(review.rating)}</span>
                            <button onclick="deleteReview(${productId}, ${review.id})" class="btn-danger" style="margin-right: 10px; padding: 5px 10px; font-size: 12px;">حذف</button>
                        </div>
                    </div>
                    <p>${review.text}</p>
                    <small style="color: #666;">${review.date}</small>
                </div>
            `).join('')}
        `;
        
        reviewsDiv.appendChild(productReviewsDiv);
    });
    
    if (Object.keys(reviews).length === 0) {
        reviewsDiv.innerHTML = '<p style="text-align: center; color: #666;">لا توجد مراجعات بعد</p>';
    }
}

// Generate stars for admin
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '⭐';
        }
    }
    return stars;
}

// Delete review
function deleteReview(productId, reviewId) {
    if (confirm('هل أنت متأكد من حذف هذه المراجعة؟')) {
        reviews[productId] = reviews[productId].filter(review => review.id !== reviewId);
        
        if (reviews[productId].length === 0) {
            delete reviews[productId];
        } else {
            // Recalculate product rating
            const product = products.find(p => p.id == productId);
            if (product) {
                const allRatings = reviews[productId].map(r => r.rating);
                product.rating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
                localStorage.setItem('products', JSON.stringify(products));
            }
        }
        
        localStorage.setItem('reviews', JSON.stringify(reviews));
        displayReviewsManagement();
        showNotification('تم حذف المراجعة!');
    }
}

// Banner/Advertisement management
let banners = JSON.parse(localStorage.getItem('banners')) || [];

function setupBannerForm() {
    const bannerForm = document.getElementById('bannerForm');
    if (bannerForm) {
        bannerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('bannerTitle').value;
            const description = document.getElementById('bannerDescription').value;
            const imageFile = document.getElementById('bannerImage').files[0];
            
            let imageUrl = '';
            
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imageUrl = e.target.result;
                    addBanner(title, description, imageUrl);
                };
                reader.readAsDataURL(imageFile);
            } else {
                addBanner(title, description, imageUrl);
            }
        });
    }
}

function addBanner(title, description, imageUrl) {
    const banner = {
        id: Date.now(),
        title,
        description,
        image: imageUrl,
        active: true,
        createdDate: new Date().toLocaleDateString('ar-EG')
    };
    
    banners.push(banner);
    localStorage.setItem('banners', JSON.stringify(banners));
    
    displayBannersManagement();
    showNotification('تم إضافة الإعلان بنجاح!');
    
    document.getElementById('bannerForm').reset();
}

function displayBannersManagement() {
    const bannersDiv = document.getElementById('bannersManagement');
    if (!bannersDiv) return;
    
    bannersDiv.innerHTML = '';
    
    banners.forEach(banner => {
        const bannerDiv = document.createElement('div');
        bannerDiv.style.cssText = `
            background: white;
            margin: 15px 0;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #ddd;
            display: flex;
            gap: 15px;
            align-items: center;
        `;
        
        bannerDiv.innerHTML = `
            ${banner.image ? `<img src="${banner.image}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
            <div style="flex: 1;">
                <strong>${banner.title}</strong><br>
                <p style="color: #666; margin: 5px 0;">${banner.description}</p>
                <small>تاريخ الإنشاء: ${banner.createdDate}</small>
                <div>
                    <span style="color: ${banner.active ? '#28a745' : '#dc3545'};">
                        ${banner.active ? '🟢 نشط' : '🔴 غير نشط'}
                    </span>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="toggleBanner(${banner.id})" class="${banner.active ? 'btn-danger' : 'btn-success'}">
                    ${banner.active ? 'إيقاف' : 'تفعيل'}
                </button>
                <button onclick="deleteBanner(${banner.id})" class="btn-danger">حذف</button>
            </div>
        `;
        
        bannersDiv.appendChild(bannerDiv);
    });
    
    if (banners.length === 0) {
        bannersDiv.innerHTML = '<p style="text-align: center; color: #666;">لا توجد إعلانات</p>';
    }
}

function toggleBanner(bannerId) {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
        banner.active = !banner.active;
        localStorage.setItem('banners', JSON.stringify(banners));
        displayBannersManagement();
        showNotification(banner.active ? 'تم تفعيل الإعلان!' : 'تم إيقاف الإعلان!');
    }
}

function deleteBanner(bannerId) {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
        banners = banners.filter(b => b.id !== bannerId);
        localStorage.setItem('banners', JSON.stringify(banners));
        displayBannersManagement();
        showNotification('تم حذف الإعلان!');
    }
}

// Enhanced analytics
function getDetailedAnalytics() {
    const userActivities = JSON.parse(localStorage.getItem('userActivities')) || [];
    
    // Most viewed products
    const productViews = {};
    userActivities.filter(a => a.action === 'view_product').forEach(a => {
        productViews[a.data.productId] = (productViews[a.data.productId] || 0) + 1;
    });
    
    // Daily sales
    const dailySales = {};
    orders.forEach(order => {
        dailySales[order.date] = (dailySales[order.date] || 0) + order.total;
    });
    
    return {
        productViews,
        dailySales,
        totalViews: userActivities.length,
        conversionRate: orders.length / Math.max(userActivities.length, 1) * 100
    };
}

// Show notification (same as main site)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 2000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}
