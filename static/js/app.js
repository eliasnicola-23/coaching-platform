// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    initializeApp();
});

function initializeApp() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Modal handling
    initializeModals();

    // Drag and drop functionality
    if (document.querySelector('.kanban-board')) {
        initializeDragAndDrop();
    }

    // Task management
    initializeTaskManagement();

    // Project management
    initializeProjectManagement();

    // Comments functionality
    initializeComments();
}

// Login handling
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginButton = e.target.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('login-error');
    
    // Show loading state
    loginButton.textContent = 'Iniciando sesión...';
    loginButton.disabled = true;
    errorDiv.textContent = '';
    
    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            errorDiv.textContent = data.message || 'Error de inicio de sesión';
            loginButton.textContent = 'Iniciar Sesión';
            loginButton.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión. Inténtalo de nuevo.';
        loginButton.textContent = 'Iniciar Sesión';
        loginButton.disabled = false;
    });
}

// Modal management
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Close button handlers
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Click outside to close
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Focus on first input if exists
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

// Project management
function initializeProjectManagement() {
    // Add project button handlers
    const addProjectBtns = document.querySelectorAll('#add-project-btn, .create-first-project-btn');
    addProjectBtns.forEach(btn => {
        btn.addEventListener('click', () => openModal('add-project-modal'));
    });

    // Add project form
    const addProjectForm = document.getElementById('add-project-form');
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', handleAddProject);
    }
}

function handleAddProject(e) {
    e.preventDefault();
    
    const projectName = document.getElementById('project-name').value.trim();
    if (!projectName) return;
    
    const formData = new FormData();
    formData.append('name', projectName);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Creando...';
    submitBtn.disabled = true;
    
    fetch('/create_project', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert(data.message || 'Error al crear el proyecto');
            submitBtn.textContent = 'Crear Proyecto';
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión. Inténtalo de nuevo.');
        submitBtn.textContent = 'Crear Proyecto';
        submitBtn.disabled = false;
    });
}

// Task management
function initializeTaskManagement() {
    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openModal('add-task-modal'));
    }

    // Add task form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
    }
}

function handleAddTask(e) {
    e.preventDefault();
    
    const taskText = document.getElementById('task-text').value.trim();
    if (!taskText) return;
    
    const formData = new FormData();
    formData.append('task', taskText);
    formData.append('created_at', new Date().toLocaleString('es-ES'));
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Agregando...';
    submitBtn.disabled = true;
    
    fetch('/add_task', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addTaskToBoard(data.task);
            closeModal(document.getElementById('add-task-modal'));
            updateTaskCounts();
        } else {
            alert(data.message || 'Error al crear la tarea');
        }
        submitBtn.textContent = 'Agregar Tarea';
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión. Inténtalo de nuevo.');
        submitBtn.textContent = 'Agregar Tarea';
        submitBtn.disabled = false;
    });
}

function addTaskToBoard(task) {
    const todoContainer = document.getElementById('todo-tasks');
    const taskElement = createTaskElement(task);
    todoContainer.appendChild(taskElement);
    
    // Add success animation
    taskElement.classList.add('success-flash');
    setTimeout(() => taskElement.classList.remove('success-flash'), 600);
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card';
    taskDiv.draggable = true;
    taskDiv.dataset.taskId = task.id;
    
    taskDiv.innerHTML = `
        <div class="task-content">
            <p>${escapeHtml(task.text)}</p>
            <div class="task-meta">
                <span class="task-author">${escapeHtml(task.created_by)}</span>
                <span class="task-date">${escapeHtml(task.created_at)}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="comment-btn" data-task-id="${task.id}">💬</button>
        </div>
    `;
    
    // Add event listeners
    addDragEventListeners(taskDiv);
    
    // Add comment button listener
    const commentBtn = taskDiv.querySelector('.comment-btn');
    commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskComments(task.id);
    });
    
    return taskDiv;
}

// Drag and drop functionality
function initializeDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const containers = document.querySelectorAll('.tasks-container');
    
    // Add drag events to existing tasks
    taskCards.forEach(addDragEventListeners);
    
    // Add drop zones
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function addDragEventListeners(taskCard) {
    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.taskId);
    e.dataTransfer.setData('text/html', this.outerHTML);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    
    if (!taskElement) return;
    
    const fromColumn = taskElement.closest('.kanban-column').dataset.column;
    const toColumn = this.closest('.kanban-column').dataset.column;
    
    if (fromColumn === toColumn) return;
    
    // Move task visually first for immediate feedback
    this.appendChild(taskElement);
    
    // Update task styling if moved to done
    if (toColumn === 'done') {
        taskElement.classList.add('completed');
    } else {
        taskElement.classList.remove('completed');
    }
    
    // Send request to backend
    moveTaskOnServer(taskId, fromColumn, toColumn);
    updateTaskCounts();
}

