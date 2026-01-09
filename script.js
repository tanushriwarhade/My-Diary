const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteInput = document.getElementById('note-input');
const categorySelect = document.getElementById('category-select');
const addNoteBtn = document.getElementById('add-note');
const searchInput = document.getElementById('search-input');
const drawBtn = document.getElementById('draw-btn');
const imageInput = document.getElementById('image-input');
const modal = document.getElementById('draw-modal');
const closeModal = document.getElementById('close-modal');
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
const clearCanvas = document.getElementById('clear-canvas');
const saveDrawing = document.getElementById('save-drawing');
const drawColor = document.getElementById('draw-color');

let notes = JSON.parse(localStorage.getItem('girlyNotes')) || [];
let currentDrawing = null;
let isDrawing = false;

// Drawing setup
ctx.lineWidth = 5;
ctx.lineCap = 'round';

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = drawColor.value;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    if (isDrawing) {
        ctx.beginPath();
        isDrawing = false;
    }
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e.touches[0]); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); });
canvas.addEventListener('touchend', stopDrawing);

clearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentDrawing = null;
});

saveDrawing.addEventListener('click', () => {
    currentDrawing = canvas.toDataURL();
    modal.style.display = 'none';
});

drawBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentDrawing = null;
});

closeModal.addEventListener('click', () => modal.style.display = 'none');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const imgData = ev.target.result;
                noteInput.value += `\n[Image: ${imgData}]`;
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function renderNotes(filtered = notes) {
    notesList.innerHTML = filtered.length === 0 ? 
        `<div class="empty-state">🌸 No notes yet! Add something pretty 💕</div>` : '';

    filtered.forEach((note, index) => {
        const actualIndex = notes.indexOf(note);
        const div = document.createElement('div');
        div.className = 'note';
        div.innerHTML = `
            ${note.category ? `<span class="note-category" style="background:#${note.categoryColor}">${note.category}</span>` : ''}
            <div class="note-title">${note.title || 'Untitled'}</div>
            <div class="note-content">${parseContent(note.content)}</div>
            <div class="note-actions">
                <button class="edit-btn" data-index="${actualIndex}">Edit</button>
                <button class="delete-btn" data-index="${actualIndex}">Delete</button>
            </div>
        `;
        notesList.appendChild(div);
    });
}

function parseContent(content) {
    let html = content.replace(/\n/g, '<br>');
    // Insert images
    html = html.replace(/\[Image: (data:image\/[^;]+;base64,[^\]]+)\]/g, '<img src="$1">');
    // Insert drawing
    if (currentDrawing && content.includes('[Drawing]')) {
        html = html.replace('[Drawing]', `<canvas src="${currentDrawing}" style="max-width:100%;border-radius:12px;"></canvas>`);
    }
    return html;
}

function addNote() {
    const title = noteTitle.value.trim();
    const content = noteInput.value.trim() + (currentDrawing ? '\n[Drawing]' : '');
    const category = categorySelect.value;

    if (content || title) {
        const categoryColors = {
            'My Day': 'ff9ff3', 'Personal': 'fd79a8', 'Work': 'a29bfe',
            'To Do': '00b894', 'Birthdays': 'feca57', 'Ideas': '48dbfb',
            'Shopping': 'ff7675', 'Groceries': '1dd1a1'
        };

        notes.unshift({
            title, content, category,
            categoryColor: categoryColors[category] || 'ffd1dc',
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('girlyNotes', JSON.stringify(notes));
        resetInputs();
        renderNotes();
    }
}

function resetInputs() {
    noteTitle.value = '';
    noteInput.value = '';
    categorySelect.value = '';
    currentDrawing = null;
}

function deleteNote(index) {
    if (confirm('Delete this pretty note? 💔')) {
        notes.splice(index, 1);
        localStorage.setItem('girlyNotes', JSON.stringify(notes));
        renderNotes();
    }
}

addNoteBtn.addEventListener('click', addNote);
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = notes.filter(n =>
        (n.title?.toLowerCase().includes(query) || n.content.toLowerCase().includes(query) || n.category?.toLowerCase().includes(query))
    );
    renderNotes(filtered);
});

notesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        deleteNote(parseInt(e.target.dataset.index));
    }
    // Edit functionality can be added later if needed
});

renderNotes();