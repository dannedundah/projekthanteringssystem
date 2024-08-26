import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to fetch projects
const fetchProjects = async () => {
  console.log('Fetching projects...');
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Projects:', projects);

    // Handle displaying projects in your UI
    const projectContainer = document.getElementById('project-list'); // Assuming you have an element with this ID
    projectContainer.innerHTML = ''; // Clear previous content
    projects.forEach(project => {
      const li = document.createElement('li');
      li.textContent = project.name; // Customize as needed
      projectContainer.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching projects: ", error);
  }
};

// Check authentication state and handle permissions
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in, fetch projects
    fetchProjects();

    // Fetch user role and handle module visibility
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData.role === 'Montör') {
      // Show Montör modules
      document.getElementById('montor-module').style.display = 'block';
    } else if (userData.role === 'Säljare') {
      // Show Säljare modules
      document.getElementById('saljare-module').style.display = 'block';
    } else if (userData.role === 'Service') {
      // Show Service modules
      document.getElementById('service-module').style.display = 'block';
    } else if (userData.role === 'Admin') {
      // Show Admin modules
      document.getElementById('admin-module').style.display = 'block';
    }
  } else {
    console.log("No user is signed in.");
    // Optionally redirect to login page
    window.location.href = 'login.html';
  }
});
