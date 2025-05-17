var list = JSON.parse(localStorage.getItem('todos')) || [];

var input = document.querySelector('.todo-input');
var todoContainer = document.querySelector('.todo-list');
var remainingItems = document.querySelector('.items-left');
var filterBtns = document.querySelectorAll('.filter');
var clearBtn = document.querySelector('.clear-completed');
var darkModeBtn = document.querySelector('.theme-toggle');
var darkModeImg = document.querySelector('.theme-icon');

function setTheme() {
    var isDarkMode = localStorage.getItem('darkTheme') === 'true';
    if (isDarkMode !== null) {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        darkModeImg.src = isDarkMode ? './img/icon-sun.svg' : './img/icon-moon.svg';
    }
}

darkModeBtn.addEventListener('click', function() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    darkModeImg.src = isDark ? './img/icon-moon.svg' : './img/icon-sun.svg';
    localStorage.setItem('darkTheme', !isDark);
});

function makeNewTodoItem(item) {
    var todoItem = document.createElement('li');
    todoItem.className = item.completed ? 'todo-item completed' : 'todo-item';
    todoItem.draggable = true;
    todoItem.dataset.id = item.id;
    
    // add the inner stuff
    todoItem.innerHTML = `
        <span class="checkbox ${item.completed ? 'checked' : ''}"></span>
        <span class="todo-text">${item.text}</span>
        <button class="delete-btn">
            <img src="./img/icon-cross.svg" alt="Delete">
        </button>
    `;

    // handle clicking checkbox
    var check = todoItem.querySelector('.checkbox');
    check.addEventListener('click', function() {
        markTodoDone(item.id);
    });

    // handle delete button
    var delButton = todoItem.querySelector('.delete-btn');
    delButton.addEventListener('click', function() {
        removeTodo(item.id);
    });

    return todoItem;
}

// add new todo when enter is pressed
input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && input.value.trim() !== '') {
        var newItem = {
            id: new Date().getTime(),
            text: input.value.trim(),
            completed: false
        };
        
        list.push(newItem);
        saveToStorage();
        showTodos();
        input.value = '';
    }
});

function markTodoDone(id) {
    for(var i = 0; i < list.length; i++) {
        if(list[i].id === id) {
            list[i].completed = !list[i].completed;
            break;
        }
    }
    saveToStorage();
    showTodos();
}

function removeTodo(id) {
    list = list.filter(function(todo) {
        return todo.id !== id;
    });
    saveToStorage();
    showTodos();
}

clearBtn.addEventListener('click', function() {
    list = list.filter(function(todo) {
        return !todo.completed;
    });
    saveToStorage();
    showTodos();
});

var currentView = 'all';
filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        currentView = btn.dataset.filter;
        showTodos();
    });
});

function showTodos() {
    var todosToShow = list.filter(function(todo) {
        if(currentView === 'active') {
            return !todo.completed;
        } else if(currentView === 'completed') {
            return todo.completed;
        }
        return true;
    });

    todoContainer.innerHTML = '';
    
    for(var i = 0; i < todosToShow.length; i++) {
        todoContainer.appendChild(makeNewTodoItem(todosToShow[i]));
    }

    var notDone = list.filter(function(todo) {
        return !todo.completed;
    }).length;
    remainingItems.textContent = notDone + (notDone === 1 ? ' item left' : ' items left');
}

function saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(list));
}

var itemBeingDragged = null;

todoContainer.addEventListener('dragstart', function(e) {
    itemBeingDragged = e.target;
    e.target.classList.add('dragging');
});

todoContainer.addEventListener('dragend', function(e) {
    e.target.classList.remove('dragging');
});

todoContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    var itemToInsertBefore = getItemToInsertBefore(todoContainer, e.clientY);
    var currentDragItem = document.querySelector('.dragging');
    
    if(!itemToInsertBefore) {
        todoContainer.appendChild(currentDragItem);
    } else {
        todoContainer.insertBefore(currentDragItem, itemToInsertBefore);
    }
});

function getItemToInsertBefore(container, y) {
    var draggableItems = [].slice.call(container.querySelectorAll('.todo-item:not(.dragging)'));

    if (draggableItems.length === 0) return null;

    var closest = null;
    var closestOffset = Number.NEGATIVE_INFINITY;

    draggableItems.forEach(function(item) {
        var box = item.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;

        if(offset < 0 && offset > closestOffset) {
            closest = item;
            closestOffset = offset;
        }
    });

    return closest;
}

todoContainer.addEventListener('dragend', function() {
    var newOrder = [].slice.call(todoContainer.querySelectorAll('.todo-item')).map(function(item) {
        return list.find(function(todo) {
            return todo.id === parseInt(item.dataset.id);
        });
    });
    list = newOrder;
    saveToStorage();
});

setTheme();
showTodos();