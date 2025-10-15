// const projectId = "flippedcart8751";
// const apiKey = "AIzaSyAR10NJqR8wUDIimsxHMsW307P_vdbO_dE";
// let adminEmail = null;
// let deleteCallback = null;

// // Messages
// const messageContainer = document.getElementById('messageContainer');
// const overlay = document.getElementById('overlay');
// const overlayMessage = document.getElementById('overlayMessage');
// const overlayYes = document.getElementById('overlayYes');
// const overlayNo = document.getElementById('overlayNo');

// function showMessage(msg,type='info'){
//   messageContainer.innerText = msg;
//   messageContainer.style.display = 'block';
//   messageContainer.style.color = type==='error'?'red':'green';
//   setTimeout(()=>{ messageContainer.style.display='none'; },3000);
// }

// // Sections
// function showSection(section){
//   document.querySelectorAll('.section').forEach(sec=>sec.style.display='none');
//   document.getElementById(section+'Section').style.display='block';
// }
// function showTab(tab){
//   document.querySelectorAll('.tabContent').forEach(t=>t.style.display='none');
//   document.getElementById(tab+'Tab').style.display='block';
// }

// // Sign out
// function signOut(){
//   sessionStorage.clear();
//   window.location.href="../index.html";
// }

// // Overlay
// function confirmDelete(message, callback){
//   overlayMessage.innerText = message;
//   overlay.style.display='flex';
//   deleteCallback = callback;
// }
// overlayYes.onclick = ()=>{ overlay.style.display='none'; if(deleteCallback) deleteCallback(true); };
// overlayNo.onclick = ()=>{ overlay.style.display='none'; if(deleteCallback) deleteCallback(false); };

// // Verify admin
// async function verifyAdmin(){
//   const email = sessionStorage.getItem("googleEmail");
//   if(!email){ window.location.href="index.html"; return; }
//   adminEmail = email;
//   document.getElementById("adminEmail").innerText = adminEmail;
//   document.getElementById("profileEmail").innerText = adminEmail;
//   const docId = email.replace(/[@.]/g,'_');
//   const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin/${docId}?key=${apiKey}`;
//   const res = await fetch(url);
//   if(!res.ok){ window.location.href="index.html"; }
//   else{ loadProducts(); loadUsers(); }
// }

// // --- Product Pagination ---
// let allProducts = [];
// let currentPage = 1;
// const productsPerPage = 4;

// // Load products
// async function loadProducts(){
//   const filter = document.getElementById('filterCategory').value;
//   const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?key=${apiKey}`);
//   const data = await res.json();
//   const container = document.getElementById("productContainer");
//   container.innerHTML='';
//   const catSelect = document.getElementById('filterCategory');
//   catSelect.innerHTML='<option value="">All Categories</option>';
//   if(!data.documents) return;
//   const categories = new Set();
//   allProducts = data.documents.filter(doc=>{
//     const f = doc.fields;
//     categories.add(f.category.stringValue);
//     if(filter && f.category.stringValue!==filter) return false;
//     return true;
//   });
//   categories.forEach(c=>{
//     const option = document.createElement('option');
//     option.value=c; option.innerText=c;
//     catSelect.appendChild(option);
//   });
//   currentPage = 1;
//   renderProductPage();
// }

// function renderProductPage(){
//   const container = document.getElementById("productContainer");
//   container.innerHTML='';
//   const start = (currentPage-1)*productsPerPage;
//   const end = start + productsPerPage;
//   const pageProducts = allProducts.slice(start,end);

//   pageProducts.forEach(doc=>{
//     const f = doc.fields;
//     const card = document.createElement("div"); card.className="card";
//     card.innerHTML=`
//       <img src="${f.imgurl.stringValue}" alt="">
//       <div class="card-content">
//         <h3>${f.name.stringValue}</h3>
//         <p>${f.description.stringValue}</p>
//         <p class="price">₹${f.price.stringValue}</p>
//         <p class="stock">Stock: ${f.quantity.stringValue}</p>
//         <p class="category">Category: ${f.category.stringValue}</p>
//       </div>
//       <div class="action-buttons">
//         <button class="edit-btn" onclick="editProduct('${doc.name.split('/').pop()}')">✏️ Edit</button>
//         <button class="delete-btn" onclick="deleteProduct('${doc.name.split('/').pop()}')">🗑️ Delete</button>
//       </div>
//     `;
//     container.appendChild(card);
//   });

//   renderPaginationButtons();
// }

// function renderPaginationButtons(){
//   const container = document.getElementById("productContainer");
//   const totalPages = Math.ceil(allProducts.length / productsPerPage);
//   const paginationDiv = document.createElement('div');
//   paginationDiv.style.textAlign='center'; paginationDiv.style.marginTop='10px';

