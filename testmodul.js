import { auth, db, collection, getDocs, doc, updateDoc, onAuthStateChanged } from './firebase-config.js';

let tickets = [];

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Service')) {
                await loadTickets();
                renderTickets();
            } else {
                alert("Du har inte behörighet att se denna sida.");
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});

async function loadTickets() {
    try {
        const querySnapshot = await getDocs(collection(db, 'service-tickets'));
        tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

function renderTickets() {
    const todoList = document.getElementById('todo-list');
    const inProgressList = document.getElementById('in-progress-list');
    const doneList = document.getElementById('done-list');

    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';

    tickets.forEach(ticket => {
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.textContent = `${ticket.title} - ${ticket.description}`;
        ticketItem.draggable = true;
        ticketItem.id = ticket.id;
        ticketItem.ondragstart = drag;

        if (ticket.status === 'todo') {
            todoList.appendChild(ticketItem);
        } else if (ticket.status === 'in-progress') {
            inProgressList.appendChild(ticketItem);
        } else if (ticket.status === 'done') {
            doneList.appendChild(ticketItem);
        }
    });
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

async function drop(event) {
    event.preventDefault();
    const ticketId = event.dataTransfer.getData('text');
    const ticketElement = document.getElementById(ticketId);
    const newStatus = event.target.closest('.ticket-list').id.split('-')[0];

    // Flytta elementet till rätt lista
    event.target.appendChild(ticketElement);

    // Uppdatera status på biljetten och spara i Firebase
    await updateTicketStatus(ticketId, newStatus);
}

async function updateTicketStatus(ticketId, newStatus) {
    const ticketRef = doc(db, 'service-tickets', ticketId);
    try {
        await updateDoc(ticketRef, { status: newStatus });
        console.log('Ticket status updated successfully');
    } catch (error) {
        console.error('Error updating ticket status:', error);
    }
}

function navigateTo(page) {
    window.location.href = page;
}
