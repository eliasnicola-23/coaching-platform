// Enhanced TaskMaster JavaScript Application

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Only initialize dashboard features if user is logged in
    if (document.querySelector('.dashboard')) {
        initializeDashboard();
    }
}

function initializeDashboard() {
    // Initialize all dashboard features
    initializeModals();
    initializeDragAndDrop();
    initializeTaskManagement();
    initializeProjectManagement();
    initializeComments();
    initializeAvatarUpload();
    initializeSettings();
    initializeNotifications();
    initializeThemeToggle();
    initializeAnalytics();
    initializeRankings();
    initializeProjectSettings();
    initializeReactions();
    initializeExport();
    initializeSecurity();
}

// Login handling
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginButton = e.target.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('login-error');
    
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
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            const openPanel = document.querySelector('.side-panel.active');
            if (openModal) {
                closeModal(openModal);
            } else if (openPanel) {
                closePanel(openPanel);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

function openPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
    }
}

function closePanel(panel) {
    panel.classList.remove('active');
}

// Avatar Upload
function initializeAvatarUpload() {
    const uploadBtn = document.getElementById('upload-avatar-btn');
    const uploadModal = document.getElementById('upload-avatar-modal');
    const uploadForm = document.getElementById('upload-avatar-form');
    const fileInput = document.getElementById('avatar-file');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const avatarPreview = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('preview-image');
    const removeBtn = document.getElementById('remove-avatar-btn');

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => openModal('upload-avatar-modal'));
    }

    if (uploadPlaceholder) {
        uploadPlaceholder.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    uploadPlaceholder.style.display = 'none';
                    avatarPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            
            submitBtn.textContent = 'Subiendo...';
            submitBtn.disabled = true;
            
            fetch('/upload_avatar', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update avatar display
                    const avatarDisplay = document.getElementById('user-avatar-display');
                    if (avatarDisplay) {
                        avatarDisplay.innerHTML = `<img src="/avatars/${data.filename}" alt="Avatar" class="user-avatar-img">`;
                    }
                    closeModal(uploadModal);
                    showNotification('Avatar actualizado exitosamente', 'success');
                } else {
                    showNotification(data.message || 'Error al subir avatar', 'error');
                }
                submitBtn.textContent = 'Guardar Avatar';
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'error');
                submitBtn.textContent = 'Guardar Avatar';
                submitBtn.disabled = false;
            });
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            // Reset to initials
            uploadPlaceholder.style.display = 'block';
            avatarPreview.style.display = 'none';
            fileInput.value = '';
        });
    }
}

