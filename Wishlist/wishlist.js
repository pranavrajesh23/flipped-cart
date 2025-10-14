const wishlistContainer = document.getElementById('wishlistContainer');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

let currentPage = 1;
const pageSize = 6;
let wishlistItems = [];

const userEmail = sessionStorage.getItem('googleEmail'); // logged-in user email
const projectId = "flippedcart8751";
const wishlistCollection = "Wishlist";
const cartCollection = "Cart";

async function fetchWishlist() {
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${wishlistCollection}`);
    const data = await response.json();
    wishlistItems = (data.documents || [])
      .map(doc => {
        return {
          id: doc.name.split('/').pop(),
          ...Object.fromEntries(Object.entries(doc.fields).map(([k,v]) => [k, v.stringValue || v.integerValue || '']))
        };
      })
      .filter(item => item.user === userEmail);
    renderPage();
  } catch (error) {
    console.error("Error fetching wishlist:", error);
  }
}

function renderPage() {
  wishlistContainer.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = wishlistItems.slice(start, end);

  pageItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imgurl || 'https://via.placeholder.com/150'}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>Price: ₹${item.price}</p>
      <label>Quantity: <input type="number" min="1" value="${item.quantity}" id="qty-${item.id}"></label>
      <div class="buttons">
        <button class="remove" onclick="removeItem('${item.id}', this)">Remove</button>
        <button class="move" onclick="moveToCart('${item.id}', this)">Move to Cart</button>
      </div>
    `;
    wishlistContainer.appendChild(card);
  });

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = end >= wishlistItems.length;
  prevPageBtn.classList.toggle('disabled', prevPageBtn.disabled);
  nextPageBtn.classList.toggle('disabled', nextPageBtn.disabled);
}

function removeItem(id, btn) {
  const card = btn.closest('.card');
  card.style.transform = 'scale(0)';
  card.style.opacity = '0';
  setTimeout(() => {
    fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${wishlistCollection}/${id}`, { method:'DELETE' })
      .then(() => {
        wishlistItems = wishlistItems.filter(item => item.id !== id);
        renderPage();
      })
      .catch(err => console.error("Error removing item:", err));
  }, 300);
}

function moveToCart(id, btn) {
  const item = wishlistItems.find(i => i.id === id);
  if(!item) return;

  const quantityInput = document.getElementById(`qty-${id}`);
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

  // Add to Cart collection
  fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${cartCollection}?documentId=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        name: { stringValue: item.name },
        price: { stringValue: item.price },
        imgurl: { stringValue: item.imgurl || '' },
        user: { stringValue: userEmail },
        quantity: { integerValue: item.quantity }
      }
    })
  })
  .then(res => {
    if(!res.ok) throw new Error('Failed to add to cart');
    removeItem(id, btn); // remove from wishlist after moving
  })
  .catch(err => console.error("Error moving to cart:", err));
}

prevPageBtn.addEventListener('click', () => {
  if(currentPage > 1) { currentPage--; renderPage(); }
});
nextPageBtn.addEventListener('click', () => {
  if((currentPage * pageSize) < wishlistItems.length) { currentPage++; renderPage(); }
});

fetchWishlist();