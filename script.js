
// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let discountCodes = JSON.parse(localStorage.getItem('discountCodes')) || {
    'WELCOME10': { discount: 10, type: 'percentage' },
    'SAVE50': { discount: 50, type: 'fixed' }
};

// Authentication state
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

// Initialize products if empty
if (products.length === 0) {
    products = [
        {
            id: 1,
            name: 'لابتوب Dell XPS 13',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
            category: 'electronics',
            rating: 4.5,
            reviews: [],
            description: 'لابتوب عالي الأداء مع معالج Intel Core i7 وذاكرة 16GB RAM',
            features: ['معالج Intel Core i7', 'ذاكرة 16GB RAM', 'تخزين SSD 512GB', 'شاشة 13.3 بوصة Full HD'],
            inStock: true,
            discount: 0
        },
        {
            id: 2,
            name: 'تيشيرت قطني',
            price: 150,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            category: 'clothing',
            rating: 4.2,
            reviews: [],
            description: 'تيشيرت قطني عالي الجودة، مريح ومناسب للاستخدام اليومي',
            features: ['قطن 100%', 'مقاوم للانكماش', 'ألوان ثابتة', 'مقاسات متعددة'],
            inStock: true,
            discount: 10
        },
        {
            id: 3,
            name: 'مجموعة أدوات مطبخ',
            price: 800,
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
            category: 'home',
            rating: 4.7,
            reviews: [],
            description: 'مجموعة كاملة من أدوات المطبخ الأساسية بجودة عالية',
            features: ['ستانلس ستيل', '15 قطعة', 'مقاومة للصدأ', 'سهلة التنظيف'],
            inStock: true,
            discount: 15
        },
        {
            id: 4,
            name: 'دمبل 10 كيلو',
            price: 300,
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
            category: 'sports',
            rating: 4.3,
            reviews: [],
            description: 'دمبل قابل للتعديل بوزن 10 كيلو، مثالي لتمارين القوة',
            features: ['وزن قابل للتعديل', 'قبضة مريحة', 'مطاط عالي الجودة', 'تصميم مدمج'],
            inStock: true,
            discount: 0
        }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

// Initialize other data
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || {};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupAuthForms();
    updateCartCount();
    initializeBanners();
});

// Check authentication
function checkAuthentication() {
    const contentOverlay = document.getElementById('contentOverlay');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginText = document.getElementById('loginText');
    
    if (isAuthenticated && currentUser) {
        // User is authenticated
        contentOverlay.style.display = 'none';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        // Update login button text to show username
        if (loginText) {
            loginText.textContent = `مرحباً ${currentUser.username}`;
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            loginBtn.onclick = function() {
                showNotification(`مرحباً ${currentUser.username}! أهلاً بك في متجر الهضبة`);
            };
        }
        
        displayProducts();
    } else {
        // User is not authenticated
        contentOverlay.style.display = 'block';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Toggle login modal
function toggleLogin() {
    const modal = document.getElementById('loginModal');
    if (isAuthenticated) {
        // If authenticated, show user info instead
        showNotification(`مرحباً ${currentUser.username}!`);
        return;
    }
    
    if (modal.style.display === 'block') {
        // Only allow closing if user is authenticated
        if (isAuthenticated) {
            modal.style.display = 'none';
        }
    } else {
        modal.style.display = 'block';
    }
}

// Setup authentication forms
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Find user
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Successful login
                currentUser = user;
                isAuthenticated = true;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isAuthenticated', 'true');
                
                showNotification(`مرحباً ${user.username}! تم تسجيل الدخول بنجاح`);
                document.getElementById('loginModal').style.display = 'none';
                checkAuthentication();
            } else {
                showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة!');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const phone = document.getElementById('phone').value;
            
            // Validation
            if (password !== confirmPassword) {
                showNotification('كلمة المرور غير متطابقة!');
                return;
            }
            
            if (users.find(u => u.email === email)) {
                showNotification('البريد الإلكتروني مستخدم بالفعل!');
                return;
            }
            
            if (users.find(u => u.username === username)) {
                showNotification('اسم المستخدم مستخدم بالفعل!');
                return;
            }
            
            // Create new user
            const user = {
                id: Date.now(),
                username,
                email,
                password, // في التطبيق الحقيقي يجب تشفير كلمة المرور
                phone,
                joinDate: new Date().toLocaleDateString('ar-EG'),
                isAdmin: false
            };
            
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto login after registration
            currentUser = user;
            isAuthenticated = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('isAuthenticated', 'true');
            
            showNotification(`مرحباً ${username}! تم إنشاء حسابك بنجاح`);
            document.getElementById('loginModal').style.display = 'none';
            checkAuthentication();
        });
    }
    
    // Review form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isAuthenticated) {
                showNotification('يجب تسجيل الدخول لإضافة مراجعة!');
                return;
            }
            
            const productId = window.currentReviewProductId;
            const rating = window.currentRating || 5;
            const name = document.getElementById('reviewerName').value || currentUser.username;
            const text = document.getElementById('reviewText').value;
            
            if (!reviews[productId]) {
                reviews[productId] = [];
            }
            
            const review = {
                id: Date.now(),
                name,
                rating,
                text,
                date: new Date().toLocaleDateString('ar-EG'),
                userId: currentUser.id
            };
            
            reviews[productId].push(review);
            localStorage.setItem('reviews', JSON.stringify(reviews));
            
            // Update product rating
            const product = products.find(p => p.id === productId);
            if (product) {
                const allRatings = reviews[productId].map(r => r.rating);
                product.rating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
                localStorage.setItem('products', JSON.stringify(products));
            }
            
            closeReviewModal();
            showProductDetail(productId);
            showNotification('تم إضافة مراجعتك بنجاح!');
        });
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isAuthenticated) {
                showNotification('يجب تسجيل الدخول لإتمام الطلب!');
                return;
            }
            
            const order = {
                id: Date.now(),
                userId: currentUser.id,
                customerName: document.getElementById('customerName').value || currentUser.username,
                customerPhone: document.getElementById('customerPhone').value || currentUser.phone,
                customerAddress: document.getElementById('customerAddress').value,
                items: [...cart],
                total: parseFloat(document.getElementById('finalTotal').textContent),
                discountCode: window.discountApplied || null,
                date: new Date().toLocaleDateString('ar-EG'),
                status: 'pending'
            };
            
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Send to WhatsApp
            sendOrderToWhatsApp(order);
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            closeCheckout();
            showNotification('تم إرسال طلبك بنجاح! سيتم توجيهك للواتساب لإتمام الدفع.');
        });
    }
}

