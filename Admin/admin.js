const projectId = "flippedcart8751";
const apiKey = "AIzaSyAR10NJqR8wUDIimsxHMsW307P_vdbO_dE";
let adminEmail = null;
let deleteCallback = null;

// Messages
const messageContainer = document.getElementById('messageContainer');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlayMessage');
const overlayYes = document.getElementById('overlayYes');
const overlayNo = document.getElementById('overlayNo');

function showMessage(msg,type='info'){
  messageContainer.innerText = msg;
  messageContainer.style.display = 'block';
  messageContainer.style.color = type==='error'?'red':'green';
  setTimeout(()=>{ messageContainer.style.display='none'; },3000);
}

// Sections
function showSection(section){
  document.querySelectorAll('.section').forEach(sec=>sec.style.display='none');
  document.getElementById(section+'Section').style.display='block';
}
function showTab(tab){
  document.querySelectorAll('.tabContent').forEach(t=>t.style.display='none');
  document.getElementById(tab+'Tab').style.display='block';
}

// Sign out
function signOut(){
  sessionStorage.clear();
  window.location.href="../index.html";
}

// Overlay
function confirmDelete(message, callback){
  overlayMessage.innerText = message;
  overlay.style.display='flex';
  deleteCallback = callback;
}
overlayYes.onclick = ()=>{ overlay.style.display='none'; if(deleteCallback) deleteCallback(true); };
overlayNo.onclick = ()=>{ overlay.style.display='none'; if(deleteCallback) deleteCallback(false); };

// Verify admin
async function verifyAdmin(){
  const email = sessionStorage.getItem("googleEmail");
  if(!email){ window.location.href="../index.html"; return; }
  adminEmail = email;
  document.getElementById("adminEmail").innerText = adminEmail;
  document.getElementById("profileEmail").innerText = adminEmail;

  const docId = email.replace(/[@.]/g,'_');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin/${docId}?key=${apiKey}`;
  const res = await fetch(url);
  if(!res.ok){ window.location.href="index.html"; }
  else{ loadProducts(); loadUsers(); }
}

// Load products with category filter
async function loadProducts(){
  const filter = document.getElementById('filterCategory').value;
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?key=${apiKey}`);
  const data = await res.json();
  const container = document.getElementById("productContainer"); container.innerHTML='';
  const catSelect = document.getElementById('filterCategory');
  catSelect.innerHTML='<option value="">All Categories</option>';
  if(!data.documents) return;
  const categories = new Set();
  data.documents.forEach(doc=>{
    const f=doc.fields;
    categories.add(f.category.stringValue);
    if(filter && f.category.stringValue!==filter) return;
    const card = document.createElement("div"); card.className="card";
    card.innerHTML=`
      <img src="${f.imgurl.stringValue}" alt="">
      <div class="card-content">
        <h3>${f.name.stringValue}</h3>
        <p>${f.description.stringValue}</p>
        <p class="price">₹${f.price.stringValue}</p>
        <p class="stock">Stock: ${f.quantity.stringValue}</p>
        <p class="category">Category: ${f.category.stringValue}</p>
      </div>
      <div class="action-buttons">
        <button class="edit-btn" onclick="editProduct('${doc.name.split('/').pop()}')">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${doc.name.split('/').pop()}')">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
  categories.forEach(c=>{
    const option = document.createElement('option');
    option.value=c; option.innerText=c;
    catSelect.appendChild(option);
  });
}

// Load users with search
async function loadUsers(){
  const search = document.getElementById('searchUsers').value.toLowerCase();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`);
  const data = await res.json();
  const container = document.getElementById("userContainer"); container.innerHTML='';
  if(!data.documents) return;
  data.documents.forEach(doc=>{
    const f=doc.fields;
    if(search && !(f.email.stringValue.toLowerCase().includes(search) || f.fullName.stringValue.toLowerCase().includes(search))) return;
    const card = document.createElement("div"); card.className="card";
    card.innerHTML=`
      <h3>${f.fullName.stringValue}</h3>
      <p>Email: ${f.email.stringValue}</p>
      <p>Phone: ${f.phone.stringValue}</p>
      <p>Role: ${f.role.stringValue}</p>
      <div class="action-buttons">
        <button class="edit-btn" onclick="editUser('${doc.name.split('/').pop()}')">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteUser('${doc.name.split('/').pop()}')">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Edit & delete
async function editProduct(docId){
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`);
  const f = (await res.json()).fields;
  document.getElementById("productId").value=docId;
  document.getElementById("name").value=f.name.stringValue;
  document.getElementById("imgurl").value=f.imgurl.stringValue;
  document.getElementById("description").value=f.description.stringValue;
  document.getElementById("quantity").value=f.quantity.stringValue;
  document.getElementById("price").value=f.price.stringValue;
  document.getElementById("category").value=f.category.stringValue;
  showMessage("Editing product");
}
function deleteProduct(docId){
  confirmDelete("Delete this product?", async confirmed=>{
    if(confirmed){
      await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`,{method:'DELETE'});
      showMessage("Product deleted"); loadProducts();
    }
  });
}

async function editUser(docId){
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`);
  const f = (await res.json()).fields;
  document.getElementById("userDocId").value=docId;
  document.getElementById("fullName").value=f.fullName.stringValue;
  document.getElementById("email").value=f.email.stringValue;
  document.getElementById("phone").value=f.phone.stringValue;
  document.getElementById("role").value=f.role.stringValue;
  showMessage("Editing user");
}
function deleteUser(docId){
  confirmDelete("Delete this user?", async confirmed=>{
    if(confirmed){
      await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,{method:'DELETE'});
      showMessage("User deleted"); loadUsers();
    }
  });
}

// Form submissions
document.getElementById('productForm').onsubmit = async e=>{
  e.preventDefault();
  const docId = document.getElementById('productId').value || Date.now().toString();
  const name = document.getElementById('name').value;
  const imgurl = document.getElementById('imgurl').value;
  const description = document.getElementById('description').value;
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;
  const category = document.getElementById('category').value;
  const docData={fields:{name:{stringValue:name},imgurl:{stringValue:imgurl},description:{stringValue:description},quantity:{stringValue:quantity},price:{stringValue:price},category:{stringValue:category}}};
  await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`,{method:'PATCH',body:JSON.stringify(docData)});
  showMessage("Product added/updated"); loadProducts(); e.target.reset();
};

document.getElementById('userForm').onsubmit = async e=>{
  e.preventDefault();
  const docId = document.getElementById('userDocId').value || Date.now().toString();
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const role = document.getElementById('role').value;
  const docData={fields:{fullName:{stringValue:fullName},email:{stringValue:email},phone:{stringValue:phone},role:{stringValue:role}}};
  await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,{method:'PATCH',body:JSON.stringify(docData)});
  showMessage("User added/updated"); loadUsers(); e.target.reset();
};
verifyAdmin();