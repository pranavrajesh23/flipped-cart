const PROJECT_ID = "flippedcart8751";
const API_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`;
const userEmail = sessionStorage.getItem("googleEmail"); // logged-in user email
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
document.getElementById('orderpage').textContent = `HI ${namePart}, YOU'RE PROFILE PAGE`;
let userDocPath = "";
let fieldsData = {};

async function loadProfile() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const userDoc = data.documents.find(doc => doc.fields.email.stringValue === userEmail);

  if (!userDoc) {
    document.getElementById("profileFields").innerHTML = `<p>No user found.</p>`;
    return;
  }

  userDocPath = userDoc.name.replace(
    `projects/${PROJECT_ID}/databases/(default)/documents/`,
    ""
  );
  fieldsData = userDoc.fields;
  console.log(fieldsData);
  document.getElementById("userName").textContent = fieldsData.fullName.stringValue || "User";
  renderProfile(fieldsData);
}

function renderProfile(fields) {
  const container = document.getElementById("profileFields");
  container.innerHTML = "";
  for (const key in fields) {
    const value = fields[key].stringValue || "";
    const label = document.createElement("label");
    label.textContent = key;

    const input = document.createElement("input");
    input.value = value;
    input.id = key;
    input.readOnly = true;

    container.appendChild(label);
    container.appendChild(input);
  }
}

function enableEditing() {
  document.querySelectorAll("#profileFields input").forEach(input => input.readOnly = false);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "block";
  document.getElementById("addFieldSection").style.display = "block";
}

function addField() {
  const name = document.getElementById("newFieldName").value.trim();
  const value = document.getElementById("newFieldValue").value.trim();
  if (!name || !value) return alert("Please enter both field name and value!");

  const label = document.createElement("label");
  label.textContent = name;
  const input = document.createElement("input");
  input.value = value;
  input.id = name;

  document.getElementById("profileFields").appendChild(label);
  document.getElementById("profileFields").appendChild(input);

  document.getElementById("newFieldName").value = "";
  document.getElementById("newFieldValue").value = "";
}

async function saveChanges() {
  const inputs = document.querySelectorAll("#profileFields input");
  const updatedFields = {};

  inputs.forEach(input => {
    updatedFields[input.id] = { stringValue: input.value };
  });

  const body = JSON.stringify({ fields: updatedFields });

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${userDocPath}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body
  });

  if (res.ok) {
    alert("Profile updated successfully!");
    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "block";
    document.getElementById("addFieldSection").style.display = "none";
    document.querySelectorAll("#profileFields input").forEach(input => input.readOnly = true);
  } else {
    alert("Failed to update profile!");
  }
}

loadProfile();