// Switch between login and register forms
function switchToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'إنشاء حساب جديد';
}

function switchToLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('authTitle').textContent = 'تسجيل الدخول';
}

// Logout function
function logout() {
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('currentUser');
    localStorage.setItem('isAuthenticated', 'false');
    
    // Clear user-specific data
    cart = [];
    saveCart();
    updateCartCount();
    
    showNotification('تم تسجيل الخروج بنجاح!');
    checkAuthentication();
}

// Require authentication for cart and checkout
function addToCart(productId) {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول لإضافة المنتجات للسلة!');
        toggleLogin();
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product) {
        const discountedPrice = product.discount > 0 ? 
            product.price * (1 - product.discount / 100) : product.price;
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ 
                ...product, 
                quantity: 1,
                finalPrice: Math.round(discountedPrice)
            });
        }
        updateCartCount();
        saveCart();
        showNotification('تم إضافة المنتج للسلة بنجاح!');
    }
}

function toggleCart() {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول لعرض سلة التسوق!');
        toggleLogin();
        return;
    }
    
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        displayCartItems();
        modal.style.display = 'block';
    }
}

function toggleWishlist(productId) {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول لإضافة المنتجات للمفضلة!');
        toggleLogin();
        return;
    }
    
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(productId);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayProducts();
    showNotification(index > -1 ? 'تم إزالة المنتج من المفضلة' : 'تم إضافة المنتج للمفضلة');
}

// Admin access removed for security

// Display products
function displayProducts(productsToShow = products) {
    if (!isAuthenticated) return;
    
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const originalPrice = product.price;
        const discountedPrice = product.discount > 0 ? 
            originalPrice * (1 - product.discount / 100) : originalPrice;
        
        const isInWishlist = wishlist.includes(product.id);
        
        productCard.innerHTML = `
            ${product.discount > 0 ? `<div class="product-badge">خصم ${product.discount}%</div>` : ''}
            <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                <i class="fas fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/400x250?text=صورة+غير+متاحة'"
                 onclick="showProductDetail(${product.id})">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-rating">
                    <div class="stars">${generateStars(product.rating)}</div>
                    <span class="rating-text">(${product.rating}) ${getReviewCount(product.id)} مراجعة</span>
                </div>
                <div class="product-price">
                    ${product.discount > 0 ? 
                        `<span style="text-decoration: line-through; color: #999; font-size: 16px;">${originalPrice} جنيه</span><br>` 
                        : ''}
                    ${Math.round(discountedPrice)} جنيه
                </div>
                <div class="product-actions">
                    <button class="quick-view" onclick="showProductDetail(${product.id})">عرض سريع</button>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        أضف للسلة
                    </button>
                </div>
                <button class="compare-btn" onclick="addToCompare(${product.id})">
                    <i class="fas fa-balance-scale"></i> مقارنة
                </button>
            </div>
        `;
        grid.appendChild(productCard);
    });
    
    displayRecommendations();
}

