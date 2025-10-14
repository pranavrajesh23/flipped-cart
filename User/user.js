 const PROJECT_ID = "flippedcart8751";
  const PRODUCTS_COLLECTION = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

  const productsContainer = document.getElementById('productsContainer');
  let allProducts = []; // store all loaded products for search/filter
  let nextPageToken = null;
  let prevPageTokens = [];

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

  async function loadCategories() {
  try {
    const res = await fetch(`${PRODUCTS_COLLECTION}?pageSize=100`); // fetch all products
    const data = await res.json();
    if (!data.documents) return;

    // extract unique categories
    const categories = [
      ...new Set(
        data.documents.map(doc => doc.fields.category?.stringValue || 'Others')
      ),
    ];

    // populate dropdown
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

function renderProducts(products) {
  productsContainer.innerHTML = '';
  if (products.length === 0) {
    productsContainer.innerHTML = `<p>No products found.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <div class="card-actions">
        <select id="qty-${p.id}" class="qty-select">
          ${[1,2,3,4,5].map(q => `<option value="${q}">${q}</option>`).join('')}
        </select>
        <button class="icon-btn wishlist-btn" title="Add to Wishlist">
          <i class="fa fa-heart"></i>
        </button>
        <button class="icon-btn cart-btn" title="Add to Cart">
          <i class="fa fa-shopping-cart"></i>
        </button>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  // Wishlist toggle (heart → tick)
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('i');
      if (btn.classList.contains('added')) {
        btn.classList.remove('added');
        icon.style.color = 'black';
      } else {
        btn.classList.add('added');
        icon.style.color = 'red';
      }
    });
  });

  // Cart toggle (cart icon changes color)
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('cart-active');
    });
  });
}


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

  async function addToCart(id, name, price) {
    const qty = document.getElementById(`qty-${id}`).value;
    const userId = localStorage.getItem("userEmail") || "guest@example.com";
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
    alert(`${name} added to cart!`);
  }

  async function addToWishlist(id, name, price) {
    const userId = localStorage.getItem("userEmail") || "guest@example.com";
    const data = {
      fields: {
        productId: { stringValue: id },
        name: { stringValue: name },
        price: { integerValue: price },
        user: { stringValue: userId }
      }
    };
    await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    alert(`${name} added to wishlist!`);
  }

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

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

   document.getElementById('wishlistLink').addEventListener('click', () => {
    window.location.href = "../Wishlist/wishlist.html";
  });

   document.getElementById('cartLink').addEventListener('click', () => {
    window.location.href = "../Cart/cart.html";
  });

  loadProducts();
  loadCategories();