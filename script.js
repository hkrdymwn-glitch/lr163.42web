
// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let discountCodes = JSON.parse(localStorage.getItem('discountCodes')) || {
    'WELCOME10': { discount: 10, type: 'percentage' },
    'SAVE50': { discount: 50, type: 'fixed' }
};

// Initialize products if empty
if (products.length === 0) {
    products = [
        {
            id: 1,
            name: 'لابتوب Dell XPS 13',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
            category: 'electronics'
        },
        {
            id: 2,
            name: 'تيشيرت قطني',
            price: 150,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            category: 'clothing'
        },
        {
            id: 3,
            name: 'مجموعة أدوات مطبخ',
            price: 800,
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
            category: 'home'
        },
        {
            id: 4,
            name: 'دمبل 10 كيلو',
            price: 300,
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
            category: 'sports'
        }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

// Display products
function displayProducts(productsToShow = products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x250?text=صورة+غير+متاحة'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} جنيه</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    أضف للسلة
                </button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

// Filter products by category
function filterProducts(category) {
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        saveCart();
        showNotification('تم إضافة المنتج للسلة بنجاح!');
    }
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        displayCartItems();
        modal.style.display = 'block';
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
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${item.price} جنيه × ${item.quantity}
            </div>
            <div>
                <button onclick="removeFromCart(${item.id})" class="btn-danger">حذف</button>
            </div>
        `;
        cartItemsDiv.appendChild(cartItem);
    });
    
    cartTotalSpan.textContent = total;
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    displayCartItems();
    saveCart();
}

// Toggle login modal
function toggleLogin() {
    const modal = document.getElementById('loginModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// Handle login form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            const user = {
                id: Date.now(),
                username,
                email,
                phone,
                joinDate: new Date().toLocaleDateString('ar-EG')
            };
            
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification('تم تسجيل الحساب بنجاح!');
            toggleLogin();
        });
    }
    
    // Initialize page
    displayProducts();
    updateCartCount();
});

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('السلة فارغة!');
        return;
    }
    
    document.getElementById('cartModal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
    
    // Display order items
    const orderItemsDiv = document.getElementById('orderItems');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    orderItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
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

// Handle checkout form
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const order = {
                id: Date.now(),
                customerName: document.getElementById('customerName').value,
                customerPhone: document.getElementById('customerPhone').value,
                customerAddress: document.getElementById('customerAddress').value,
                items: [...cart],
                total: parseFloat(document.getElementById('finalTotal').textContent),
                discountCode: window.discountApplied || null,
                date: new Date().toLocaleDateString('ar-EG'),
                status: 'pending'
            };
            
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            closeCheckout();
            showNotification('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');
        });
    }
});

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

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
