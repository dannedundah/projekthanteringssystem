import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYqBOra2wDjyPweyBGnkVMANsvLOx9pps",
  authDomain: "projekthanteringsystem.firebaseapp.com",
  projectId: "projekthanteringsystem",
  storageBucket: "projekthanteringsystem.appspot.com",
  messagingSenderId: "87207954816",
  appId: "1:87207954816:web:167659270c0d6eee901965",
  measurementId: "G-8HMD30CFYS"
};

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();

// Function to handle role-based access
function handleRoleBasedAccess(role) {
  const adminModules = document.getElementById('admin-module');
  const montorModules = document.getElementById('montor-module');
  const saljareModules = document.getElementById('saljare-module');
  const serviceModules = document.getElementById('service-module');
  const elektrikerModules = document.getElementById('elektriker-module');

  // Hide all modules initially
  if (adminModules) adminModules.style.display = 'none';
  if (montorModules) montorModules.style.display = 'none';
  if (saljareModules) saljareModules.style.display = 'none';
  if (serviceModules) serviceModules.style.display = 'none';
  if (elektrikerModules) elektrikerModules.style.display = 'none';

  // Show modules based on the user's role
  if (role === 'Admin') {
    if (adminModules) adminModules.style.display = 'block';
  } else if (role === 'Montör') {
    if (montorModules) montorModules.style.display = 'block';
  } else if (role === 'Säljare') {
    if (saljareModules) saljareModules.style.display = 'block';
  } else if (role === 'Service') {
    if (serviceModules) serviceModules.style.display = 'block';
  } else if (role === 'Elektriker') {
    if (elektrikerModules) elektrikerModules.style.display = 'block';
  } else {
    alert('Du har inte behörighet att se denna sida.');
    window.location.href = 'index.html';
  }
}

// Check authentication state and fetch user data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);

        // Handle role-based access
        handleRoleBasedAccess(userData.role);
      } else {
        console.log("No user document found.");
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      window.location.href = 'login.html';
    }
  } else {
    console.log("No user is signed in.");
    window.location.href = 'login.html';
  }
});

// Function to update user's team
async function updateUserTeam(userId, newTeam) {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      team: newTeam
    });
    console.log("Team updated successfully for user:", userId);
    await loadUsersAndRender(); // Reload and render the user list
  } catch (error) {
    console.error("Error updating team:", error);
  }
}

// Function to update user's role
async function updateUserRole(userId, newRole) {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      role: newRole
    });
    console.log("Role updated successfully for user:", userId);
    await loadUsersAndRender(); // Reload and render the user list
  } catch (error) {
    console.error("Error updating role:", error);
  }
}

// Function to render user list
function renderUserList(users) {
  const userListContainer = document.getElementById('user-list');
  userListContainer.innerHTML = ''; // Clear the list first

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.textContent = `${user.firstName} ${user.lastName} - Team: ${user.team} - Roll: ${user.role}`;
    userListContainer.appendChild(userItem);
  });
}

// Function to load and render the user list
async function loadUsersAndRender() {
  const usersQuery = await getDocs(collection(db, 'users'));
  const users = usersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderUserList(users);
}

// Initial load of users
loadUsersAndRender();

window.navigateTo = (page) => {
  window.location.href = page;
};