// Settings Management
function initializeSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const saveBtn = document.getElementById('save-settings-btn');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => openModal('settings-modal'));
    }

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-settings`).classList.add('active');
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveAllSettings();
        });
    }
}

function saveAllSettings() {
    const formData = new FormData();
    
    // Collect all form data from active settings
    const forms = document.querySelectorAll('#settings-modal form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData.append(input.name, input.checked ? 'on' : 'off');
            } else if (input.type === 'radio' && input.checked) {
                formData.append(input.name, input.value);
            } else if (input.type !== 'radio') {
                formData.append(input.name, input.value);
            }
        });
    });

    fetch('/update_settings', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Configuraciones guardadas', 'success');
            closeModal(document.getElementById('settings-modal'));
            // Reload to apply theme changes
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification(data.message || 'Error al guardar', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

// Theme Toggle
function initializeThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            this.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            
            // Save theme preference
            const formData = new FormData();
            formData.append('theme', newTheme);
            
            fetch('/update_settings', {
                method: 'POST',
                body: formData
            });
        });
    }
}

// Notifications System
function initializeNotifications() {
    const notificationBtn = document.getElementById('notifications-btn');
    const notificationPanel = document.getElementById('notifications-panel');
    const closePanel = document.querySelector('#notifications-panel .close-panel');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            openPanel('notifications-panel');
            loadNotifications();
        });
    }

    if (closePanel) {
        closePanel.addEventListener('click', () => {
            closePanel(notificationPanel);
        });
    }

    // Mark notifications as read
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('mark-read-btn')) {
            const notificationId = e.target.dataset.id;
            markNotificationRead(notificationId);
        }
    });
}

function loadNotifications() {
    fetch('/get_notifications')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayNotifications(data.notifications);
        }
    })
    .catch(error => console.error('Error loading notifications:', error));
}

function markNotificationRead(notificationId) {
    const formData = new FormData();
    formData.append('notification_id', notificationId);
    
    fetch('/mark_notification_read', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.classList.remove('unread');
                const markReadBtn = notificationElement.querySelector('.mark-read-btn');
                if (markReadBtn) {
                    markReadBtn.remove();
                }
            }
            updateNotificationBadge();
        }
    });
}

function displayNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="no-notifications"><p>No hay notificaciones</p></div>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${!notification.read ? 'unread' : ''}" data-id="${notification.id}">
            <div class="notification-icon ${notification.type}">
                ${getNotificationIcon(notification.type)}
            </div>
            <div class="notification-content">
                <p>${escapeHtml(notification.message)}</p>
                <span class="notification-time">${notification.timestamp}</span>
            </div>
            ${!notification.read ? `<button class="mark-read-btn" data-id="${notification.id}">✓</button>` : ''}
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️'
    };
    return icons[type] || icons.info;
}

function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.querySelector('.notification-badge');
    
    if (unreadCount > 0) {
        if (badge) {
            badge.textContent = unreadCount;
        } else {
            const notificationBtn = document.getElementById('notifications-btn');
            const newBadge = document.createElement('span');
            newBadge.className = 'notification-badge';
            newBadge.textContent = unreadCount;
            notificationBtn.appendChild(newBadge);
        }
    } else if (badge) {
        badge.remove();
    }
}

function showNotification(message, type = 'info') {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${getNotificationIcon(type)}</div>
        <div class="notification-message">${escapeHtml(message)}</div>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Project management
function initializeProjectManagement() {
    const addProjectBtns = document.querySelectorAll('#add-project-btn, .create-first-project-btn');
    const addProjectForm = document.getElementById('add-project-form');

    addProjectBtns.forEach(btn => {
        btn.addEventListener('click', () => openModal('add-project-modal'));
    });

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
            showNotification(data.message || 'Error al crear el proyecto', 'error');
            submitBtn.textContent = 'Crear Proyecto';
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
        submitBtn.textContent = 'Crear Proyecto';
        submitBtn.disabled = false;
    });
}

// Project Settings
function initializeProjectSettings() {
    const projectSettingsBtn = document.getElementById('project-settings-btn');
    const projectSettingsForm = document.getElementById('project-settings-form');

    if (projectSettingsBtn) {
        projectSettingsBtn.addEventListener('click', () => openModal('project-settings-modal'));
    }

    if (projectSettingsForm) {
        projectSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch('/update_project_settings', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Configuraciones del proyecto actualizadas', 'success');
                    closeModal(document.getElementById('project-settings-modal'));
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showNotification(data.message || 'Error al actualizar', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'error');
            });
        });
    }
}

// Task management
function initializeTaskManagement() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskForm = document.getElementById('add-task-form');

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openModal('add-task-modal'));
    }

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
            showNotification('Tarea agregada exitosamente', 'success');
        } else {
            showNotification(data.message || 'Error al crear la tarea', 'error');
        }
        submitBtn.textContent = 'Agregar Tarea';
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
        submitBtn.textContent = 'Agregar Tarea';
        submitBtn.disabled = false;
    });
}

function addTaskToBoard(task) {
    const todoContainer = document.getElementById('todo-tasks');
    const taskElement = createTaskElement(task);
    todoContainer.appendChild(taskElement);
    
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
            <button class="comment-btn" data-task-id="${task.id}" title="Comentarios">💬</button>
            <div class="reaction-buttons">
                <button class="reaction-btn" data-task-id="${task.id}" data-emoji="👍" title="Me gusta">👍</button>
                <button class="reaction-btn" data-task-id="${task.id}" data-emoji="🟢" title="Aprobado">🟢</button>
                <button class="reaction-btn" data-task-id="${task.id}" data-emoji="🔴" title="Problema">🔴</button>
            </div>
        </div>
    `;
    
    addDragEventListeners(taskDiv);
    
    // Add comment button listener
    const commentBtn = taskDiv.querySelector('.comment-btn');
    commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskComments(task.id);
    });
    
    // Add reaction button listeners
    const reactionBtns = taskDiv.querySelectorAll('.reaction-btn');
    reactionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addTaskReaction(btn.dataset.taskId, btn.dataset.emoji);
        });
    });
    
    return taskDiv;
}

