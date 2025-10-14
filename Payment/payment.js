const PROJECT_ID = "flippedcart8751";
const CART_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Cart`;
const ORDERS_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/Orders`;

// User email from session
const USER_ID = sessionStorage.getItem('googleEmail');

document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  const paymentMode = document.getElementById('paymentMode').value;
  const address = document.getElementById('address').value.trim();
  if (!address) { alert("Enter your delivery address!"); return; }

  // Retrieve selected items from sessionStorage
  let itemsToOrder = JSON.parse(sessionStorage.getItem('pendingOrder') || '[]');
  if(itemsToOrder.length === 0) { alert("No items to place order!"); return; }

  const orderId = `ORD-${Date.now()}`;
  const orderDate = new Date().toISOString();

  for(const item of itemsToOrder){
    // Save to Orders collection
    await fetch(ORDERS_URL, {
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
          orderDate: { stringValue: orderDate },
          paymentMode: { stringValue: paymentMode },
          address: { stringValue: address }
        }
      })
    });

    // Remove item from Cart collection
    await fetch(`${CART_URL}/${item.id}`, { method: 'DELETE' });
  }

  sessionStorage.removeItem('pendingOrder');
  alert(`Order placed successfully! Order ID: ${orderId}`);
  window.location.href = "../Orders/orders.html"; // optional redirect
});