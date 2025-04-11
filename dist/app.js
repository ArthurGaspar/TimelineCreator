"use strict";
const STORAGE_KEY = 'timelineEvents';
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
function loadEvents() {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    if (storedEvents) {
        return JSON.parse(storedEvents);
    }
    return [
        {
            id: generateId(),
            date: {
                year: 1969,
                month: 7,
                day: 20
            },
            title: "Moon Landing",
            description: "Apollo 11 lands on the moon",
            category: "Science"
        },
        {
            id: generateId(),
            date: {
                year: 1822,
                month: 9,
                day: 7
            },
            title: "Brazilian Independence",
            description: "Dom Pedro I declared Brazil’s independence from Portugal by famously shouting, Independência ou Morte! (Independence or Death!) on the banks of the Ipiranga River in São Paulo.",
            category: "Politics"
        },
        {
            id: generateId(),
            date: {
                year: 1888,
                month: 5,
                day: 13
            },
            title: "Abolition of Slavery in Brazil",
            description: "Princess Isabel signed the Golden Law, officially abolishing slavery in Brazil. This made Brazil the last country in the Western world to end slavery.",
            category: "Politics"
        },
        {
            id: generateId(),
            date: {
                year: 1985,
                month: 3,
                day: 15
            },
            title: "End of Military Dictatorship",
            description: "The military dictatorship in Brazil ended, leading to the restoration of democracy.",
            category: "Politics"
        },
    ];
}
function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
let events = loadEvents();
let currentlyEditing = null;
// DOM
const yearInput = document.getElementById('yearInput');
const monthInput = document.getElementById('monthInput');
const dayInput = document.getElementById('dayInput');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const categoryInput = document.getElementById('categoryInput');
const addBtn = document.getElementById('addBtn');
const sortSelect = document.getElementById('sortSelect');
const filterSelect = document.getElementById('filterSelect');
const timeline = document.getElementById('timeline');
function init() {
    addBtn.addEventListener('click', handleAddOrUpdate);
    sortSelect.addEventListener('change', renderTimeline);
    filterSelect.addEventListener('change', renderTimeline);
    renderTimeline();
}
function handleAddOrUpdate() {
    const year = parseInt(yearInput.value);
    const month = parseInt(monthInput.value);
    const day = parseInt(dayInput.value);
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const category = categoryInput.value;
    if (isNaN(year) || !title || !description) {
        alert('Please fill in all fields with valid data');
        return;
    }
    if (month < 1 || month > 12) {
        alert('Please enter a valid month (1-12)');
        return;
    }
    if (day < 1 || day > 31) {
        alert('Please enter a valid day (1-31)');
        return;
    }
    if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
        alert('This month only has 30 days');
        return;
    }
    if (month === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        if (day > (isLeapYear ? 29 : 28)) {
            alert(`February ${year} only has ${isLeapYear ? 29 : 28} days`);
            return;
        }
    }
    if (currentlyEditing) {
        const index = events.findIndex(event => event.id === currentlyEditing);
        if (index !== -1) {
            events[index] = {
                id: currentlyEditing,
                date: { year, month, day },
                title,
                description,
                category
            };
        }
        currentlyEditing = null;
        addBtn.textContent = 'Add Event';
    }
    else {
        const newEvent = {
            id: generateId(),
            date: { year, month, day },
            title,
            description,
            category
        };
        events.push(newEvent);
    }
    saveEvents(events);
    clearForm();
    renderTimeline();
}
function clearForm() {
    yearInput.value = '';
    monthInput.value = '';
    dayInput.value = '';
    titleInput.value = '';
    descInput.value = '';
    categoryInput.value = 'Science';
}
function setupEditForm(event) {
    yearInput.value = event.date.toString();
    monthInput.value = event.date.month.toString();
    dayInput.value = event.date.day.toString();
    titleInput.value = event.title;
    descInput.value = event.description;
    categoryInput.value = event.category;
    currentlyEditing = event.id;
    addBtn.textContent = 'Update Event';
    yearInput.focus();
}
function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== id);
        saveEvents(events);
        renderTimeline();
        if (currentlyEditing === id) {
            currentlyEditing = null;
            clearForm();
            addBtn.textContent = 'Add Event';
        }
    }
}
function sortEvents(events, order) {
    return [...events].sort((a, b) => {
        if (a.date.year !== b.date.year) {
            return order === 'asc' ? a.date.year - b.date.year : b.date.year - a.date.year;
        }
        if (a.date.month !== b.date.month) {
            return order === 'asc' ? a.date.month - b.date.month : b.date.month - a.date.month;
        }
        return order === 'asc' ? a.date.day - b.date.day : b.date.day - a.date.day;
    });
}
function filterEvents(events, category) {
    if (category === 'all') {
        return events;
    }
    return events.filter(event => event.category === category);
}
function renderTimeline() {
    const sortOrder = sortSelect.value;
    const filterCategory = filterSelect.value;
    let processedEvents = [...events];
    processedEvents = filterEvents(processedEvents, filterCategory);
    processedEvents = sortEvents(processedEvents, sortOrder);
    timeline.innerHTML = '';
    processedEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `event ${event.category}`;
        eventElement.dataset.year = event.date.year.toString();
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${months[event.date.month - 1]} ${event.date.day}, ${event.date.year}`;
        eventElement.innerHTML = `
            <h3>${event.title}</h3>
            <div class="event-date">${formattedDate}</div>
            <p>${event.description}</p>
            <span class="category">${event.category}</span>
            <div class="event-actions">
                <button class="edit-btn" data-id="${event.id}">Edit</button>
                <button class="delete-btn" data-id="${event.id}">Delete</button>
            </div>
        `;
        timeline.appendChild(eventElement);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const event = events.find(ev => ev.id === id);
            if (event)
                setupEditForm(event);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteEvent(id);
        });
    });
}
init();
