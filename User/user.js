 const productsContainer = document.getElementById('productsContainer');

  // ✅ Firestore API endpoint
  const PROJECT_ID = "flippedcart8751";
  const PRODUCTS_COLLECTION = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

  // Fetch all products from Firestore
let nextPageToken = null;
let prevPageTokens = [];

async function loadProducts(pageToken = null) {
  try {
    let url = `${PRODUCTS_COLLECTION}?pageSize=6`; // 6 products per page
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url);
    const data = await res.json();
    productsContainer.innerHTML = '';

    if (data.documents) {
      data.documents.forEach(doc => {
        const product = doc.fields;
        const id = doc.name.split('/').pop();
        const name = product.name?.stringValue || 'Unnamed Product';
        const price = product.price?.stringValue || '0';
        const image = product.imgurl?.stringValue || 'https://via.placeholder.com/200';
        const category=product.category?.stringValue;
        // const des=product.description?.stringValue; <p>Description: ${des}</p>
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
          <img src="${image}" alt="${name}">
          <h3>${name}</h3>
          <p>₹${price}</p>
          <p>Category: ${category}</p>
          <div class="actions">
            <select id="qty-${id}">
              ${[1,2,3,4,5].map(q => `<option value="${q}">${q}</option>`).join('')}
            </select>
            <button class="add-cart" onclick="addToCart('${id}', '${name}', ${price})">Add to Cart</button>
            <button class="add-wishlist" onclick="addToWishlist('${id}', '${name}', ${price})">Add to Wishlist</button>
          </div>
        `;
        productsContainer.appendChild(card);
      });

      // Save next page token
      nextPageToken = data.nextPageToken || null;
      document.getElementById('nextBtn').disabled = !nextPageToken;
      document.getElementById('prevBtn').disabled = prevPageTokens.length === 0;
    } else {
      productsContainer.innerHTML = `<p>No products found.</p>`;
      document.getElementById('nextBtn').disabled = true;
      document.getElementById('prevBtn').disabled = true;
    }
  } catch (err) {
    console.error('Error loading products:', err);
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
    prevPageTokens.pop(); // remove current page token
    const prevToken = prevPageTokens.pop(); // previous page token
    loadProducts(prevToken);
  } else {
    loadProducts(); // first page
    prevPageTokens = [];
  }
});

// Initial load
// loadProducts();


  // Add to Cart
  async function addToCart(id, name, price) {
    const qty = document.getElementById(`qty-${id}`).value;
    const userId = localStorage.getItem("userEmail") || "guest@example.com";
    const cartData = {
      fields: {
        productId: { stringValue: id },
        name: { stringValue: name },
        price: { integerValue: price },
        quantity: { integerValue: qty },
        user: { stringValue: userId }
      }
    };
    await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartData)
    });
    alert(`${name} added to cart!`);
  }

  // Add to Wishlist
  async function addToWishlist(id, name, price) {
    const userId = localStorage.getItem("userEmail") || "guest@example.com";
    const wishlistData = {
      fields: {
        productId: { stringValue: id },
        name: { stringValue: name },
        price: { stringValue: price },
        user: { stringValue: userId }
      }
    };
    await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wishlistData)
    });
    alert(`${name} added to wishlist!`);
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../index.html";
  });

  // Initial load
  loadProducts();