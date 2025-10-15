const cartContainer = document.getElementById('cartContainer');
const totalAmountEl = document.getElementById('totalAmount');
const goToPaymentBtn = document.getElementById('goToPaymentBtn');

const PROJECT_ID = "flippedcart8751";
const CART_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Cart`;

let cartItems = [];
let selectedItems = new Set();

// Logged-in user's email
const USER_ID = sessionStorage.getItem('googleEmail');
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = "../index.html";
});
document.getElementById('wishlistLink').addEventListener('click', () => {
  window.location.href = "../Wishlist/wishlist.html";
});
document.getElementById('cartLink').addEventListener('click', () => {
  window.location.href = "../Cart/cart.html";
});
document.getElementById('ordersLink').addEventListener('click', () => {
  window.location.href = "../Orders/orders.html";
});
document.getElementById('profileLink').addEventListener('click', () => {
  window.location.href = "../Profile/profile.html";
});
let localPart = USER_ID.split('@')[0];
// Remove the number and anything after it (like 2021eee)
let namePart = localPart.split(/[0-9]/)[0];
console.log(namePart);
// Capitalize the first letter
namePart = namePart.toUpperCase()
document.getElementById('orderpage').textContent = `HI ${namePart}, MAKE THE MOVE`;
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

// Go to payment button
goToPaymentBtn.addEventListener('click', () => {
  if (selectedItems.size === 0) {
    alert('Select items to proceed to payment!');
    return;
  }

  const itemsToOrder = cartItems.filter(item => selectedItems.has(item.id));
  sessionStorage.setItem('pendingOrder', JSON.stringify(itemsToOrder));

  // Redirect to payment page
  window.location.href = "../Payment/payment.html";
});

// Initialize
(async () => {
  cartItems = await fetchUserCartItems(USER_ID);
  renderCartItems();
})();
