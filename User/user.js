 const productsContainer = document.getElementById('productsContainer');

  // ✅ Firestore API endpoint
  const PROJECT_ID = "flippedcart8751";
  const PRODUCTS_COLLECTION = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

  // Fetch all products from Firestore
  async function loadProducts() {
    try {
      const res = await fetch(PRODUCTS_COLLECTION);
      const data = await res.json();
      productsContainer.innerHTML = '';

      if (data.documents) {
        data.documents.forEach(doc => {
          const product = doc.fields;
          const id = doc.name.split('/').pop();
          const name = product.name?.stringValue || 'Unnamed Product';
          const price = product.price?.stringValue || '0';
          const image = product.imgurl?.stringValue; //|| 'https://via.placeholder.com/200';
          console.log(image)
          const card = document.createElement('div');
          card.classList.add('product-card');
          card.innerHTML = `
            <img src="${image}" alt="${name}">
            <h3>${name}</h3>
            <p>₹${price}</p>
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
      } else {
        productsContainer.innerHTML = `<p>No products found.</p>`;
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

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