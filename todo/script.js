let todos = JSON.parse(localStorage.getItem('todos')) || [];


const todoInput = document.querySelector('.todo-input');
const todoList = document.querySelector('.todo-list');
const itemsLeft = document.querySelector('.items-left');
const filters = document.querySelectorAll('.filter');
const clearCompleted = document.querySelector('.clear-completed');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');


function initTheme() {
    const darkTheme = localStorage.getItem('darkTheme') === 'true';
    document.body.setAttribute('data-theme', darkTheme ? 'dark' : 'light');
    themeIcon.src = darkTheme ? './img/icon-sun.svg' : './img/icon-moon.svg';
}

themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeIcon.src = isDark ? './img/icon-moon.svg' : './img/icon-sun.svg';
    localStorage.setItem('darkTheme', !isDark);
});

// Create todo item
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.draggable = true;
    li.dataset.id = todo.id;

    li.innerHTML = `
        <span class="checkbox ${todo.completed ? 'checked' : ''}"></span>
        <span class="todo-text">${todo.text}</span>
        <button class="delete-btn">
            <img src="./img/icon-cross.svg" alt="Delete">
        </button>
    `;

  
    const checkbox = li.querySelector('.checkbox');
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    return li;
}

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && todoInput.value.trim()) {
        const newTodo = {
            id: Date.now(),
            text: todoInput.value.trim(),
            completed: false
        };

        todos.push(newTodo);
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
});


function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}


function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}


clearCompleted.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
});

// Filter todos
let currentFilter = 'all';
filters.forEach(filter => {
    filter.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        currentFilter = filter.dataset.filter;
        renderTodos();
    });
});

// Render todos
function renderTodos() {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    todoList.innerHTML = '';
    filteredTodos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });

    const activeTodos = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${activeTodos} item${activeTodos !== 1 ? 's' : ''} left`;
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Drag and drop functionality
let draggedItem = null;

todoList.addEventListener('dragstart', (e) => {
    draggedItem = e.target;
    e.target.classList.add('dragging');
});

todoList.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
});

todoList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const draggable = document.querySelector('.dragging');
    
    if (afterElement == null) {
        todoList.appendChild(draggable);
    } else {
        todoList.insertBefore(draggable, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

todoList.addEventListener('dragend', () => {
    const newOrder = [...todoList.querySelectorAll('.todo-item')].map(item => 
        todos.find(todo => todo.id === parseInt(item.dataset.id))
    );
    todos = newOrder;
    saveTodos();
});


initTheme();
renderTodos();