//   if(currentPage>1){
//     const prevBtn = document.createElement('button');
//     prevBtn.innerText='Prev';
//     prevBtn.onclick=()=>{ currentPage--; renderProductPage(); };
//     paginationDiv.appendChild(prevBtn);
//   }

//   if(currentPage<totalPages){
//     const nextBtn = document.createElement('button');
//     nextBtn.innerText='Next';
//     nextBtn.onclick=()=>{ currentPage++; renderProductPage(); };
//     paginationDiv.appendChild(nextBtn);
//   }

//   container.appendChild(paginationDiv);
// }

// // Load users with search
// async function loadUsers(){
//   const search = document.getElementById('searchUsers').value.toLowerCase();
//   const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`);
//   const data = await res.json();
//   const container = document.getElementById("userContainer");
//   container.innerHTML='';
//   if(!data.documents) return;
//   data.documents.forEach(doc=>{
//     const f = doc.fields;
//     if(search && !(f.email.stringValue.toLowerCase().includes(search) || f.fullName.stringValue.toLowerCase().includes(search))) return;
//     const card = document.createElement("div"); card.className="card";
//     card.innerHTML=`
//       <h3>${f.fullName.stringValue}</h3>
//       <p>Email: ${f.email.stringValue}</p>
//       <p>Phone: ${f.phone.stringValue}</p>
//       <p>Role: ${f.role.stringValue}</p>
//       <div class="action-buttons">
//         <button class="edit-btn" onclick="editUser('${doc.name.split('/').pop()}')">✏️ Edit</button>
//         <button class="delete-btn" onclick="deleteUser('${doc.name.split('/').pop()}')">🗑️ Delete</button>
//       </div>
//     `;
//     container.appendChild(card);
//   });
// }

// // Edit / Delete
// async function editProduct(docId){
//   const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`);
//   const f = (await res.json()).fields;
//   document.getElementById("productId").value = docId;
//   document.getElementById("name").value = f.name.stringValue;
//   document.getElementById("imgurl").value = f.imgurl.stringValue;
//   document.getElementById("description").value = f.description.stringValue;
//   document.getElementById("quantity").value = f.quantity.stringValue;
//   document.getElementById("price").value = f.price.stringValue;
//   document.getElementById("category").value = f.category.stringValue;
//   showMessage("Editing product");
// }

// function deleteProduct(docId){
//   confirmDelete("Delete this product?", async confirmed=>{
//     if(confirmed){
//       await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`,{method:'DELETE'});
//       showMessage("Product deleted");
//       loadProducts();
//     }
//   });
// }

// async function editUser(docId){
//   const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`);
//   const f = (await res.json()).fields;
//   document.getElementById("userDocId").value = docId;
//   document.getElementById("fullName").value = f.fullName.stringValue;
//   document.getElementById("email").value = f.email.stringValue;
//   document.getElementById("phone").value = f.phone.stringValue;
//   document.getElementById("role").value = f.role.stringValue;
//   showMessage("Editing user");
// }

// function deleteUser(docId){
//   confirmDelete("Delete this user?", async confirmed=>{
//     if(confirmed){
//       await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,{method:'DELETE'});
//       showMessage("User deleted"); loadUsers();
//     }
//   });
// }

// // --- Form submissions ---
// function generateId(){ return Math.random().toString(36).substr(2,9); }

// document.getElementById('productForm').onsubmit = async e=>{
//   e.preventDefault();
//   const docId = document.getElementById('productId').value || generateId();
//   const name = document.getElementById('name').value;
//   const imgurl = document.getElementById('imgurl').value;
//   const description = document.getElementById('description').value;
//   const quantity = document.getElementById('quantity').value;
//   const price = document.getElementById('price').value;
//   const category = document.getElementById('category').value;
//   const docData={fields:{name:{stringValue:name},imgurl:{stringValue:imgurl},description:{stringValue:description},quantity:{stringValue:quantity},price:{stringValue:price},category:{stringValue:category}}};
//   await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`,{method:'PATCH',body:JSON.stringify(docData)});
//   showMessage("Product added/updated"); loadProducts(); e.target.reset();
// };

// document.getElementById('userForm').onsubmit = async e=>{
//   e.preventDefault();
//   const docId = document.getElementById('userDocId').value || generateId();
//   const fullName = document.getElementById('fullName').value;
//   const email = document.getElementById('email').value;
//   const phone = document.getElementById('phone').value;
//   const role = document.getElementById('role').value;
//   const docData={fields:{fullName:{stringValue:fullName},email:{stringValue:email},phone:{stringValue:phone},role:{stringValue:role}}};
//   await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,{method:'PATCH',body:JSON.stringify(docData)});
//   showMessage("User added/updated"); loadUsers(); e.target.reset();
// };

// verifyAdmin();

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