// Generate star rating
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '★';
        } else if (i - 0.5 <= rating) {
            stars += '☆';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

// Get review count
function getReviewCount(productId) {
    return reviews[productId] ? reviews[productId].length : 0;
}

// Show product detail
function showProductDetail(productId) {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول لعرض تفاصيل المنتجات!');
        toggleLogin();
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productDetailContent');
    
    const originalPrice = product.price;
    const discountedPrice = product.discount > 0 ? 
        originalPrice * (1 - product.discount / 100) : originalPrice;
    
    const productReviews = reviews[productId] || [];
    
    content.innerHTML = `
        <div class="product-detail-content">
            <div>
                <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            </div>
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <div class="product-rating">
                    <div class="stars">${generateStars(product.rating)}</div>
                    <span class="rating-text">(${product.rating}) ${productReviews.length} مراجعة</span>
                </div>
                <div class="product-price-detail">
                    ${product.discount > 0 ? 
                        `<span style="text-decoration: line-through; color: #999; font-size: 20px;">${originalPrice} جنيه</span><br>` 
                        : ''}
                    ${Math.round(discountedPrice)} جنيه
                    ${product.discount > 0 ? `<span style="color: #28a745; font-size: 16px;"> (وفر ${product.discount}%)</span>` : ''}
                </div>
                <div class="product-description">
                    <p>${product.description}</p>
                </div>
                <div class="product-features">
                    <h4>المميزات:</h4>
                    <ul>
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.id}); closeProductModal();">
                        أضف للسلة
                    </button>
                    <button class="compare-btn" onclick="addToCompare(${product.id})">
                        <i class="fas fa-balance-scale"></i> مقارنة
                    </button>
                </div>
            </div>
        </div>
        <div class="reviews-section">
            <div class="reviews-header">
                <h3>المراجعات (${productReviews.length})</h3>
                <button class="add-review-btn" onclick="openReviewModal(${product.id})">إضافة مراجعة</button>
            </div>
            <div id="reviewsList">
                ${productReviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div>
                                <span class="reviewer-name">${review.name}</span>
                                <div class="stars">${generateStars(review.rating)}</div>
                            </div>
                            <span class="review-date">${review.date}</span>
                        </div>
                        <div class="review-text">${review.text}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Add to compare
function addToCompare(productId) {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول للمقارنة!');
        toggleLogin();
        return;
    }
    
    if (compareList.includes(productId)) {
        showNotification('المنتج موجود بالفعل في المقارنة');
        return;
    }
    
    if (compareList.length >= 3) {
        showNotification('يمكن مقارنة 3 منتجات كحد أقصى');
        return;
    }
    
    compareList.push(productId);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    showNotification('تم إضافة المنتج للمقارنة');
}

// Open review modal
function openReviewModal(productId) {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول لإضافة مراجعة!');
        toggleLogin();
        return;
    }
    
    window.currentReviewProductId = productId;
    document.getElementById('reviewModal').style.display = 'block';
    
    // Pre-fill reviewer name
    document.getElementById('reviewerName').value = currentUser.username;
    
    // Setup star rating
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.onclick = function() {
            const rating = index + 1;
            window.currentRating = rating;
            
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        };
    });
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    document.getElementById('reviewForm').reset();
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
}

// Sort products
function sortProducts() {
    if (!isAuthenticated) return;
    
    const sortValue = document.getElementById('sortSelect').value;
    let sortedProducts = [...products];
    
    switch(sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            sortedProducts = products;
    }
    
    displayProducts(sortedProducts);
}

// Display recommendations
function displayRecommendations() {
    if (!isAuthenticated) return;
    
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) return;
    
    // Get random 4 products
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 4);
    
    grid.innerHTML = '';
    recommended.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const discountedPrice = product.discount > 0 ? 
            product.price * (1 - product.discount / 100) : product.price;
        
        productCard.innerHTML = `
            ${product.discount > 0 ? `<div class="product-badge">خصم ${product.discount}%</div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/400x250?text=صورة+غير+متاحة'"
                 onclick="showProductDetail(${product.id})">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-rating">
                    <div class="stars">${generateStars(product.rating)}</div>
                </div>
                <div class="product-price">${Math.round(discountedPrice)} جنيه</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    أضف للسلة
                </button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// Scroll to products
function scrollToProducts() {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول للتسوق!');
        toggleLogin();
        return;
    }
    
    document.getElementById('productsSection').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Search products
function searchProducts() {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول للبحث!');
        toggleLogin();
        return;
    }
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

// Filter products by category
function filterProducts(category) {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول للتصفح!');
        toggleLogin();
        return;
    }
    
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Display cart items
function displayCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (!cartItemsDiv || !cartTotalSpan) return;
    
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemPrice = item.finalPrice || item.price;
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-left: 10px;">
                <strong>${item.name}</strong><br>
                ${itemPrice} جنيه × ${item.quantity} = ${itemTotal} جنيه
            </div>
            <div>
                <button onclick="changeQuantity(${item.id}, -1)" class="btn-danger">-</button>
                <span style="margin: 0 10px;">${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)" class="btn-success">+</button>
                <button onclick="removeFromCart(${item.id})" class="btn-danger">حذف</button>
            </div>
        `;
        cartItemsDiv.appendChild(cartItem);
    });
    
    cartTotalSpan.textContent = total;
}

