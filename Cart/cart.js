const cartContainer = document.getElementById('cartContainer');
  const totalAmountEl = document.getElementById('totalAmount');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  const PROJECT_ID = "flippedcart8751"; // replace with your Firebase project ID
  const CART_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Cart`;
  const ORDERS_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Orders`;

  let cartItems = [];
  let selectedItems = new Set();

  // Replace with logged-in user's UID
  const USER_ID = sessionStorage.getItem('googleEmail');

  // Fetch user-specific cart items
  async function fetchUserCartItems(userId) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
    const query = {
      structuredQuery: {
        from: [{ collectionId: "Cart" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "user" },
            op: "EQUAL",
            value: { stringValue: userId }
          }
        }
      }
    };
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(query)
    });
    const data = await response.json();
    return data
      .filter(r => r.document)
      .map(doc => {
        const item = doc.document;
        return {
          id: item.name.split('/').pop(),
          name: item.fields.name.stringValue,
          price: parseFloat(item.fields.price.stringValue),
          quantity: parseInt(item.fields.quantity.integerValue),
          imgUrl: item.fields.imgurl.stringValue
        };
      });
  }

  // Render cart items
  function renderCartItems() {
    cartContainer.innerHTML = '';
    cartItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <input type="checkbox" id="check_${item.id}">
        <img src="${item.imgUrl}" alt="${item.name}">
        <div class="cart-item-details">
          <strong>${item.name}</strong><br>
          Quantity: 
          <input type="number" min="1" class="quantity-input" id="qty_${item.id}" value="${item.quantity}"> × ₹${item.price} = ₹<span id="subTotal_${item.id}">${item.quantity * item.price}</span>
        </div>
      `;
      cartContainer.appendChild(div);

      // Checkbox
      const checkbox = document.getElementById(`check_${item.id}`);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) selectedItems.add(item.id);
        else selectedItems.delete(item.id);
        updateTotal();
      });

      // Quantity input - auto save to Firestore
      const qtyInput = document.getElementById(`qty_${item.id}`);
      qtyInput.addEventListener('input', async () => {
        let qty = parseInt(qtyInput.value);
        if (qty < 1 || isNaN(qty)) qty = 1;
        qtyInput.value = qty;
        item.quantity = qty;
        document.getElementById(`subTotal_${item.id}`).textContent = item.price * qty;
        updateTotal();

        // Save updated quantity to Firestore
        await fetch(`${CART_URL}/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              quantity: { integerValue: qty }
            }
          })
        });
      });
    });
  }

  function updateTotal() {
    let total = 0;
    cartItems.forEach(item => {
      if (selectedItems.has(item.id)) total += item.price * item.quantity;
    });
    totalAmountEl.textContent = total;
  }

  placeOrderBtn.addEventListener('click', async () => {
    if (selectedItems.size === 0) {
      alert('Select items to place order!');
      return;
    }

    const orderId = `ORD-${Date.now()}`; // generate order id
    const orderDate = new Date().toISOString();

    for (const itemId of selectedItems) {
      const item = cartItems.find(i => i.id === itemId);

      // Save to Orders collection
      await fetch(`${ORDERS_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            userId: { stringValue: USER_ID },
            name: { stringValue: item.name },
            price: { doubleValue: item.price },
            quantity: { integerValue: item.quantity },
            imgUrl: { stringValue: item.imgUrl },
            orderId: { stringValue: orderId },
            orderDate: { stringValue: orderDate }
          }
        })
      });

      // Remove from Cart
      await fetch(`${CART_URL}/${itemId}`, { method: 'DELETE' });
      document.getElementById(`check_${itemId}`).parentElement.remove();
      cartItems = cartItems.filter(i => i.id !== itemId);
    }

    selectedItems.clear();
    updateTotal();
    alert(`Order placed successfully! Order ID: ${orderId}`);
  });

  // Initialize
  (async () => {
    cartItems = await fetchUserCartItems(USER_ID);
    renderCartItems();
  })();