function showMessage(msg, type='info'){
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
  if(!email){ window.location.href="index.html"; return; }
  adminEmail = email;
  document.getElementById("adminEmail").innerText = adminEmail;
  document.getElementById("profileEmail").innerText = adminEmail;
  const docId = email.replace(/[@.]/g,'_');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin/${docId}?key=${apiKey}`;
  const res = await fetch(url);
  if(!res.ok){ window.location.href="index.html"; }
  else{ loadProducts(); loadUsers(); }
}

// --- Product Pagination ---
let allProducts = [];
let currentPage = 1;
const productsPerPage = 4;

// Load products
async function loadProducts(){
  const filter = document.getElementById('filterCategory').value;
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?key=${apiKey}`);
  const data = await res.json();
  const container = document.getElementById("productContainer");
  container.innerHTML='';
  const catSelect = document.getElementById('filterCategory');
  catSelect.innerHTML='<option value="">All Categories</option>';
  if(!data.documents) return;
  const categories = new Set();
  allProducts = data.documents.filter(doc=>{
    const f = doc.fields;
    categories.add(f.category.stringValue);
    if(filter && f.category.stringValue!==filter) return false;
    return true;
  });
  categories.forEach(c=>{
    const option = document.createElement('option');
    option.value=c; option.innerText=c;
    catSelect.appendChild(option);
  });
  currentPage = 1;
  renderProductPage();
}

function renderProductPage(){
  const container = document.getElementById("productContainer");
  container.innerHTML='';
  const start = (currentPage-1)*productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = allProducts.slice(start,end);

  pageProducts.forEach(doc=>{
    const f = doc.fields;
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

  renderPaginationButtons();
}

function renderPaginationButtons(){
  const container = document.getElementById("productContainer");
  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  const paginationDiv = document.createElement('div');
  paginationDiv.style.textAlign='center'; paginationDiv.style.marginTop='10px';

  if(currentPage>1){
    const prevBtn = document.createElement('button');
    prevBtn.innerText='Prev';
    prevBtn.onclick=()=>{ currentPage--; renderProductPage(); };
    paginationDiv.appendChild(prevBtn);
  }

  if(currentPage<totalPages){
    const nextBtn = document.createElement('button');
    nextBtn.innerText='Next';
    nextBtn.onclick=()=>{ currentPage++; renderProductPage(); };
    paginationDiv.appendChild(nextBtn);
  }

  container.appendChild(paginationDiv);
}

// Load users with search + report button
async function loadUsers(){
  const search = document.getElementById('searchUsers').value.toLowerCase();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`);
  const data = await res.json();
  const container = document.getElementById("userContainer");
  container.innerHTML='';
  if(!data.documents) return;
  data.documents.forEach(doc=>{
    const f = doc.fields;
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
      <button class="report-btn" onclick="generateUserReport('${doc.name.split('/').pop()}')">📄 Report</button>
    </div>
    `;
    container.appendChild(card);
  });
}

// Report popup + PDF
// async function generateUserReport(email, fullName, phone, role){
//   showMessage("Generating report...");
  
//   // Fetch order history
//   const ordersRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/OrderHistory?key=${apiKey}`);
//   const ordersData = await ordersRes.json();
//   const allOrders = ordersData.documents || [];
//   console.log(allOrders);
//   const userOrders = allOrders.filter(o => o.fields.userId.stringValue === email);

//   let reportHTML = `
//     <div style="padding:20px;font-family:Arial;">
//       <h2>User Report - ${fullName}</h2>
//       <p><b>Email:</b> ${email}</p>
//       <p><b>Phone:</b> ${phone}</p>
//       <p><b>Role:</b> ${role}</p>
//       <hr>
//       <h3>Order Summary</h3>
//   `;

//   if(userOrders.length === 0){
//     reportHTML += "<p>No orders found.</p>";
//   } else {
//     reportHTML += `
//       <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;">
//         <tr style="background:#4a4ae8;color:white;">
//           <th>Order ID</th>
//           <th>Product</th>
//           <th>Qty</th>
//           <th>Price</th>
//           <th>Total</th>
//           <th>Status</th>
//           <th>Order Date</th>
//           <th>Delivery Date</th>
//         </tr>
//     `;
//     userOrders.forEach(o=>{
//       const f = o.fields;
//       reportHTML += `
//         <tr>
//           <td>${o.name.split('/').pop()}</td>
//           <td>${f.title?.stringValue || '-'}</td>
//           <td>${f.quantity?.integerValue || f.quantity?.stringValue || '-'}</td>
//           <td>${f.price?.doubleValue || f.price?.integerValue || '-'}</td>
//           <td>${f.total?.doubleValue || f.total?.integerValue || '-'}</td>
//           <td>${f.status?.stringValue || '-'}</td>
//           <td>${f.orderDate?.timestampValue ? new Date(f.orderDate.timestampValue).toDateString() : '-'}</td>
//           <td>${f.deliveryDate?.timestampValue ? new Date(f.deliveryDate.timestampValue).toDateString() : '-'}</td>
//         </tr>
//       `;
//     });
//     reportHTML += "</table>";
//   }
//   reportHTML += "</div>";

