const PROJECT_ID = "flippedcart8751";
const API_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`;
const userEmail = sessionStorage.getItem("googleEmail");

// Navbar links
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = "../index.html";
});
document.getElementById('wishlistLink').addEventListener('click', () => window.location.href = "../Wishlist/wishlist.html");
document.getElementById('cartLink').addEventListener('click', () => window.location.href = "../Cart/cart.html");
document.getElementById('ordersLink').addEventListener('click', () => window.location.href = "../Orders/orders.html");
document.getElementById('profileLink').addEventListener('click', () => window.location.href = "../Profile/profile.html");

// Greet user
let localPart = userEmail.split('@')[0];
let namePart = localPart.split(/[0-9]/)[0];
namePart = namePart.toUpperCase();
document.getElementById('orderpage').textContent = `HI ${namePart}, YOU'RE IN YOUR PROFILE PAGE`;

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

  userDocPath = userDoc.name.replace(`projects/${PROJECT_ID}/databases/(default)/documents/`, "");
  fieldsData = userDoc.fields;

  document.getElementById("userName").textContent = fieldsData.fullName?.stringValue || "User";
  if (fieldsData.profilePic?.stringValue)
    document.getElementById("profilePic").src = fieldsData.profilePic.stringValue;

  renderProfile(fieldsData);
}

function renderProfile(fields) {
  const container = document.getElementById("profileFields");
  container.innerHTML = "";

  // Display fields in fixed order
  const fieldMap = {
    fullName: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    dob: "Date of Birth"
  };

  const orderedKeys = Object.keys(fieldMap);

  for (const key of orderedKeys) {
    const labelText = fieldMap[key];
    const value = fields[key]?.stringValue || "";

    const div = document.createElement("div");
    div.className = "profile-field";

    const label = document.createElement("label");
    label.textContent = `${labelText}:`;

    const input = document.createElement("input");
    input.id = key;
    input.value = value;
    input.readOnly = true;

    div.appendChild(label);
    div.appendChild(input);
    container.appendChild(div);
  }
}

document.getElementById("updateBtn").addEventListener("click", enableEditing);
function enableEditing() {
  document.querySelectorAll("#profileFields input").forEach(input => input.readOnly = false);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "block";
  document.getElementById("addFieldSection").style.display = "block";
}
async function saveChanges() {
  const inputs = document.querySelectorAll("#profileFields input");
  const updatedFields = {};
  const maskParams = [];

  inputs.forEach(input => {
    const key = input.id;
    const val = input.value;
    updatedFields[key] = { stringValue: val };
    // add to updateMask
    maskParams.push(`updateMask.fieldPaths=${encodeURIComponent(key)}`);
  });

  const body = JSON.stringify({ fields: updatedFields });

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${userDocPath}?${maskParams.join("&")}`;

  const res = await fetch(url, {
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
    const errText = await res.text();
    console.error("Error updating:", res.status, errText);
    alert("Failed to update profile! See console for details.");
  }
}

function addField() {
  const name = document.getElementById("newFieldName").value.trim();
  const value = document.getElementById("newFieldValue").value.trim();
  if (!name || !value) return alert("Please enter both name and value");

  const container = document.getElementById("profileFields");
  const div = document.createElement("div");
  div.className = "profile-field";

  const label = document.createElement("label");
  label.textContent = `${name}:`;
  const input = document.createElement("input");
  input.id = name;
  input.value = value;

  div.appendChild(label);
  div.appendChild(input);
  container.appendChild(div);

  document.getElementById("newFieldName").value = "";
  document.getElementById("newFieldValue").value = "";
}

// Delete Account
document.getElementById("deleteBtn").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete your account? This cannot be undone!")) return;

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${userDocPath}`, {
    method: "DELETE"
  });

  if (res.ok) {
    alert("Account deleted successfully!");
    sessionStorage.clear();
    window.location.href = "../index.html";
  } else alert("Failed to delete account!");
});

document.getElementById("historyBtn").addEventListener("click", () => {
  window.location.href = "../OrderHistory/orderhistory.html";
});

loadProfile();