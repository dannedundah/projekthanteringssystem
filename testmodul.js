import { db, collection, addDoc, getDocs, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticket-form');
    const newList = document.getElementById('new-list');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');

    let tickets = [];

    // Ladda existerande ärenden från Firestore
    async function loadTickets() {
        const querySnapshot = await getDocs(collection(db, 'service-tickets'));
        tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTickets();
    }

    // Rendera ärenden i respektive kolumn
    function renderTickets() {
        newList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';

        tickets.forEach(ticket => {
            const listItem = document.createElement('li');
            listItem.textContent = `${ticket.description} - ${ticket.responsible} (${ticket.priority})`;
            listItem.dataset.id = ticket.id;

            if (ticket.status === 'Nytt') {
                newList.appendChild(listItem);
            } else if (ticket.status === 'Pågående') {
                inProgressList.appendChild(listItem);
            } else if (ticket.status === 'Färdigt') {
                completedList.appendChild(listItem);
            }
        });
    }

    // Skapa ett nytt ärende
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const description = document.getElementById('description').value;
        const responsible = document.getElementById('responsible').value;
        const priority = document.getElementById('priority').value;

        try {
            await addDoc(collection(db, 'service-tickets'), {
                description,
                responsible,
                priority,
                status: 'Nytt'
            });
            loadTickets();
        } catch (error) {
            console.error('Error adding ticket:', error);
        }

        ticketForm.reset();
    });

    // Drag-and-drop via Sortable.js
    const sortableNew = new Sortable(newList, {
        group: 'tickets',
        animation: 150,
        onEnd: async (evt) => {
            const ticketId = evt.item.dataset.id;
            await updateTicketStatus(ticketId, 'Nytt');
        }
    });

    const sortableInProgress = new Sortable(inProgressList, {
        group: 'tickets',
        animation: 150,
        onEnd: async (evt) => {
            const ticketId = evt.item.dataset.id;
            await updateTicketStatus(ticketId, 'Pågående');
        }
    });

    const sortableCompleted = new Sortable(completedList, {
        group: 'tickets',
        animation: 150,
        onEnd: async (evt) => {
            const ticketId = evt.item.dataset.id;
            await updateTicketStatus(ticketId, 'Färdigt');
        }
    });

    // Uppdatera status på ärendet i Firestore
    async function updateTicketStatus(ticketId, newStatus) {
        const ticketRef = doc(db, 'service-tickets', ticketId);
        await updateDoc(ticketRef, { status: newStatus });
        loadTickets();
    }

    loadTickets();
});
