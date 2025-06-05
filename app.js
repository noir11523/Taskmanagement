// Task Management App - Kanban Style
let tasks = JSON.parse(localStorage.getItem('tasks-kanban')) || [];
let sortBy = 'priority';
let filterPriority = 'all';

const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const priorityInput = document.getElementById('task-priority');
const sortBySelect = document.getElementById('sort-by');
const filterPrioritySelect = document.getElementById('filter-priority');
const todoList = document.getElementById('todo-list');
const inprogressList = document.getElementById('inprogress-list');
const doneList = document.getElementById('done-list');
const clearAllBtn = document.getElementById('clear-all');

function saveTasks() {
    localStorage.setItem('tasks-kanban', JSON.stringify(tasks));
}

function renderTasks() {
    // Clear columns
    todoList.innerHTML = '';
    inprogressList.innerHTML = '';
    doneList.innerHTML = '';
    // Filter and sort
    let filtered = tasks.filter(task => filterPriority === 'all' ? true : task.priority === filterPriority);
    filtered = filtered.sort((a, b) => {
        if (sortBy === 'priority') {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        } else if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'status') {
            const order = { todo: 0, inprogress: 1, done: 2 };
            return order[a.status] - order[b.status];
        }
        return 0;
    });
    // Render
    filtered.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = `task-card ${task.priority}`;
        li.innerHTML = `
            <div class="task-title" contenteditable="false">${task.title}</div>
            ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
            <div class="task-meta">
                <span>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                <span>${task.status === 'todo' ? 'To Do' : task.status === 'inprogress' ? 'In Progress' : 'Done'}</span>
            </div>
            <div class="task-actions">
                ${task.status !== 'todo' ? '<button class="action-btn move-left" title="Move Left">⬅️</button>' : ''}
                ${task.status !== 'done' ? '<button class="action-btn move-right" title="Move Right">➡️</button>' : ''}
                <button class="action-btn edit-btn" title="Edit">✏️</button>
                <button class="action-btn delete-btn" title="Delete">🗑️</button>
            </div>
        `;
        li.dataset.index = idx;
        if (task.status === 'todo') todoList.appendChild(li);
        else if (task.status === 'inprogress') inprogressList.appendChild(li);
        else if (task.status === 'done') doneList.appendChild(li);
    });
}

taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const priority = priorityInput.value;
    if (!title) return;
    tasks.push({ title, description, priority, status: 'todo' });
    saveTasks();
    renderTasks();
    taskForm.reset();
});

[todoList, inprogressList, doneList].forEach(list => {
    list.addEventListener('click', e => {
        const li = e.target.closest('.task-card');
        if (!li) return;
        const idx = li.dataset.index;
        if (e.target.classList.contains('move-left')) {
            if (tasks[idx].status === 'inprogress') tasks[idx].status = 'todo';
            else if (tasks[idx].status === 'done') tasks[idx].status = 'inprogress';
            saveTasks();
            renderTasks();
        } else if (e.target.classList.contains('move-right')) {
            if (tasks[idx].status === 'todo') tasks[idx].status = 'inprogress';
            else if (tasks[idx].status === 'inprogress') tasks[idx].status = 'done';
            saveTasks();
            renderTasks();
        } else if (e.target.classList.contains('delete-btn')) {
            tasks.splice(idx, 1);
            saveTasks();
            renderTasks();
        } else if (e.target.classList.contains('edit-btn')) {
            editTask(li, idx);
        }
    });
});

function editTask(li, idx) {
    const task = tasks[idx];
    const titleDiv = li.querySelector('.task-title');
    const descDiv = li.querySelector('.task-desc');
    titleDiv.contentEditable = true;
    if (descDiv) descDiv.contentEditable = true;
    titleDiv.focus();
    function finishEdit() {
        titleDiv.contentEditable = false;
        if (descDiv) descDiv.contentEditable = false;
        task.title = titleDiv.textContent.trim();
        if (descDiv) task.description = descDiv.textContent.trim();
        saveTasks();
        renderTasks();
        titleDiv.removeEventListener('blur', finishEdit);
        if (descDiv) descDiv.removeEventListener('blur', finishEdit);
    }
    titleDiv.addEventListener('blur', finishEdit);
    if (descDiv) descDiv.addEventListener('blur', finishEdit);
}

sortBySelect.addEventListener('change', () => {
    sortBy = sortBySelect.value;
    renderTasks();
});

filterPrioritySelect.addEventListener('change', () => {
    filterPriority = filterPrioritySelect.value;
    renderTasks();
});

clearAllBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => task.status !== 'done');
    saveTasks();
    renderTasks();
});

// Initial render
renderTasks(); 