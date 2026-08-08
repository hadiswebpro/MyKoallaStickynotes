/* ===============================
SERVICE WORKER
=============================== */

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
navigator.serviceWorker
.register('./sw.js')
.catch(error => {
console.error('Service Worker registration failed:', error);
});
});
}

/* ===============================
REMINDER SOUND
=============================== */

const reminderSound = new Audio('./sounds/reminder.mp3');
reminderSound.preload = "auto";
reminderSound.volume = 1.0;

/* ===============================
IMAGE PREVIEW
=============================== */

const imageInput = document.getElementById('note-image');

if (imageInput) {
imageInput.addEventListener('change', function () {
const file = this.files[0];
const preview = document.getElementById('image-preview');


    if (!file || !preview) {
        return;
    }

    preview.src = URL.createObjectURL(file);
    preview.classList.remove('hidden');
});


}

/* ===============================
DRAG & DROP
=============================== */

let draggedId = null;

function dragStart(event) {
draggedId = event.currentTarget.dataset.id;


event.currentTarget.classList.add('dragging');


}

function dragEnd(event) {
event.currentTarget.classList.remove('dragging');
}

function dragEnter(event) {
event.preventDefault();


if (event.currentTarget.dataset.id !== draggedId) {
    event.currentTarget.classList.add('drop-target');
}


}

function dragLeave(event) {
event.currentTarget.classList.remove('drop-target');
}

function allowDrop(event) {
event.preventDefault();
}

function drop(event) {
event.preventDefault();


event.currentTarget.classList.remove('drop-target');

const targetId = event.currentTarget.dataset.id;

if (draggedId === targetId) {
    return;
}

const draggedIndex = notes.findIndex(
    note => note.id == draggedId
);

const targetIndex = notes.findIndex(
    note => note.id == targetId
);

if (draggedIndex === -1 || targetIndex === -1) {
    return;
}

const temp = notes[draggedIndex];

notes.splice(draggedIndex, 1);
notes.splice(targetIndex, 0, temp);

saveToLocalStorage();
renderNotes();


}

/* ===============================
LOAD NOTES
=============================== */

let notes = [];

try {
notes =
JSON.parse(
localStorage.getItem('sticky_notes')
) || [];
} catch (error) {
console.error('Could not load notes:', error);
notes = [];
}

let editNoteId = null;

/* ===============================
DEFAULTS
=============================== */

let selectedBg = 'bg-amber-100/80';
let selectedBorder = 'border-amber-400';
let selectedSticker = '💡';


/* ===============================
MODAL
=============================== */

function openModal(isEdit = false) {


const modal =
    document.getElementById('note-modal');

const box =
    document.getElementById('modal-box');

const title =
    document.getElementById('modal-title');

title.textContent =
    isEdit
        ? 'Edit Note ✏️'
        : 'Create New Note 📝';

modal.classList.remove('hidden');

setTimeout(() => {

    modal.classList.remove('opacity-0');

    box.classList.remove('scale-95');

}, 50);

if (!isEdit) {

    document.getElementById(
        'note-image'
    ).value = '';

    document.getElementById(
        'image-preview'
    ).classList.add('hidden');
}


}

function closeModal() {


const modal =
    document.getElementById('note-modal');

const box =
    document.getElementById('modal-box');

modal.classList.add('opacity-0');

box.classList.add('scale-95');

setTimeout(() => {
    modal.classList.add('hidden');
}, 300);

document.getElementById(
    'note-text'
).value = '';

document.getElementById(
    'note-image'
).value = '';

document.getElementById(
    'note-reminder'
).value = '';

document.getElementById(
    'image-preview'
).classList.add('hidden');

editNoteId = null;


}

/* ===============================
COLOR
=============================== */

function selectColor(
bgClass,
borderClass,
element
) {


selectedBg = bgClass;
selectedBorder = borderClass;

document
    .querySelectorAll('.color-btn')
    .forEach(btn => {

        btn.classList.remove(
            'ring-2',
            'ring-offset-2',
            'ring-indigo-600'
        );

    });

if (element) {

    element.classList.add(
        'ring-2',
        'ring-offset-2',
        'ring-indigo-600'
    );
}


}

/* ===============================
STICKER
=============================== */

function selectSticky(
emoji,
element
) {


selectedSticker = emoji;

document
    .querySelectorAll('.sticker-btn')
    .forEach(btn => {
        btn.classList.remove('bg-white');
    });

if (element) {
    element.classList.add('bg-white');
}


}

