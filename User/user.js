const PROJECT_ID = "flippedcart8751";
const PRODUCTS_COLLECTION = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

const productsContainer = document.getElementById('productsContainer');
let allProducts = []; // store all loaded products for search/filter
let nextPageToken = null;
let prevPageTokens = [];
let userWishlist = []; // store product IDs already wishlisted


// Load products with pagination
async function loadProducts(pageToken = null) {
  try {
    let url = `${PRODUCTS_COLLECTION}?pageSize=8`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url);
    const data = await res.json();
    productsContainer.innerHTML = '';

    if (data.documents) {
      allProducts = data.documents.map(doc => {
        const product = doc.fields;
        return {
          id: doc.name.split('/').pop(),
          name: product.name?.stringValue || 'Unnamed',
          price: product.price?.stringValue || '0',
          category: product.category?.stringValue || 'Others',
          image: product.imgurl?.stringValue || 'https://via.placeholder.com/200'
        };
      });
      renderProducts(allProducts);

      nextPageToken = data.nextPageToken || null;
      document.getElementById('nextBtn').disabled = !nextPageToken;
      document.getElementById('prevBtn').disabled = prevPageTokens.length === 0;
    }
  } catch (err) {
    console.error(err);
  }
}

// Load categories dynamically from Firestore
async function loadCategories() {
  try {
    const res = await fetch(`${PRODUCTS_COLLECTION}?pageSize=100`);
    const data = await res.json();
    if (!data.documents) return;

    const categories = [
      ...new Set(
        data.documents.map(doc => doc.fields.category?.stringValue || 'Others')
      ),
    ];

    const categorySelect = document.getElementById('categoryFilter');
    categorySelect.innerHTML = `<option value="">All Categories</option>`;
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

// Render product cards
function renderProducts(products) {
  productsContainer.innerHTML = '';
  if (products.length === 0) {
    productsContainer.innerHTML = `<p>No products found.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.dataset.id = p.id;
    card.dataset.name = p.name;
    card.dataset.price = p.price;
    card.dataset.category = p.category;

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <div class="card-actions">
        <select id="qty-${p.id}" class="qty-select">
          ${[1,2,3,4,5].map(q => `<option value="${q}">${q}</option>`).join('')}
        </select>
        <button class="icon-btn wishlist-btn" title="Add to Wishlist">
        <i class="fa ${userWishlist.includes(p.id) ? 'fa-check' : 'fa-heart'}" style="color:${userWishlist.includes(p.id) ? '#00c853' : 'red'}"></i>
      </button>
        </button>
        <button class="icon-btn cart-btn" title="Add to Cart">
          <i class="fa fa-shopping-cart"></i>
        </button>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  // Wishlist toggle (heart → tick) with Firestore add/remove
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const icon = btn.querySelector('i');
      const productCard = btn.closest('.product-card');
      const id = productCard.dataset.id;
      const name = productCard.dataset.name;
      const price = productCard.dataset.price;
    const image = productCard.querySelector('img').src;
      const userId = sessionStorage.getItem("googleEmail") || "guest@example.com";

      if (btn.classList.contains('added')) {
        // Remove from wishlist
        btn.classList.remove('added');
        icon.classList.remove('fa-check');
        icon.classList.add('fa-heart');
        icon.style.color = 'red';

        await removeFromWishlist(id, userId);

      } else {
        // Add to wishlist
        btn.classList.add('added');
        icon.classList.remove('fa-heart');
        icon.classList.add('fa-check');
        icon.style.color = '#00c853';

        await addToWishlist(id, name, price,image);
      }
    });
  });

  // Cart toggle
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('cart-active');
      const icon = btn.querySelector('i');
      icon.style.color = btn.classList.contains('cart-active') ? '#ffd700' : 'white';
    });
  });
}

// Filters
function applyFilters() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const priceRange = document.getElementById('priceFilter').value;

  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchValue)
  );

  if (category) filtered = filtered.filter(p => p.category === category);

  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    filtered = filtered.filter(p => p.price >= min && p.price <= max);
  }

  renderProducts(filtered);
}

// Add to Cart
async function addToCart(id, name, price) {
  const qty = document.getElementById(`qty-${id}`).value;
  const userId = sessionStorage.getItem("googleEmail") || "guest@example.com";
  const data = {
    fields: {
      productId: { stringValue: id },
      name: { stringValue: name },
      price: { integerValue: price },
      quantity: { integerValue: qty },
      user: { stringValue: userId }
    }
  };
  await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  console.log(`${name} added to cart!`);
}

// Add to Wishlist
async function addToWishlist(id, name, price,image) {
  const userId = sessionStorage.getItem("googleEmail") || "guest@example.com";
  const data = {
    fields: {
      productId: { stringValue: id },
      name: { stringValue: name },
      price: { stringValue: price },
      imgurl:{stringValue:image},
      user: { stringValue: userId }
    }
  };
  await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  console.log(`${name} added to wishlist!`);
}

// Remove from Wishlist
async function removeFromWishlist(productId, userId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Wishlist`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.documents) return;

    const docToDelete = data.documents.find(doc => {
      const fields = doc.fields;
      return fields.productId.stringValue === productId && fields.user.stringValue === userId;
    });

    if (docToDelete) {
      const docName = docToDelete.name; // full Firestore doc path
      await fetch(`https://firestore.googleapis.com/v1/${docName}`, {
        method: "DELETE"
      });
      console.log(`Product ${productId} removed from wishlist`);
      userWishlist = userWishlist.filter(id => id !== productId);
    }
  } catch (err) {
    console.error("Error removing from wishlist:", err);
  }
}

// Pagination buttons
document.getElementById('nextBtn').addEventListener('click', () => {
  if (nextPageToken) {
    prevPageTokens.push(nextPageToken);
    loadProducts(nextPageToken);
  }
});
document.getElementById('prevBtn').addEventListener('click', () => {
  if (prevPageTokens.length > 1) {
    prevPageTokens.pop();
    const prevToken = prevPageTokens.pop();
    loadProducts(prevToken);
  } else {
    loadProducts();
    prevPageTokens = [];
  }
});

// Logout & navigation
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = "login.html";
});
document.getElementById('wishlistLink').addEventListener('click', () => {
  window.location.href = "../Wishlist/wishlist.html";
});
document.getElementById('cartLink').addEventListener('click', () => {
  window.location.href = "../Cart/cart.html";
});

async function loadUserWishlist() {
  const userId = sessionStorage.getItem("googleEmail") || "guest@example.com";
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Wishlist`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.documents) return;

    // store product IDs of this user
    userWishlist = data.documents
      .filter(doc => doc.fields.user.stringValue === userId)
      .map(doc => doc.fields.productId.stringValue);

  } catch (err) {
    console.error("Error fetching user wishlist:", err);
  }
}

// Initial load
loadUserWishlist();
loadProducts();
loadCategories();
