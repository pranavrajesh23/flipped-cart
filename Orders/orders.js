const projectId = "flippedcart8751";
const ordersContainer = document.getElementById("ordersContainer");
const userEmail = sessionStorage.getItem("googleEmail");
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
let localPart = userEmail.split('@')[0];
// Remove the number and anything after it (like 2021eee)
let namePart = localPart.split(/[0-9]/)[0];
console.log(namePart);
// Capitalize the first letter
namePart = namePart.toUpperCase()
document.getElementById('orderpage').textContent = `HI ${namePart}, YOU'RE ACIVE ORDERS`;
// fetch all orders
async function fetchOrders() {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "Orders" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "userId" },
          op: "EQUAL",
          value: { stringValue: userEmail }
        }
      }
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const orders = data
    .map(d => d.document)
    .filter(d => d)
    .map(d => ({
      id: d.name.split("/").pop(),
      orderId: d.fields.orderId.stringValue,
      title: d.fields.name.stringValue,
      price: d.fields.price.doubleValue,
      quantity: d.fields.quantity.integerValue,
      imgUrl: d.fields.imgUrl.stringValue,
      orderDate: d.fields.orderDate?.stringValue || new Date().toISOString().split("T")[0],// fallback if not stored
      userId: d.fields.userId.stringValue
    }));

    for (const order of orders) {
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 7);

    const today = new Date();
    if (today >= deliveryDate) {
      // Move to OrderHistory with Delivered status
      await moveOrderToHistory([order], "Delivered");
      // Remove from Orders
      await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Orders/${order.id}`,
        { method: "DELETE" }
      );
    }
  }
  // displayOrders(orders);
  displayOrders(orders.filter(o => new Date(o.orderDate).getTime() + 7 * 24*60*60*1000 > new Date().getTime()));
}

function displayOrders(orders) {
  const grouped = {};
  orders.forEach(item => {
    if (!grouped[item.orderId]) grouped[item.orderId] = [];
    grouped[item.orderId].push(item);
  });

  ordersContainer.innerHTML = "";

  for (const orderId in grouped) {
    const orderItems = grouped[orderId];
    const orderDiv = document.createElement("div");
    orderDiv.className = "order";

    // take order date from first item (same for all items in the same order)
    const orderDate = new Date(orderItems[0].orderDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 7);

    const today = new Date();
    const isDelivered = today >= deliveryDate;

    const header = document.createElement("div");
    header.className = "order-header";

    // Create status + date info
    const dateInfo = document.createElement("div");
    dateInfo.innerHTML = `
      <div><strong>Order ID:</strong> ${orderId} | </div>
      <div><strong>Order Date:</strong> <span style="color:red">${orderDate.toDateString()} </span>|</div>
      <div><strong>Delivery Date:</strong> <span style="color:green">${deliveryDate.toDateString()}</span></div>
    `;
    dateInfo.style.display = "flex";
    dateInfo.style.gap = "5px";

    const rightSection = document.createElement("div");
    rightSection.style.display = "flex";
    rightSection.style.alignItems = "center";
    rightSection.style.gap = "10px";

    const status = document.createElement("span");
    status.textContent = isDelivered ? "Delivered" : "Pending";
    status.style.color = isDelivered ? "green" : "orange";
    status.style.fontWeight = "bold";

    const actionBtn = document.createElement("button");
    actionBtn.textContent = isDelivered ? "Return" : "Cancel Order";
    actionBtn.className = "cancel-btn";
    actionBtn.onclick = () =>
        isDelivered
        ? moveOrderToHistory(orderItems, "Returned")
        : moveOrderToHistory(orderItems, "Cancelled");
      // isDelivered
      //   ? returnOrder(orderItems.map(i => i.id))
      //   : cancelOrder(orderItems.map(i => i.id));

    rightSection.appendChild(status);
    rightSection.appendChild(actionBtn);

    header.appendChild(dateInfo);
    header.appendChild(rightSection);
    orderDiv.appendChild(header);

    // items list
    const itemsDiv = document.createElement("div");
    itemsDiv.className = "order-items";

    let total = 0;
    orderItems.forEach(item => {
      total += item.price * item.quantity;

      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.innerHTML = `
        <div class="item-info">
          <img src="${item.imgUrl}" alt="${item.title}" />
          <span>${item.title} x${item.quantity}</span>
        </div>
        <span>₹${item.price * item.quantity}</span>
      `;
      itemsDiv.appendChild(itemDiv);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "total";
    totalDiv.textContent = `Total: ₹${total}`;

    orderDiv.appendChild(itemsDiv);
    orderDiv.appendChild(totalDiv);
    ordersContainer.appendChild(orderDiv);
  }
}
async function moveOrderToHistory(orderItems, statusType) {
  for (const item of orderItems) {
    const deliveryDate = new Date(item.orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    const body = {
      fields: {
        orderId: { stringValue: item.orderId },
        title: { stringValue: item.title },
        price: { doubleValue: item.price },
        quantity: { integerValue: item.quantity },
        imgUrl: { stringValue: item.imgUrl },
        orderDate: { stringValue: item.orderDate },
        deliveryDate: { stringValue: deliveryDate.toISOString().split("T")[0] },
        status: { stringValue: statusType },
        userId: { stringValue: item.userId },
        completedOn: { stringValue: new Date().toISOString().split("T")[0] }
      }
    };

    // Add to OrderHistory
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/OrderHistory`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );

    // Delete from Orders
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Orders/${item.id}`,
      { method: "DELETE" }
    );
  }
  fetchOrders(); // refresh
}

fetchOrders();
// async function moveToHistory(orderItems, statusType) {
//   const confirmMsg =
//     statusType === "Cancelled"
//       ? "Are you sure you want to cancel this order?"
//       : "Do you want to return this order?";
//   if (!confirm(confirmMsg)) return;

//   for (const item of orderItems) {
//     // Build the order history entry
//     const body = {
//       fields: {
//         orderId: { stringValue: item.orderId },
//         title: { stringValue: item.title },
//         price: { doubleValue: item.price },
//         quantity: { integerValue: item.quantity },
//         imgUrl: { stringValue: item.imgUrl },
//         orderDate: { stringValue: item.orderDate },
//         status: { stringValue: statusType },
//         userId: { stringValue: item.userId },
//         completedOn: { stringValue: new Date().toISOString().split("T")[0] }
//       }
//     };

//     // Add to OrderHistory collection
//     await fetch(
//       `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/OrderHistory`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body)
//       }
//     );

//     // Delete from Orders
//     await fetch(
//       `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Orders/${item.id}`,
//       { method: "DELETE" }
//     );
//   }

//   alert(`Order ${statusType} successfully.`);
//   fetchOrders(); // refresh
// }

// fetchOrders();
// cancel order
// async function cancelOrder(ids) {
//   if (!confirm("Are you sure you want to cancel this order?")) return;
//   for (const id of ids) {
//     await fetch(
//       `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Orders/${id}`,
//       { method: "DELETE" }
//     );
//   }
//   fetchOrders(); // refresh
// }

// // return order (same delete for now — you can later store it in Returns)
// async function returnOrder(ids) {
//   if (!confirm("Do you want to return this order?")) return;
//   for (const id of ids) {
//     await fetch(
//       `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Orders/${id}`,
//       { method: "DELETE" }
//     );
//   }
//   fetchOrders(); // refresh
// }

// fetchOrders();