/* ===============================
STORAGE
=============================== */

function saveToLocalStorage() {


localStorage.setItem(
    'sticky_notes',
    JSON.stringify(notes)
);


}

/* ===============================
SAVE NOTE
=============================== */

function saveNoteFinal(imageData) {


const textInput =
    document.getElementById('note-text');

if (
    !textInput.value.trim() &&
    !imageData
) {

    showKoalaAlert(
        'Please add text or image ✨💛'
    );

    return;
}

const reminder =
    document.getElementById(
        'note-reminder'
    ).value;

if (editNoteId !== null) {

    const noteIndex =
        notes.findIndex(
            note => note.id === editNoteId
        );

    if (noteIndex !== -1) {

        notes[noteIndex] = {
            ...notes[noteIndex],
            text: textInput.value,
            bg: selectedBg,
            border: selectedBorder,
            sticker: selectedSticker,
            image:
                imageData ||
                notes[noteIndex].image,
            reminder: reminder,
            notified: false
        };
    }

} else {

    notes.push({

        id: Date.now(),

        text: textInput.value,

        bg: selectedBg,

        border: selectedBorder,

        sticker: selectedSticker,

        image: imageData,

        completed: false,

        pinned: false,

        date: new Date().toLocaleDateString(),

        reminder: reminder,

        notified: false
    });
}

saveToLocalStorage();

renderNotes();

celebrateKoala();

showKoalaAlert(
    'New note added successfully 🎉'
);

closeModal();


}

function saveNote() {


const imageInput =
    document.getElementById('note-image');

if (
    imageInput.files &&
    imageInput.files[0]
) {

    const reader =
        new FileReader();

    reader.onload = function (event) {

        saveNoteFinal(
            event.target.result
        );
    };

    reader.readAsDataURL(
        imageInput.files[0]
    );

} else {

    saveNoteFinal('');
}

}

/* ===============================
SEARCH
=============================== */

function searchNotes() {


const value =
    document
        .getElementById('search-input')
        .value
        .toLowerCase()
        .trim();

if (!value) {

    renderNotes();

    document
        .getElementById('back-btn')
        .classList.add('hidden');

    return;
}

const filtered =
    notes.filter(note =>
        note.text
            .toLowerCase()
            .includes(value)
    );

renderFilteredNotes(filtered);

document
    .getElementById('back-btn')
    .classList.remove('hidden');


}

function showAllNotes() {


document
    .getElementById('search-input')
    .value = '';

renderNotes();

document
    .getElementById('back-btn')
    .classList.add('hidden');


}

/* ===============================
PIN
=============================== */

function togglePin(id) {


const note =
    notes.find(note => note.id === id);

if (!note) {
    return;
}

note.pinned = !note.pinned;

saveToLocalStorage();

renderNotes();


}

/* ===============================
REMINDERS
=============================== */
function checkReminders() {

    const now = new Date();

    notes.forEach(note => {

        if (
            !note.reminder ||
            note.notified ||
            new Date(note.reminder) > now
        ) {
            return;
        }

        // Mark as notified first
        note.notified = true;
        saveToLocalStorage();

        // 🔔 Browser notification
        if (Notification.permission === "granted") {

            try {

                new Notification("🐨 Koala Notes", {
                    body: note.text || "You have a reminder!",
                    icon: "./icons/icon-192.png",
                    tag: `reminder-${note.id}`
                });

            } catch (error) {

                console.log(
                    "Notification could not be shown:",
                    error
                );

            }
        }

        // 🔊 Reminder sound
        reminderSound.currentTime = 0;

        const playPromise = reminderSound.play();

        if (playPromise !== undefined) {

            playPromise.catch(error => {

                console.log(
                    "Browser blocked automatic sound:",
                    error
                );

                showKoalaAlert(
                    "⏰ Reminder! Tap the page to hear the sound 🐨"
                );

            });
        }

        // 🐨 In-app alert
        showKoalaAlert(
            `⏰ ${note.text || "You have a reminder!"}`
        );

        celebrateKoala();
    });
}

/* ===============================
KOALA CELEBRATION
=============================== */

function celebrateKoala() {


const koala =
    document.querySelector(
        '.koala-face'
    );

if (!koala) {
    return;
}

koala.classList.remove(
    'koala-happy'
);

void koala.offsetWidth;

koala.classList.add(
    'koala-happy'
);


}