// Reactions
function initializeReactions() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reaction-btn')) {
            const taskId = e.target.dataset.taskId;
            const emoji = e.target.dataset.emoji;
            addTaskReaction(taskId, emoji);
        }
    });
}

function addTaskReaction(taskId, emoji) {
    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('emoji', emoji);
    
    fetch('/add_task_reaction', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Reacción ${emoji} agregada`, 'success');
        } else {
            showNotification('Error al agregar reacción', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

// Drag and drop functionality
function initializeDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const containers = document.querySelectorAll('.tasks-container');
    
    taskCards.forEach(addDragEventListeners);
    
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
    
    this.appendChild(taskElement);
    
    if (toColumn === 'done') {
        taskElement.classList.add('completed');
    } else {
        taskElement.classList.remove('completed');
    }
    
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
        if (data.success) {
            showNotification('Tarea movida exitosamente', 'success');
        } else {
            showNotification(data.message || 'Error al mover la tarea', 'error');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
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
    const commentBtns = document.querySelectorAll('.comment-btn');
    const addCommentForm = document.getElementById('add-comment-form');

    commentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openTaskComments(btn.dataset.taskId);
        });
    });

    if (addCommentForm) {
        addCommentForm.addEventListener('submit', handleAddComment);
    }
}

function openTaskComments(taskId) {
    fetch(`/get_task_details/${taskId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayTaskComments(data);
            openModal('comments-modal');
        } else {
            showNotification(data.message || 'Error al cargar los comentarios', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

function displayTaskComments(data) {
    const task = data.task;
    const comments = data.comments;
    
    document.getElementById('task-title').textContent = task.text;
    document.getElementById('task-info').innerHTML = `
        <strong>Creado por:</strong> ${escapeHtml(task.created_by)} | 
        <strong>Estado:</strong> ${getColumnDisplayName(data.column)} | 
        <strong>Fecha:</strong> ${escapeHtml(task.created_at)}
    `;
    
    document.getElementById('comment-task-id').value = task.id;
    
    const commentsContainer = document.getElementById('comments-container');
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
    } else {
        commentsContainer.innerHTML = comments.map(comment => createCommentElement(comment)).join('');
    }
}

function createCommentElement(comment) {
    const isReaction = comment.is_reaction || false;
    
    if (isReaction) {
        return `
            <div class="comment reaction-comment">
                <div class="comment-header">
                    <div class="comment-avatar" style="background-color: ${comment.author_color}">
                        ${escapeHtml(comment.author_initials)}
                    </div>
                    <div class="comment-meta">
                        <div class="comment-author">${escapeHtml(comment.author)}</div>
                        <div class="comment-timestamp">${escapeHtml(comment.timestamp)}</div>
                    </div>
                    <div class="reaction-large">${comment.emoji}</div>
                </div>
            </div>
        `;
    }
    
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
            const commentsContainer = document.getElementById('comments-container');
            const noCommentsMsg = commentsContainer.querySelector('p[style*="text-align: center"]');
            if (noCommentsMsg) {
                commentsContainer.innerHTML = '';
            }
            
            const commentElement = createCommentElement(data.comment);
            commentsContainer.insertAdjacentHTML('beforeend', commentElement);
            
            document.getElementById('comment-text').value = '';
            showNotification('Comentario agregado', 'success');
        } else {
            showNotification(data.message || 'Error al agregar el comentario', 'error');
        }
        
        submitBtn.textContent = 'Comentar';
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
        submitBtn.textContent = 'Comentar';
        submitBtn.disabled = false;
    });
}