function moveTaskOnServer(taskId, fromColumn, toColumn) {
    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('from_column', fromColumn);
    formData.append('to_column', toColumn);
    
    fetch('/move_task', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            // Revert the move if it failed
            alert(data.message || 'Error al mover la tarea');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión. La página se recargará.');
        window.location.reload();
    });
}

function updateTaskCounts() {
    const columns = ['todo', 'inprogress', 'done'];
    
    columns.forEach(column => {
        const container = document.getElementById(`${column}-tasks`);
        const taskCount = container.querySelectorAll('.task-card').length;
        const countElement = document.querySelector(`.${column}-header .task-count`);
        if (countElement) {
            countElement.textContent = taskCount;
        }
    });
}

// Comments functionality
function initializeComments() {
    // Add comment button handlers for existing tasks
    const commentBtns = document.querySelectorAll('.comment-btn');
    commentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openTaskComments(btn.dataset.taskId);
        });
    });

    // Add comment form
    const addCommentForm = document.getElementById('add-comment-form');
    if (addCommentForm) {
        addCommentForm.addEventListener('submit', handleAddComment);
    }
}

function openTaskComments(taskId) {
    // Get task details
    fetch(`/get_task_details/${taskId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayTaskComments(data);
            openModal('comments-modal');
        } else {
            alert(data.message || 'Error al cargar los comentarios');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión.');
    });
}

function displayTaskComments(data) {
    const task = data.task;
    const comments = data.comments;
    
    // Update task details
    document.getElementById('task-title').textContent = task.text;
    document.getElementById('task-info').innerHTML = `
        <strong>Creado por:</strong> ${escapeHtml(task.created_by)} | 
        <strong>Estado:</strong> ${getColumnDisplayName(data.column)} | 
        <strong>Fecha:</strong> ${escapeHtml(task.created_at)}
    `;
    
    // Update hidden field
    document.getElementById('comment-task-id').value = task.id;
    
    // Display comments
    const commentsContainer = document.getElementById('comments-container');
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
    } else {
        commentsContainer.innerHTML = comments.map(comment => createCommentElement(comment)).join('');
    }
}

function createCommentElement(comment) {
    return `
        <div class="comment">
            <div class="comment-header">
                <div class="comment-avatar" style="background-color: ${comment.author_color}">
                    ${escapeHtml(comment.author_initials)}
                </div>
                <div class="comment-meta">
                    <div class="comment-author">${escapeHtml(comment.author)}</div>
                    <div class="comment-timestamp">${escapeHtml(comment.timestamp)}</div>
                </div>
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
    `;
}

function handleAddComment(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('comment-task-id').value;
    const commentText = document.getElementById('comment-text').value.trim();
    
    if (!commentText) return;
    
    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('comment', commentText);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    fetch('/add_comment', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add comment to the display
            const commentsContainer = document.getElementById('comments-container');
            const noCommentsMsg = commentsContainer.querySelector('p[style*="text-align: center"]');
            if (noCommentsMsg) {
                commentsContainer.innerHTML = '';
            }
            
            const commentElement = createCommentElement(data.comment);
            commentsContainer.insertAdjacentHTML('beforeend', commentElement);
            
            // Clear form
            document.getElementById('comment-text').value = '';
        } else {
            alert(data.message || 'Error al agregar el comentario');
        }
        
        submitBtn.textContent = 'Comentar';
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión. Inténtalo de nuevo.');
        submitBtn.textContent = 'Comentar';
        submitBtn.disabled = false;
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getColumnDisplayName(column) {
    const names = {
        'todo': 'Por hacer',
        'inprogress': 'En curso',
        'done': 'Finalizado'
    };
    return names[column] || column;
}

// Add some global error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Add performance optimization for animations
function requestIdleCallback(callback) {
    if (window.requestIdleCallback) {
        return window.requestIdleCallback(callback);
    } else {
        return setTimeout(callback, 1);
    }
}