/* ===============================
KOALA ALERT
=============================== */

function showKoalaAlert(message) {


const alertBox =
    document.createElement('div');

alertBox.className =
    'koala-alert';

alertBox.textContent =
    `🐨 ${message}`;

document.body.appendChild(
    alertBox
);

setTimeout(() => {
    alertBox.remove();
}, 2500);


}

/* ===============================
RENDER NOTES
=============================== */

function renderNotes() {


const pinnedContainer =
    document.getElementById(
        'pinned-container'
    );

const notesContainer =
    document.getElementById(
        'notes-container'
    );

if (
    !pinnedContainer ||
    !notesContainer
) {
    return;
}

const sortedNotes =
    [...notes].sort(
        (a, b) =>
            Number(b.pinned) -
            Number(a.pinned)
    );

pinnedContainer.innerHTML = '';
notesContainer.innerHTML = '';

if (sortedNotes.length === 0) {

    document.getElementById(
        'pinned-title'
    ).innerHTML = '';

    document.getElementById(
        'notes-title'
    ).innerHTML = '';

    notesContainer.innerHTML = `

        <div class="col-span-full flex flex-col items-center py-16">

            <img
                src="./images/koalasleep.png"
                alt="Sleeping Koala"
                class="w-40 mb-4 object-contain"
            >

            <div class="bg-white px-5 py-3 rounded-2xl shadow-md text-slate-600">
                I'm waiting for your ideas...
            </div>

        </div>
    `;

    return;
}

const pinnedCount =
    notes.filter(
        note => note.pinned
    ).length;

const normalCount =
    notes.filter(
        note => !note.pinned
    ).length;

document.getElementById(
    'pinned-title'
).innerHTML =
    `📌 Pinned Notes (${pinnedCount})`;

document.getElementById(
    'notes-title'
).innerHTML =
    `📝 All Notes (${normalCount})`;


sortedNotes.forEach(note => {

    const textStyle =
        note.completed
            ? 'line-through opacity-40 text-slate-500'
            : 'text-slate-800';

    const statusText =
        note.completed
            ? '✓ Completed'
            : 'Mark Done';

    const statusColor =
        note.completed
            ? 'text-emerald-600'
            : 'text-slate-400 hover:text-slate-600';


    const reminderHTML =
        note.reminder
            ? `
                <div class="absolute top-2 right-2 text-xs bg-white/90 px-2 py-1 rounded-full shadow">
                    ⏰ ${new Date(note.reminder).toLocaleDateString()}
                </div>
            `
            : '';


    const imageHTML =
        note.image
            ? `
                <img
                    src="${note.image}"
                    alt="Note image"
                    class="w-full max-h-32 object-cover rounded-xl mb-2 border border-white/40"
                >
            `
            : '';


    const noteHtml = `

        <div
            class="note relative ${note.bg} p-6 rounded-2xl shadow-md border-t-4 ${note.border} cursor-grab flex flex-col justify-between h-56 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            draggable="true"
            data-id="${note.id}"

            ondragstart="dragStart(event)"
            ondragend="dragEnd(event)"
            ondragenter="dragEnter(event)"
            ondragleave="dragLeave(event)"
            ondragover="allowDrop(event)"
            ondrop="drop(event)"
        >

            ${reminderHTML}

            <div>

                <div class="flex justify-between items-center text-xs opacity-60 font-medium mb-3 text-slate-700">

                    <span>
                        📅 ${note.date}
                    </span>

                    <span class="text-base">
                        ${note.sticker}
                    </span>

                </div>

                ${imageHTML}

                <p
                    onclick="toggleComplete(${note.id})"
                    class="${textStyle} break-words font-medium leading-relaxed cursor-pointer select-none line-clamp"
                >
                    ${escapeHTML(note.text)}
                </p>

            </div>


            <div class="flex justify-between items-center text-xs font-semibold">

                <button
                    onclick="toggleComplete(${note.id})"
                    class="${statusColor}"
                >
                    ${statusText}
                </button>


                <div class="flex gap-3 text-slate-600">

                    <button
                        onclick="startEdit(${note.id})"
                        class="hover:text-indigo-600"
                    >
                        Edit
                    </button>

                    <button
                        onclick="togglePin(${note.id})"
                        class="hover:text-amber-600"
                    >
                        ${note.pinned ? '📌' : '📍'}
                    </button>

                    <button
                        onclick="deleteNote(${note.id})"
                        class="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    `;


    if (note.pinned) {

        pinnedContainer.insertAdjacentHTML(
            'beforeend',
            noteHtml
        );

    } else {

        notesContainer.insertAdjacentHTML(
            'beforeend',
            noteHtml
        );
    }

});


}

