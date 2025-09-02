// Enhanced TaskMaster JavaScript Application with All New Features

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeKeyboardShortcuts();
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
    
    // New features
    initializeViewSwitcher();
    initializeSearch();
    initializeCalendar();
    initializeDashboardView();
    initializeQuickNotes();
    initializeMiniChat();
    initializeTagSystem();
    initializeExportImage();
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ignore if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.key.toLowerCase()) {
            case 'n':
                if (!e.ctrlKey && !e.altKey) {
                    openModal('add-task-modal');
                    e.preventDefault();
                }
                break;
            case 'f':
                if (e.ctrlKey) {
                    const searchInput = document.getElementById('task-search');
                    if (searchInput) {
                        searchInput.focus();
                        e.preventDefault();
                    }
                }
                break;
            case 'k':
                if (e.ctrlKey) {
                    toggleView();
                    e.preventDefault();
                }
                break;
            case 't':
                if (!e.ctrlKey && !e.altKey) {
                    toggleTheme();
                    e.preventDefault();
                }
                break;
            case 'e':
                if (e.ctrlKey) {
                    exportProject();
                    e.preventDefault();
                }
                break;
            case '?':
                if (!e.ctrlKey && !e.altKey) {
                    openModal('shortcuts-modal');
                    e.preventDefault();
                }
                break;
        }
    });
}

// View Switcher
function initializeViewSwitcher() {
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            switchToView(view);
        });
    });
}

function switchToView(viewName) {
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    
    // Update active view
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    document.querySelector(`.${viewName}-view`).classList.add('active');
    
    // Initialize view-specific functionality
    switch(viewName) {
        case 'calendar':
            renderCalendar();
            break;
        case 'dashboard':
            initializeDashboardCharts();
            loadDashboardData();
            break;
    }
}

function toggleView() {
    const activeView = document.querySelector('.view-btn.active').dataset.view;
    const views = ['kanban', 'calendar', 'dashboard'];
    const currentIndex = views.indexOf(activeView);
    const nextIndex = (currentIndex + 1) % views.length;
    switchToView(views[nextIndex]);
}

// Search and Filter System
function initializeSearch() {
    const searchInput = document.getElementById('task-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
    }
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            applyFilter(filter);
            
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function performSearch(query) {
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        const taskText = card.querySelector('p').textContent.toLowerCase();
        const taskAuthor = card.querySelector('.task-author').textContent.toLowerCase();
        const taskAssigned = card.dataset.assigned.toLowerCase();
        const taskTags = card.dataset.tags.toLowerCase();
        
        const matchesSearch = !query || 
            taskText.includes(query.toLowerCase()) ||
            taskAuthor.includes(query.toLowerCase()) ||
            taskAssigned.includes(query.toLowerCase()) ||
            taskTags.includes(query.toLowerCase());
        
        card.style.display = matchesSearch ? 'block' : 'none';
    });
}

function applyFilter(filter) {
    const taskCards = document.querySelectorAll('.task-card');
    const currentUser = getCurrentUsername();
    
    taskCards.forEach(card => {
        let shouldShow = true;
        
        switch(filter) {
            case 'assigned':
                shouldShow = card.dataset.assigned === currentUser;
                break;
            case 'urgent':
                shouldShow = card.dataset.tags.includes('Urgente');
                break;
            case 'today':
                const dueDate = card.dataset.dueDate;
                const today = new Date().toISOString().split('T')[0];
                shouldShow = dueDate === today;
                break;
            case 'all':
            default:
                shouldShow = true;
                break;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

// Calendar View
function initializeCalendar() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

let currentCalendarDate = new Date();

function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    
    if (!calendarGrid) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update header
    currentMonthElement.textContent = new Intl.DateTimeFormat('es-ES', { 
        month: 'long', 
        year: 'numeric' 
    }).format(currentCalendarDate);
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.cssText = 'background: var(--bg-secondary); padding: 10px; text-align: center; font-weight: 600; color: var(--text-primary);';
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (currentDay.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday(currentDay)) {
            dayElement.classList.add('today');
        }
        
        dayElement.innerHTML = `
            <div class="calendar-day-number">${currentDay.getDate()}</div>
            <div class="calendar-tasks">${getTasksForDate(currentDay)}</div>
        `;
        
        calendarGrid.appendChild(dayElement);
    }
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function getTasksForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    const tasks = document.querySelectorAll(`[data-due-date="${dateStr}"]`);
    
    return Array.from(tasks).map(task => {
        const column = task.closest('.kanban-column').dataset.column;
        const text = task.querySelector('p').textContent;
        return `<div class="calendar-task ${column}">${text.substring(0, 20)}${text.length > 20 ? '...' : ''}</div>`;
    }).join('');
}

// Dashboard View
function initializeDashboardView() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });
}