//   // Show preview and confirm PDF download
//   const confirmPDF = confirm("Preview report generated. Do you want to download as PDF?");
//   if(confirmPDF){
//     const blob = new Blob([reportHTML], {type:'text/html'});
//     const pdfWindow = window.open('', '_blank');
//     pdfWindow.document.write(reportHTML);
//     pdfWindow.document.close();
//     pdfWindow.print();
//   } else {
//     const previewWin = window.open('', '_blank');
//     previewWin.document.write(reportHTML);
//     previewWin.document.close();
//   }
// }

async function generateUserReport(docId) {
  const userRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`);
  const userData = await userRes.json();
  const u = userData.fields;

  const ordersRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/OrderHistory?key=${apiKey}`);
  const ordersData = await ordersRes.json();

  const userOrders = ordersData.documents
    ? ordersData.documents.filter(d => d.fields.userId.stringValue === u.email.stringValue)
    : [];

  let tableRows = '';
  if (userOrders.length > 0) {
    tableRows = userOrders.map(o => {
      const f = o.fields;
      return `
        <tr>
          <td>${f.orderId?.stringValue || '-'}</td>
          <td>${f.title?.stringValue || '-'}</td>
          <td>${f.price?.doubleValue || '-'}</td>
          <td>${f.quantity?.integerValue || '-'}</td>
          <td>${f.status?.stringValue || '-'}</td>
          <td>${f.deliveryDate?.stringValue || '-'}</td>
        </tr>
      `;
    }).join('');
  } else {
    tableRows = `<tr><td colspan="6" style="text-align:center;">No Orders Found</td></tr>`;
  }

  const html = `
    <h2>User Report</h2>
    <p><b>Name:</b> ${u.fullName.stringValue}</p>
    <p><b>Email:</b> ${u.email.stringValue}</p>
    <p><b>Phone:</b> ${u.phone.stringValue}</p>
    <p><b>Role:</b> ${u.role.stringValue}</p>
    <h3>Order Summary</h3>
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr><th>Order ID</th><th>Product</th><th>Price</th><th>Qty</th><th>Status</th><th>Delivery Date</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const modal = document.getElementById('reportModal');
  document.getElementById('reportContent').innerHTML = html;
  modal.style.display = 'flex';

  document.getElementById('downloadPdfBtn').onclick = () => downloadReportPDF(u);
}

function closeReport() {
  document.getElementById('reportModal').style.display = 'none';
}

function downloadReportPDF(u) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.html(document.getElementById('reportContent'), {
    callback: function (pdf) {
      pdf.save(`${u.fullName.stringValue}_Report.pdf`);
    },
    x: 20,
    y: 20,
    html2canvas: { scale: 0.6 },
  });
}


// Edit / Delete
async function editProduct(docId){
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`);
  const f = (await res.json()).fields;
  document.getElementById("productId").value = docId;
  document.getElementById("name").value = f.name.stringValue;
  document.getElementById("imgurl").value = f.imgurl.stringValue;
  document.getElementById("description").value = f.description.stringValue;
  document.getElementById("quantity").value = f.quantity.stringValue;
  document.getElementById("price").value = f.price.stringValue;
  document.getElementById("category").value = f.category.stringValue;
  showMessage("Editing product");
}

function deleteProduct(docId){
  confirmDelete("Delete this product?", async confirmed=>{
    if(confirmed){
      await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${docId}?key=${apiKey}`,{method:'DELETE'});
      showMessage("Product deleted");
      loadProducts();
    }
  });
}

async function editUser(docId){
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`);
  const f = (await res.json()).fields;
  document.getElementById("userDocId").value = docId;
  document.getElementById("fullName").value = f.fullName.stringValue;
  document.getElementById("email").value = f.email.stringValue;
  document.getElementById("phone").value = f.phone.stringValue;
  document.getElementById("role").value = f.role.stringValue;
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

// --- Form submissions ---
function generateId(){ return Math.random().toString(36).substr(2,9); }

document.getElementById('productForm').onsubmit = async e=>{
  e.preventDefault();
  const docId = document.getElementById('productId').value || generateId();
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
  const docId = document.getElementById('userDocId').value || generateId();
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const role = document.getElementById('role').value;
  const docData={fields:{fullName:{stringValue:fullName},email:{stringValue:email},phone:{stringValue:phone},role:{stringValue:role}}};
  await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,{method:'PATCH',body:JSON.stringify(docData)});
  showMessage("User added/updated"); loadUsers(); e.target.reset();
};

verifyAdmin();