// Analytics
function initializeAnalytics() {
    const analyticsBtn = document.getElementById('project-analytics-btn');
    const tabBtns = document.querySelectorAll('.analytics-tabs .tab-btn');
    const periodBtns = document.querySelectorAll('.period-btn');

    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', () => {
            openModal('analytics-modal');
            initializeAnalyticsCharts();
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.analytics-content .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-analytics`).classList.add('active');
            
            if (tabId === 'trends') {
                initializeTrendsChart('weekly');
            }
        });
    });

    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.dataset.period;
            
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            initializeTrendsChart(period);
        });
    });
}

function initializeAnalyticsCharts() {
    // Initialize task distribution chart
    const distributionCtx = document.getElementById('taskDistributionChart');
    if (distributionCtx) {
        const todoCount = document.getElementById('todo-tasks').children.length;
        const inprogressCount = document.getElementById('inprogress-tasks').children.length;
        const doneCount = document.getElementById('done-tasks').children.length;
        
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Por hacer', 'En curso', 'Finalizado'],
                datasets: [{
                    data: [todoCount, inprogressCount, doneCount],
                    backgroundColor: ['#ff6b6b', '#feca57', '#48cae4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function initializeTrendsChart(period) {
    fetch(`/get_user_stats/${period}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const trendsCtx = document.getElementById('trendsChart');
            if (trendsCtx) {
                new Chart(trendsCtx, {
                    type: 'line',
                    data: {
                        labels: data.stats.labels,
                        datasets: [{
                            label: 'Completadas',
                            data: data.stats.completed,
                            borderColor: '#48cae4',
                            backgroundColor: 'rgba(72, 202, 228, 0.1)',
                            tension: 0.4
                        }, {
                            label: 'Creadas',
                            data: data.stats.created,
                            borderColor: '#ff6b6b',
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    })
    .catch(error => console.error('Error loading trends:', error));
}

// Rankings
function initializeRankings() {
    const rankingsBtn = document.getElementById('view-rankings-btn');
    
    if (rankingsBtn) {
        rankingsBtn.addEventListener('click', () => {
            openModal('rankings-modal');
            loadRankings();
        });
    }
}

function loadRankings() {
    fetch('/get_rankings')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayRankings(data.rankings);
        }
    })
    .catch(error => console.error('Error loading rankings:', error));
}

function displayRankings(rankings) {
    const container = document.getElementById('rankings-list');
    
    container.innerHTML = rankings.map(ranking => `
        <div class="ranking-item ${ranking.username === getCurrentUsername() ? 'current-user' : ''}">
            <div class="ranking-position">${ranking.rank}</div>
            <div class="ranking-username">${escapeHtml(ranking.username)}</div>
            <div class="ranking-score">${ranking.monthly_score}</div>
            <div class="ranking-weekly">${ranking.weekly_completed}</div>
        </div>
    `).join('');
}

function getCurrentUsername() {
    // Get current username from the page
    const userInfo = document.querySelector('.user-info h3');
    return userInfo ? userInfo.textContent : '';
}

// Export functionality
function initializeExport() {
    const exportBtn = document.getElementById('export-project-btn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            this.textContent = 'Exportando...';
            this.disabled = true;
            
            fetch('/export_project')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Proyecto exportado exitosamente', 'success');
                    // Here you could trigger a download or show export data
                    console.log('Export data:', data.data);
                } else {
                    showNotification(data.message || 'Error al exportar', 'error');
                }
                this.textContent = '📊';
                this.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'error');
                this.textContent = '📊';
                this.disabled = false;
            });
        });
    }
}

// Security
function initializeSecurity() {
    const changePasswordForm = document.getElementById('change-password-form');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            
            submitBtn.textContent = 'Cambiando...';
            submitBtn.disabled = true;
            
            fetch('/change_password', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Contraseña cambiada exitosamente', 'success');
                    this.reset();
                } else {
                    showNotification(data.message || 'Error al cambiar contraseña', 'error');
                }
                submitBtn.textContent = 'Cambiar Contraseña';
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'error');
                submitBtn.textContent = 'Cambiar Contraseña';
                submitBtn.disabled = false;
            });
        });
    }
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

// Global error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// CSS for notification toasts
const toastStyles = `
<style>
.notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-primary);
    color: var(--text-primary);
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px var(--shadow);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
    border-left: 4px solid var(--primary-color);
}

.notification-toast.success {
    border-left-color: #27ae60;
}

.notification-toast.error {
    border-left-color: #e74c3c;
}

.notification-toast.warning {
    border-left-color: #f39c12;
}

.notification-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
    margin-left: auto;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.reaction-comment {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border-left-color: var(--primary-color);
}

.reaction-large {
    font-size: 24px;
    margin-left: auto;
}
</style>
`;

// Add toast styles to document
document.head.insertAdjacentHTML('beforeend', toastStyles);