// Change quantity
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            displayCartItems();
            saveCart();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    displayCartItems();
    saveCart();
}

// Checkout
function checkout() {
    if (!isAuthenticated) {
        showNotification('يجب تسجيل الدخول لإتمام الطلب!');
        toggleLogin();
        return;
    }
    
    if (cart.length === 0) {
        showNotification('السلة فارغة!');
        return;
    }
    
    document.getElementById('cartModal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
    
    // Pre-fill customer info
    document.getElementById('customerName').value = currentUser.username;
    document.getElementById('customerPhone').value = currentUser.phone;
    
    // Display order items
    const orderItemsDiv = document.getElementById('orderItems');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    orderItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemPrice = item.finalPrice || item.price;
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.innerHTML = `${item.name} × ${item.quantity} = ${itemTotal} جنيه`;
        orderItemsDiv.appendChild(orderItem);
    });
    
    finalTotalSpan.textContent = total;
    window.originalTotal = total;
}

// Apply discount
function applyDiscount() {
    const discountCode = document.getElementById('discountCode').value.toUpperCase();
    const discountInfo = document.getElementById('discountInfo');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    if (discountCodes[discountCode]) {
        const discount = discountCodes[discountCode];
        let newTotal = window.originalTotal;
        
        if (discount.type === 'percentage') {
            newTotal = window.originalTotal * (1 - discount.discount / 100);
            discountInfo.innerHTML = `تم تطبيق خصم ${discount.discount}%`;
        } else {
            newTotal = window.originalTotal - discount.discount;
            discountInfo.innerHTML = `تم تطبيق خصم ${discount.discount} جنيه`;
        }
        
        discountInfo.style.display = 'block';
        finalTotalSpan.textContent = Math.max(0, newTotal);
        window.discountApplied = discountCode;
        
        showNotification('تم تطبيق كود الخصم بنجاح!');
    } else {
        discountInfo.style.display = 'none';
        finalTotalSpan.textContent = window.originalTotal;
        showNotification('كود الخصم غير صحيح!');
    }
}

// Send order to WhatsApp
function sendOrderToWhatsApp(order) {
    const whatsappNumber = '994402677844';
    
    let message = `🛒 *طلب جديد من متجر الهضبة*\n\n`;
    message += `👤 *الاسم:* ${order.customerName}\n`;
    message += `📱 *الهاتف:* ${order.customerPhone}\n`;
    message += `📍 *العنوان:* ${order.customerAddress}\n`;
    message += `📅 *التاريخ:* ${order.date}\n\n`;
    
    message += `🛍️ *المنتجات:*\n`;
    order.items.forEach(item => {
        const itemPrice = item.finalPrice || item.price;
        message += `• ${item.name} × ${item.quantity} = ${itemPrice * item.quantity} جنيه\n`;
    });
    
    if (order.discountCode) {
        message += `\n🎟️ *كود الخصم:* ${order.discountCode}\n`;
    }
    
    message += `\n💰 *المجموع النهائي:* ${order.total} جنيه\n\n`;
    message += `🆔 *رقم الطلب:* #${order.id}\n\n`;
    message += `للدفع وتأكيد الطلب، يرجى الرد على هذه الرسالة`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Close checkout modal
function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    window.discountApplied = null;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Show notification
function showNotification(message) {
    // Create notification element
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
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Initialize banners on page load
function initializeBanners() {
    const banners = JSON.parse(localStorage.getItem('banners')) || [];
    if (banners.length === 0) {
        const defaultBanners = [
            {
                id: 1,
                title: 'عروض حصرية من متجر الهضبة',
                description: 'اكتشف أفضل المنتجات بأسعار لا تُقاوم',
                active: true,
                image: ''
            }
        ];
        localStorage.setItem('banners', JSON.stringify(defaultBanners));
    }
}

// Close modals when clicking outside (except login when not authenticated)
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal && modal.id !== 'loginModal') {
            modal.style.display = 'none';
        } else if (event.target === modal && modal.id === 'loginModal' && isAuthenticated) {
            modal.style.display = 'none';
        }
    });
}