function handleQuickAction(action) {
    switch(action) {
        case 'add-task':
            openModal('add-task-modal');
            break;
        case 'add-project':
            openModal('add-project-modal');
            break;
        case 'add-note':
            openModal('add-note-modal');
            break;
        case 'export':
            exportProject();
            break;
    }
}

function loadDashboardData() {
    loadTodaysTasks();
    loadRecentActivity();
}

function loadTodaysTasks() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = document.querySelectorAll(`[data-due-date="${today}"]`);
    const container = document.getElementById('today-tasks-list');
    
    if (!container) return;
    
    if (todayTasks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No hay tareas para hoy</p>';
        return;
    }
    
    container.innerHTML = Array.from(todayTasks).map(task => {
        const text = task.querySelector('p').textContent;
        const column = task.closest('.kanban-column').dataset.column;
        const assigned = task.dataset.assigned;
        
        return `
            <div class="today-task-item">
                <div class="task-status ${column}"></div>
                <div class="task-info">
                    <div class="task-text">${text}</div>
                    ${assigned ? `<div class="task-assigned-to">Asignado a: ${assigned}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function loadRecentActivity() {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;
    
    // Simulate recent activity
    const activities = [
        { type: 'task_created', text: 'Nueva tarea: "Revisar documentación"', time: '5 min' },
        { type: 'task_moved', text: 'Tarea movida a "En curso"', time: '10 min' },
        { type: 'comment_added', text: 'Nuevo comentario en tarea', time: '15 min' },
        { type: 'project_created', text: 'Proyecto "Marketing" creado', time: '1 hora' }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                ${getActivityIcon(activity.type)}
            </div>
            <div class="activity-info">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        'task_created': '➕',
        'task_moved': '🔄',
        'comment_added': '💬',
        'project_created': '📁'
    };
    return icons[type] || '📝';
}

function initializeDashboardCharts() {
    const progressCtx = document.getElementById('weeklyProgressChart');
    if (progressCtx) {
        new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Tareas completadas',
                    data: [2, 4, 3, 5, 4, 3, 1],
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'var(--border-color)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'var(--border-color)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Quick Notes System
function initializeQuickNotes() {
    const addNoteBtn = document.getElementById('add-note-btn');
    const addNoteForm = document.getElementById('add-note-form');
    const noteColors = document.querySelectorAll('.note-color-option');
    
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => openModal('add-note-modal'));
    }
    
    if (addNoteForm) {
        addNoteForm.addEventListener('submit', handleAddNote);
    }
    
    noteColors.forEach(color => {
        color.addEventListener('click', function() {
            noteColors.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    loadUserNotes();
}

function handleAddNote(e) {
    e.preventDefault();
    
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const selectedColor = document.querySelector('.note-color-option.selected').dataset.color;
    
    if (!title || !content) return;
    
    const note = {
        id: Date.now().toString(),
        title,
        content,
        color: selectedColor,
        timestamp: new Date().toLocaleString('es-ES')
    };
    
    saveUserNote(note);
    addNoteToSidebar(note);
    closeModal(document.getElementById('add-note-modal'));
    showNotification('Nota creada exitosamente', 'success');
}

function saveUserNote(note) {
    const notes = getUserNotes();
    notes.push(note);
    localStorage.setItem('user_notes', JSON.stringify(notes));
}

function getUserNotes() {
    return JSON.parse(localStorage.getItem('user_notes') || '[]');
}

function loadUserNotes() {
    const notes = getUserNotes();
    const container = document.getElementById('notes-list');
    
    if (!container) return;
    
    if (notes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 12px; text-align: center;">No hay notas</p>';
        return;
    }
    
    container.innerHTML = notes.slice(-5).map(note => 
        createNoteElement(note)
    ).join('');
}

function createNoteElement(note) {
    return `
        <div class="note-item" style="background-color: ${note.color}" data-note-id="${note.id}">
            <div class="note-title">${escapeHtml(note.title)}</div>
            <div class="note-content">${escapeHtml(note.content.substring(0, 50))}${note.content.length > 50 ? '...' : ''}</div>
        </div>
    `;
}

function addNoteToSidebar(note) {
    const container = document.getElementById('notes-list');
    const noteElement = createNoteElement(note);
    
    // Remove "no notes" message if exists
    const noNotesMsg = container.querySelector('p[style*="text-align: center"]');
    if (noNotesMsg) {
        noNotesMsg.remove();
    }
    
    container.insertAdjacentHTML('afterbegin', noteElement);
    
    // Keep only last 5 notes visible
    const notes = container.querySelectorAll('.note-item');
    if (notes.length > 5) {
        notes[notes.length - 1].remove();
    }
}

// Mini Chat System
function initializeMiniChat() {
    const toggleChatBtn = document.getElementById('toggle-chat-btn');
    const chatContainer = document.getElementById('chat-container');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (toggleChatBtn) {
        toggleChatBtn.addEventListener('click', function() {
            const isVisible = chatContainer.style.display !== 'none';
            chatContainer.style.display = isVisible ? 'none' : 'block';
        });
    }
    
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    loadChatMessages();
}

function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatMessage = {
        id: Date.now().toString(),
        author: getCurrentUsername(),
        text: message,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    saveChatMessage(chatMessage);
    addChatMessageToUI(chatMessage);
    chatInput.value = '';
}

function saveChatMessage(message) {
    const messages = getChatMessages();
    messages.push(message);
    // Keep only last 20 messages
    if (messages.length > 20) {
        messages.splice(0, messages.length - 20);
    }
    localStorage.setItem('chat_messages', JSON.stringify(messages));
}

function getChatMessages() {
    return JSON.parse(localStorage.getItem('chat_messages') || '[]');
}

function loadChatMessages() {
    const messages = getChatMessages();
    const container = document.getElementById('chat-messages');
    
    if (!container) return;
    
    container.innerHTML = messages.slice(-10).map(message => 
        createChatMessageElement(message)
    ).join('');
    
    container.scrollTop = container.scrollHeight;
}

function createChatMessageElement(message) {
    return `
        <div class="chat-message">
            <span class="chat-author">${escapeHtml(message.author)}:</span>
            <span class="chat-text">${escapeHtml(message.text)}</span>
            <span class="chat-time">${message.timestamp}</span>
        </div>
    `;
}

function addChatMessageToUI(message) {
    const container = document.getElementById('chat-messages');
    const messageElement = createChatMessageElement(message);
    
    container.insertAdjacentHTML('beforeend', messageElement);
    container.scrollTop = container.scrollHeight;
    
    // Keep only last 10 messages visible
    const messages = container.querySelectorAll('.chat-message');
    if (messages.length > 10) {
        messages[0].remove();
    }
}

// Tag System
function initializeTagSystem() {
    const tagsInput = document.getElementById('tags-input');
    const predefinedTags = document.querySelectorAll('.predefined-tag');
    
    if (tagsInput) {
        tagsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(this.value.trim());
                this.value = '';
            }
        });
    }
    
    predefinedTags.forEach(tag => {
        tag.addEventListener('click', function() {
            addTag(this.dataset.tag);
        });
    });
}

function addTag(tagName) {
    if (!tagName) return;
    
    const selectedTags = document.getElementById('selected-tags');
    const existingTags = Array.from(selectedTags.querySelectorAll('.selected-tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    if (existingTags.includes(tagName)) return;
    
    const tagElement = document.createElement('span');
    tagElement.className = 'selected-tag';
    tagElement.innerHTML = `${escapeHtml(tagName)} <span class="remove-tag" onclick="removeTag(this)">×</span>`;
    
    selectedTags.appendChild(tagElement);
}

function removeTag(element) {
    element.parentElement.remove();
}

// Export to Image
function initializeExportImage() {
    const exportImageBtn = document.getElementById('export-image-btn');
    
    if (exportImageBtn) {
        exportImageBtn.addEventListener('click', function() {
            this.textContent = 'Exportando...';
            this.disabled = true;
            
            // Use html2canvas library to capture the kanban board
            const kanbanBoard = document.getElementById('kanban-board');
            
            if (typeof html2canvas !== 'undefined' && kanbanBoard) {
                html2canvas(kanbanBoard, {
                    backgroundColor: null,
                    scale: 2,
                    useCORS: true
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `kanban-board-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                    
                    showNotification('Imagen exportada exitosamente', 'success');
                }).catch(error => {
                    console.error('Error exporting image:', error);
                    showNotification('Error al exportar imagen', 'error');
                }).finally(() => {
                    this.textContent = '📸';
                    this.disabled = false;
                });
            } else {
                // Fallback without html2canvas
                showNotification('Función de exportar imagen no disponible', 'warning');
                this.textContent = '📸';
                this.disabled = false;
            }
        });
    }
}

// Enhanced Task Management with Tags and Assignments
function handleAddTask(e) {
    e.preventDefault();
    
    const taskText = document.getElementById('task-text').value.trim();
    const assignedTo = document.getElementById('task-assigned-to').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    
    if (!taskText) return;
    
    // Get selected tags
    const selectedTags = Array.from(document.querySelectorAll('.selected-tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    const formData = new FormData();
    formData.append('task', taskText);
    formData.append('assigned_to', assignedTo);
    formData.append('due_date', dueDate);
    formData.append('priority', priority);
    formData.append('tags', JSON.stringify(selectedTags));
    formData.append('created_at', new Date().toLocaleString('es-ES'));
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Creando...';
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
            showNotification('Tarea creada exitosamente', 'success');
            
            // Clear form
            document.getElementById('add-task-form').reset();
            document.getElementById('selected-tags').innerHTML = '';
        } else {
            showNotification(data.message || 'Error al crear la tarea', 'error');
        }
        submitBtn.textContent = 'Crear Tarea';
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
        submitBtn.textContent = 'Crear Tarea';
        submitBtn.disabled = false;
    });
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card';
    taskDiv.draggable = true;
    taskDiv.dataset.taskId = task.id;
    taskDiv.dataset.assigned = task.assigned_to || '';
    taskDiv.dataset.tags = (task.tags || []).join(',');
    taskDiv.dataset.dueDate = task.due_date || '';
    
    const tagsHtml = (task.tags || []).map(tag => 
        `<span class="task-tag ${getTagClass(tag)}">${escapeHtml(tag)}</span>`
    ).join('');
    
    const dueDateHtml = task.due_date ? 
        `<div class="task-due-date ${getDueDateClass(task.due_date)}">📅 ${task.due_date}</div>` : '';
    
    const assignedHtml = task.assigned_to && task.assigned_to !== task.created_by ?
        `<span class="task-assigned">→ ${escapeHtml(task.assigned_to)}</span>` : '';
    
    taskDiv.innerHTML = `
        <div class="task-content">
            <div class="task-header">
                <div class="task-tags">${tagsHtml}</div>
                ${dueDateHtml}
            </div>
            <p>${escapeHtml(task.text)}</p>
            <div class="task-meta">
                <div class="task-author-section">
                    <span class="task-author">${escapeHtml(task.created_by)}</span>
                    ${assignedHtml}
                </div>
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
    
    // Add event listeners
    const commentBtn = taskDiv.querySelector('.comment-btn');
    commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskComments(task.id);
    });
    
    const reactionBtns = taskDiv.querySelectorAll('.reaction-btn');
    reactionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addTaskReaction(btn.dataset.taskId, btn.dataset.emoji);
        });
    });
    
    return taskDiv;
}

function getTagClass(tag) {
    const tagClasses = {
        'Urgente': 'urgent',
        'Bug': 'bug',
        'Feature': 'feature',
        'Revisión': 'review',
        'Cliente': 'client'
    };
    return tagClasses[tag] || 'default';
}

function getDueDateClass(dueDate) {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) return 'overdue';
    if (dueDate === today) return 'due-today';
    return '';
}

// Theme Toggle Enhancement
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themes = ['dark', 'light', 'auto'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const icons = { 'dark': '🌙', 'light': '☀️', 'auto': '🔄' };
        themeBtn.textContent = icons[newTheme];
    }
    
    // Save theme preference
    const formData = new FormData();
    formData.append('theme', newTheme);
    
    fetch('/update_settings', {
        method: 'POST',
        body: formData
    });
    
    showNotification(`Tema cambiado a ${newTheme}`, 'success');
}

// Enhanced export functionality
function exportProject() {
    const exportBtn = document.getElementById('export-project-btn') || document.querySelector('[data-action="export"]');
    if (exportBtn) {
        exportBtn.textContent = 'Exportando...';
        exportBtn.disabled = true;
        
        fetch('/export_project')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Create and download JSON file
                const dataStr = JSON.stringify(data.data, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `proyecto-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                
                showNotification('Proyecto exportado exitosamente', 'success');
            } else {
                showNotification(data.message || 'Error al exportar', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error de conexión', 'error');
        })
        .finally(() => {
            exportBtn.textContent = '📊';
            exportBtn.disabled = false;
        });
    }
}

// Original functions (keeping existing functionality)
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${getNotificationIcon(type)}</div>
        <div class="notification-message">${escapeHtml(message)}</div>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentUsername() {
    const userInfo = document.querySelector('.user-info h3');
    return userInfo ? userInfo.textContent : '';
}

// Initialize other existing functions (login, drag and drop, etc.)
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

// Initialize remaining functions with simplified implementations
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
    
    updateTaskCounts();
    
    // Save to server
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
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

function updateTaskCounts() {
    const columns = ['todo', 'inprogress', 'done'];
    
    columns.forEach(column => {
        const container = document.getElementById(`${column}-tasks`);
        const visibleTasks = container.querySelectorAll('.task-card[style*="display: block"], .task-card:not([style*="display: none"])').length;
        const countElement = document.querySelector(`.${column}-header .task-count`);
        if (countElement) {
            countElement.textContent = visibleTasks;
        }
    });
}

// Placeholder implementations for other functions
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

function initializeProjectManagement() {
    const addProjectBtns = document.querySelectorAll('#add-project-btn, .create-first-project-btn');
    addProjectBtns.forEach(btn => {
        btn.addEventListener('click', () => openModal('add-project-modal'));
    });
}

function initializeComments() {
    // Implementation for comments system
}

function initializeAvatarUpload() {
    // Implementation for avatar upload
}

function initializeSettings() {
    // Implementation for settings
}

function initializeNotifications() {
    // Implementation for notifications
}

function initializeThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}

function initializeAnalytics() {
    // Implementation for analytics
}

function initializeRankings() {
    // Implementation for rankings
}

function initializeProjectSettings() {
    // Implementation for project settings
}

function initializeReactions() {
    // Implementation for reactions
}

function initializeExport() {
    // Implementation for export
}

function initializeSecurity() {
    // Implementation for security
}

function addTaskToBoard(task) {
    const todoContainer = document.getElementById('todo-tasks');
    const taskElement = createTaskElement(task);
    todoContainer.appendChild(taskElement);
    
    taskElement.classList.add('success-flash');
    setTimeout(() => taskElement.classList.remove('success-flash'), 600);
}

function openTaskComments(taskId) {
    // Implementation for opening task comments
}

function addTaskReaction(taskId, emoji) {
    // Implementation for adding task reactions
}

// Add CSS for new components
const additionalStyles = `
<style>
.activity-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    margin-right: 10px;
    font-size: 16px;
}

.activity-info {
    flex: 1;
}

.activity-text {
    font-size: 12px;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.activity-time {
    font-size: 10px;
    color: var(--text-secondary);
}

.today-task-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
}

.today-task-item:last-child {
    border-bottom: none;
}

.task-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 10px;
}

.task-status.todo {
    background: var(--todo-color);
}

.task-status.inprogress {
    background: var(--inprogress-color);
}

.task-status.done {
    background: var(--done-color);
}

.task-info {
    flex: 1;
}

.task-text {
    font-size: 12px;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.task-assigned-to {
    font-size: 10px;
    color: var(--text-secondary);
}

.calendar-day-header {
    background: var(--bg-secondary);
    padding: 10px;
    text-align: center;
    font-weight: 600;
    color: var(--text-primary);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);