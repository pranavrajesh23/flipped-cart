// 🔹 Config
const projectId = "flippedcart8751"; // Firebase project ID
const apiKey = "AIzaSyAR10NJqR8wUDIimsxHMsW307P_vdbO_dE";       // Firebase Web API key

let idToken = null;
let googleEmail = null;
let selectedRole = null;

// 🔹 Decode Google ID token to get email
function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(atob(base64).split('').map(function(c){
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join('')));
}

// 🔹 Google login callback
async function handleGoogleLogin(response){
    idToken = response.credential;
    const payload = parseJwt(idToken);
    googleEmail = payload.email;

    
    // ✅ store email immediately after login
    sessionStorage.setItem("googleEmail", googleEmail);
    await signInWithFirebase(idToken);
    const docId = googleEmail.replace(/[@.]/g,'_');

    try {
        const adminUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin/${docId}?key=${apiKey}`;
        const userUrl  = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`;

        let res = await fetch(adminUrl);
        if(res.ok){
            sessionStorage.setItem("role", "Admin"); // ✅ store role
            window.location.href = "Admin/admin.html";
            return;
        }

        res = await fetch(userUrl);
        if(res.ok){
            sessionStorage.setItem("role", "User"); // ✅ store role
            window.location.href = "User/user.html";
            return;
        }

        document.getElementById("loginCard").style.display="none";
        document.getElementById("roleForm").style.display="block";

    } catch(err){
        alert("Error checking user role: "+err);
    }
}

// 🔹 After Google login, add this
async function signInWithFirebase(idToken) {
    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postBody: `id_token=${idToken}&providerId=google.com`,
                    requestUri: window.location.origin,
                    returnSecureToken: true
                })
            }
        );

        const data = await response.json();
        if(data.error) throw new Error(data.error.message);

        console.log("Firebase Auth user:", data);
        // Optional: save Firebase ID token in session
        sessionStorage.setItem("firebaseIdToken", data.idToken);

    } catch(err) {
        alert("Firebase Auth error: " + err);
    }
}


// 🔹 Submit role
function submitRole(){
    selectedRole = document.getElementById("roleSelect").value;
    if(!selectedRole) return alert("Choose a role");

    document.getElementById("roleForm").style.display="none";

    if(selectedRole==="User"){
        document.getElementById("extraForm").style.display="block";
    } else {
        // Admin → register directly
        registerInFirestore({});
    }
}

// 🔹 Submit extra info
function submitExtraInfo(){
    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    if(!fullName || !phone) return alert("Fill all fields");

    registerInFirestore({ fullName, phone });
}

// 🔹 Register in Firestore REST API
async function registerInFirestore(extraInfo){
    const collection = selectedRole==="Admin"?"admin":"users";
    const docId = googleEmail.replace(/[@.]/g,'_'); // make safe doc id
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${docId}&key=${apiKey}`;

    // Prepare body in Firestore format
    const body = {
        fields: {
            role: { stringValue: selectedRole },
            email: { stringValue: googleEmail },
            ...Object.fromEntries(Object.entries(extraInfo).map(([k,v])=>[k,{stringValue:v}]))
        }
    };

    try{
        await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
        if(selectedRole==="Admin") window.location.href="admin.html";
        else window.location.href="user.html";
    } catch(err){
        alert("Error registering user: "+err);
    }
}