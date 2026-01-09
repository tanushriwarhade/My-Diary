// Data Storage
let currentMood = '';
let currentColor = '#ff6b9d';
let isDrawing = false;
let canvas, ctx;

// Initialize
window.onload = function() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Setup drawing events
    setupDrawingEvents();
    
    // Load saved data
    loadDiaryEntries();
    loadTodos();
    loadGallery();
    loadRecipes();
};

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');
}

// Mood Selection
function selectMood(element) {
    document.querySelectorAll('.mood-tag').forEach(tag => tag.classList.remove('selected'));
    element.classList.add('selected');
    currentMood = element.dataset.mood;
}

// ==================== DIARY FUNCTIONS ====================
function saveDiary() {
    const title = document.getElementById('diaryTitle').value;
    const content = document.getElementById('diaryContent').value;
    
    if (!title || !content) {
        alert('Please fill in both title and content! 💕');
        return;
    }

    const entry = {
        id: Date.now(),
        title: title,
        content: content,
        mood: currentMood || 'happy',
        date: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    };

    let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    entries.unshift(entry);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));

    document.getElementById('diaryTitle').value = '';
    document.getElementById('diaryContent').value = '';
    currentMood = '';
    document.querySelectorAll('.mood-tag').forEach(tag => tag.classList.remove('selected'));

    loadDiaryEntries();
}

function loadDiaryEntries() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const container = document.getElementById('diaryEntries');
    
    if (entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--lavender); margin-top: 30px;">No entries yet! Start writing... ✨</p>';
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="entry-item">
            <button class="delete-btn" onclick="deleteDiary(${entry.id})">🗑️</button>
            <h3>${entry.title} ${getMoodEmoji(entry.mood)}</h3>
            <div class="date">${entry.date}</div>
            <p>${entry.content}</p>
        </div>
    `).join('');
}

function getMoodEmoji(mood) {
    const moods = {
        happy: '😊',
        excited: '🤩',
        calm: '😌',
        sad: '😢',
        thoughtful: '🤔'
    };
    return moods[mood] || '😊';
}

function deleteDiary(id) {
    if (!confirm('Delete this entry? 💔')) return;
    
    let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    entries = entries.filter(entry => entry.id !== id);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    loadDiaryEntries();
}

// ==================== TO-DO FUNCTIONS ====================
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));

    input.value = '';
    loadTodos();
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const container = document.getElementById('todoList');
    
    if (todos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--lavender); margin-top: 20px;">No tasks yet! Add one to get started ✨</p>';
        return;
    }

    container.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span>${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️</button>
        </div>
    `).join('');
}

function toggleTodo(id) {
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('todos', JSON.stringify(todos));
        loadTodos();
    }
}

function deleteTodo(id) {
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
}

// ==================== DRAWING FUNCTIONS ====================
function changeColor(color, element) {
    currentColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function setupDrawingEvents() {
    canvas = document.getElementById('drawingCanvas');
    
    if (!canvas) return;
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = document.getElementById('brushSize').value;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    if (!confirm('Clear your drawing? 🎨')) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveDrawing() {
    const dataURL = canvas.toDataURL('image/png');
    const drawings = JSON.parse(localStorage.getItem('drawings') || '[]');
    drawings.push({
        id: Date.now(),
        data: dataURL,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('drawings', JSON.stringify(drawings));
    
    // Also add to gallery
    const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
    gallery.push({
        id: Date.now(),
        data: dataURL,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('gallery', JSON.stringify(gallery));
    
    alert('Drawing saved! 🎨✨ Check your gallery!');
}

// ==================== GALLERY FUNCTIONS ====================
function handleImageUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
            gallery.push({
                id: Date.now() + Math.random(),
                data: e.target.result,
                date: new Date().toLocaleDateString()
            });
            localStorage.setItem('gallery', JSON.stringify(gallery));
            loadGallery();
        };
        
        reader.readAsDataURL(file);
    }
}

function loadGallery() {
    const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
    const container = document.getElementById('galleryGrid');
    
    if (gallery.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--lavender); grid-column: 1/-1;">No images yet! Upload some memories 📸✨</p>';
        return;
    }

    container.innerHTML = gallery.map(item => `
        <div class="gallery-item">
            <img src="${item.data}" alt="Gallery image">
            <button class="delete-btn" onclick="deleteImage(${item.id})">🗑️</button>
        </div>
    `).join('');
}

function deleteImage(id) {
    if (!confirm('Delete this image? 💔')) return;
    
    let gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
    gallery = gallery.filter(item => item.id !== id);
    localStorage.setItem('gallery', JSON.stringify(gallery));
    loadGallery();
}

// ==================== RECIPE FUNCTIONS ====================
function saveRecipe() {
    const name = document.getElementById('recipeName').value;
    const ingredients = document.getElementById('recipeIngredients').value;
    const instructions = document.getElementById('recipeInstructions').value;
    
    if (!name || !ingredients || !instructions) {
        alert('Please fill in all fields! 🍰');
        return;
    }

    const recipe = {
        id: Date.now(),
        name: name,
        ingredients: ingredients.split('\n').filter(i => i.trim()),
        instructions: instructions.split('\n').filter(i => i.trim()),
        date: new Date().toLocaleDateString()
    };

    let recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    recipes.unshift(recipe);
    localStorage.setItem('recipes', JSON.stringify(recipes));

    document.getElementById('recipeName').value = '';
    document.getElementById('recipeIngredients').value = '';
    document.getElementById('recipeInstructions').value = '';

    loadRecipes();
}

function loadRecipes() {
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const container = document.getElementById('recipesList');
    
    if (recipes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--lavender); margin-top: 30px;">No recipes yet! Add your favorites 🍰✨</p>';
        return;
    }

    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-item">
            <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">🗑️</button>
            <h3>${recipe.name}</h3>
            <div class="date">Added on ${recipe.date}</div>
            
            <h4>Ingredients:</h4>
            <ul>
                ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            
            <h4>Instructions:</h4>
            <ol>
                ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
            </ol>
        </div>
    `).join('');
}

function deleteRecipe(id) {
    if (!confirm('Delete this recipe? 💔')) return;
    
    let recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    recipes = recipes.filter(recipe => recipe.id !== id);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    loadRecipes();
}