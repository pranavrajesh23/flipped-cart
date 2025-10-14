 const projectId = "flippedcart8751"; // your firebase project ID
    const apiKey = "AIzaSyAR10NJqR8wUDIimsxHMsW307P_vdbO_dE"; // replace with your api key
    const ordersContainer = document.getElementById("ordersContainer");

    // get logged user email from localStorage (assuming you saved after login)
    const userEmail = sessionStorage.getItem("googleEmail"); 

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
          imgUrl: d.fields.imgUrl.stringValue
        }));

      displayOrders(orders);
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

        const header = document.createElement("div");
        header.className = "order-header";
        header.innerHTML = `<strong>Order ID: ${orderId}</strong>`;

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel Order";
        cancelBtn.className = "cancel-btn";
        cancelBtn.onclick = () => cancelOrder(orderItems.map(i => i.id));

        header.appendChild(cancelBtn);
        orderDiv.appendChild(header);

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

    async function cancelOrder(ids) {
      if (!confirm("Are you sure you want to cancel this order?")) return;
      for (const id of ids) {
        await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Orders/${id}`, {
          method: "DELETE",
        });
      }
      fetchOrders(); // refresh
    }

    fetchOrders();