/* ===============================
ESCAPE HTML
=============================== */

function escapeHTML(value) {


const div =
    document.createElement('div');

div.textContent =
    value ?? '';

return div.innerHTML;


}

/* ===============================
FILTERED NOTES
=============================== */

function renderFilteredNotes(
filteredNotes
) {

const container =
    document.getElementById(
        'notes-container'
    );

const pinnedContainer =
    document.getElementById(
        'pinned-container'
    );

pinnedContainer.innerHTML = '';

container.innerHTML = '';

filteredNotes.forEach(note => {

    const textStyle =
        note.completed
            ? 'line-through opacity-40 text-slate-500'
            : 'text-slate-800';

    const noteHtml = `

        <div
            class="${note.bg} p-6 rounded-sm shadow-md border-t-4 ${note.border}"
        >

            ${
                note.image
                    ? `
                        <img
                            src="${note.image}"
                            alt="Note image"
                            class="w-full h-24 object-cover rounded-md mb-2"
                        >
                    `
                    : ''
            }

            <p class="${textStyle}">
                ${escapeHTML(note.text)}
            </p>

        </div>
    `;

    container.insertAdjacentHTML(
        'beforeend',
        noteHtml
    );
});


}

/* ===============================
TOGGLE COMPLETE
=============================== */

function toggleComplete(id) {


notes =
    notes.map(note =>
        note.id === id
            ? {
                ...note,
                completed:
                    !note.completed
            }
            : note
    );

saveToLocalStorage();

renderNotes();


}

/* ===============================
EDIT NOTE
=============================== */

function startEdit(id) {


const note =
    notes.find(
        note => note.id === id
    );

if (!note) {
    return;
}

editNoteId = id;

document.getElementById(
    'note-text'
).value = note.text;

document.getElementById(
    'note-reminder'
).value =
    note.reminder || '';


const colorBtn =
    document.querySelector(
        `.color-btn[data-color="${note.bg}"]`
    );

const stickerBtn =
    document.querySelector(
        `.sticker-btn[data-sticker="${note.sticker}"]`
    );

selectColor(
    note.bg,
    note.border,
    colorBtn
);

selectSticky(
    note.sticker,
    stickerBtn
);


document.getElementById(
    'note-image'
).value = '';

const preview =
    document.getElementById(
        'image-preview'
    );

if (note.image) {

    preview.src =
        note.image;

    preview.classList.remove(
        'hidden'
    );

} else {

    preview.classList.add(
        'hidden'
    );
}

openModal(true);


}

/* ===============================
DELETE NOTE
=============================== */

function deleteNote(id) {


if (
    !confirm(
        'Delete this note?'
    )
) {
    return;
}

notes =
    notes.filter(
        note => note.id !== id
    );

saveToLocalStorage();

renderNotes();


}

/* ===============================
DARK MODE
=============================== */

function toggleTheme() {


document.body.classList.toggle(
    'dark'
);

const darkEnabled =
    document.body.classList.contains(
        'dark'
    );

localStorage.setItem(
    'darkMode',
    darkEnabled
);

document.getElementById(
    'theme-btn'
).textContent =
    darkEnabled
        ? '☀️'
        : '🌙';


}

/* ===============================
INITIAL THEME
=============================== */

const darkMode =
localStorage.getItem(
'darkMode'
);

if (darkMode === 'true') {


document.body.classList.add(
    'dark'
);

const btn =
    document.getElementById(
        'theme-btn'
    );

if (btn) {
    btn.textContent = '☀️';
}


}

async function enterApp() {

    if ("Notification" in window) {

        if (Notification.permission === "default") {
            await Notification.requestPermission();
        }
    }

    const welcome = document.getElementById("welcome-screen");
    const board = document.getElementById("main-board");

    welcome.classList.add(
        "opacity-0",
        "pointer-events-none",
        "scale-105"
    );

    setTimeout(() => {

        welcome.style.display = "none";

        board.classList.remove("hidden");

        setTimeout(() => {
            board.classList.remove("opacity-0");
        }, 50);

        renderNotes();

    }, 600);
}
/* ===============================
INIT
=============================== */

renderNotes();
checkReminders();
setInterval(checkReminders, 30000);
