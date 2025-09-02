import os
import logging
import base64
import hashlib
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

# In-memory storage for demo purposes
users_db = [
    {"username": "admin", "password": "1234", "role": "admin", "email": "admin@example.com"},
    {"username": "maria", "password": "1234", "role": "miembro", "email": "maria@example.com"},
    {"username": "juan", "password": "1234", "role": "invitado", "email": "juan@example.com"}
]
projects_db = {}  # Will store projects per user: {username: [projects]}
tasks_db = {}  # Will store tasks per user and project: {username: {project_id: {todo: [], inprogress: [], done: []}}}
current_project_db = {}  # Current project per user: {username: project_id}
comments_db = {}  # Will store comments per task: {task_key: [comments]}
user_points_db = {}  # Will store user points and achievements: {username: {"points": int, "level": int, "achievements": []}}
user_avatars_db = {}  # Will store user avatars: {username: {"has_custom": bool, "filename": str}}
user_settings_db = {}  # Will store user preferences: {username: {"theme": str, "custom_colors": {}, "notifications": {}}}
notifications_db = {}  # Will store notifications: {username: [{"id": str, "message": str, "type": str, "timestamp": str, "read": bool}]}
project_settings_db = {}  # Will store project settings: {username: {project_id: {"columns": [], "task_order": str, "colors": {}}}}
user_rankings_db = {}  # Will store ranking data: {username: {"weekly_completed": int, "monthly_score": int, "rank": int}}

# Gamification constants
POINTS_PER_TASK = 10
POINTS_PER_COMMENT = 5
POINTS_PER_PROJECT = 50

# File upload settings
UPLOAD_FOLDER = 'static/uploads/avatars'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if uploaded file is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_user_initials(username):
    """Generate user initials from username"""
    if not username:
        return "?"
    
    # Split by common separators and take first letter of each part
    parts = username.replace('_', ' ').replace('.', ' ').replace('-', ' ').split()
    if len(parts) >= 2:
        return f"{parts[0][0].upper()}{parts[1][0].upper()}"
    else:
        return username[:2].upper()

def get_avatar_color(username, project_id=None):
    """Generate consistent color for user avatar based on username and project"""
    base_colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
        '#00D2D3', '#FF9F43', '#EE5A24', '#0984E3'
    ]
    
    # If project specified, modify color based on project
    if project_id:
        # Create a unique hash combining username and project
        combined_hash = hash(f"{username}_{project_id}")
        color_index = combined_hash % len(base_colors)
        
        # Modify the base color slightly for project variation
        base_color = base_colors[color_index]
        # Add slight variation based on project
        project_variation = (hash(project_id) % 40) - 20  # -20 to +20
        return adjust_color_brightness(base_color, project_variation)
    else:
        # Use original logic for default color
        color_index = hash(username) % len(base_colors)
        return base_colors[color_index]

def adjust_color_brightness(hex_color, adjustment):
    """Adjust color brightness by a percentage"""
    # Remove # if present
    hex_color = hex_color.lstrip('#')
    
    # Convert to RGB
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    
    # Adjust brightness
    r = max(0, min(255, r + adjustment))
    g = max(0, min(255, g + adjustment))
    b = max(0, min(255, b + adjustment))
    
    # Convert back to hex
    return f"#{r:02x}{g:02x}{b:02x}"

def get_user_avatar(username):
    """Get user avatar information"""
    avatar_info = user_avatars_db.get(username, {"has_custom": False, "filename": None})
    return avatar_info

def get_user_settings(username):
    """Get or initialize user settings"""
    if username not in user_settings_db:
        user_settings_db[username] = {
            "theme": "light",
            "custom_colors": {
                "primary": "#667eea",
                "secondary": "#764ba2",
                "todo": "#ff6b6b",
                "inprogress": "#feca57",
                "done": "#48cae4"
            },
            "notifications": {
                "email_enabled": True,
                "task_moves": True,
                "project_updates": True,
                "achievements": True
            }
        }
    return user_settings_db[username]

def get_project_settings(username, project_id):
    """Get or initialize project settings"""
    if username not in project_settings_db:
        project_settings_db[username] = {}
    
    if project_id not in project_settings_db[username]:
        project_settings_db[username][project_id] = {
            "columns": ["todo", "inprogress", "done"],
            "task_order": "created_date",  # created_date, priority, assigned
            "colors": {
                "todo": "#ff6b6b",
                "inprogress": "#feca57",
                "done": "#48cae4"
            }
        }
    return project_settings_db[username][project_id]

def add_notification(username, message, notification_type="info"):
    """Add a notification for a user"""
    if username not in notifications_db:
        notifications_db[username] = []
    
    notification = {
        "id": f"notif_{len(notifications_db[username])}",
        "message": message,
        "type": notification_type,  # info, success, warning, error
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "read": False
    }
    
    notifications_db[username].append(notification)
    
    # Keep only last 50 notifications
    if len(notifications_db[username]) > 50:
        notifications_db[username] = notifications_db[username][-50:]

def get_user_ranking(username):
    """Get or calculate user ranking data"""
    if username not in user_rankings_db:
        user_rankings_db[username] = {
            "weekly_completed": 0,
            "monthly_score": 0,
            "rank": 0
        }
    
    # Calculate weekly completed tasks (last 7 days)
    # For demo, we'll use current completed tasks
    user_stats = get_user_stats(username)
    user_rankings_db[username]["weekly_completed"] = min(user_stats["completed_tasks"], 20)  # Cap for demo
    user_rankings_db[username]["monthly_score"] = user_stats["completed_tasks"] * 10 + user_stats["total_projects"] * 50
    
    return user_rankings_db[username]

def calculate_global_rankings():
    """Calculate rankings for all users"""
    all_rankings = []
    for username in user_rankings_db:
        ranking = get_user_ranking(username)
        ranking["username"] = username
        all_rankings.append(ranking)
    
    # Sort by monthly score
    all_rankings.sort(key=lambda x: x["monthly_score"], reverse=True)
    
    # Update ranks
    for i, ranking in enumerate(all_rankings):
        user_rankings_db[ranking["username"]]["rank"] = i + 1
    
    return all_rankings[:10]  # Top 10

def get_user_info(username):
    """Get user information including role"""
    for user in users_db:
        if user['username'] == username:
            return user
    return None

def get_user_role_display(role):
    """Convert role to display format"""
    role_names = {
        'admin': 'Administrador',
        'miembro': 'Miembro',
        'invitado': 'Invitado'
    }
    return role_names.get(role, 'Usuario')

def user_can_edit_tasks(username, task_owner=None):
    """Check if user can edit/move tasks"""
    user_info = get_user_info(username)
    if not user_info:
        return False
    
    role = user_info.get('role', 'invitado')
    
    # Admin can edit everything
    if role == 'admin':
        return True
    
    # Miembros can edit their own tasks or any task if no owner specified
    if role == 'miembro':
        return task_owner is None or task_owner == username
    
    # Invitados can't edit
    return False

def user_can_manage_projects(username):
    """Check if user can create/manage projects"""
    user_info = get_user_info(username)
    if not user_info:
        return False
    
    role = user_info.get('role', 'invitado')
    return role in ['admin', 'miembro']

def get_user_points(username):
    """Get or initialize user points data"""
    if username not in user_points_db:
        user_points_db[username] = {
            "points": 0,
            "level": 1,
            "achievements": []
        }
    return user_points_db[username]

def add_points(username, points, reason=""):
    """Add points to user and check for level up"""
    user_points = get_user_points(username)
    user_points["points"] += points
    
    # Calculate level (every 100 points = 1 level)
    new_level = (user_points["points"] // 100) + 1
    if new_level > user_points["level"]:
        user_points["level"] = new_level
        # Check for level achievements
        check_achievements(username)
    
    return user_points

def check_achievements(username):
    """Check and award achievements"""
    user_points = get_user_points(username)
    user_stats = get_user_stats(username)
    achievements = user_points["achievements"]
    
    # Define achievements
    potential_achievements = [
        {"id": "first_task", "name": "Primera Tarea", "icon": "🎯", "condition": user_stats["completed_tasks"] >= 1},
        {"id": "task_master", "name": "Maestro Tareas", "icon": "🏆", "condition": user_stats["completed_tasks"] >= 10},
        {"id": "project_creator", "name": "Creador", "icon": "🚀", "condition": user_stats["total_projects"] >= 1},
        {"id": "level_5", "name": "Nivel 5", "icon": "⭐", "condition": user_points["level"] >= 5},
        {"id": "productive", "name": "Productivo", "icon": "💪", "condition": user_stats["completion_rate"] >= 80 and user_stats["total_tasks"] >= 5}
    ]
    
    # Award new achievements
    existing_achievement_ids = [a["id"] for a in achievements]
    for achievement in potential_achievements:
        if achievement["condition"] and achievement["id"] not in existing_achievement_ids:
            achievements.append({
                "id": achievement["id"],
                "name": achievement["name"],
                "icon": achievement["icon"],
                "date_earned": "Reciente"
            })

def get_user_stats(username):
    """Calculate user statistics"""
    user_tasks = tasks_db.get(username, {})
    total_tasks = 0
    completed_tasks = 0
    
    for project_tasks in user_tasks.values():
        total_tasks += len(project_tasks.get('todo', [])) + len(project_tasks.get('inprogress', [])) + len(project_tasks.get('done', []))
        completed_tasks += len(project_tasks.get('done', []))
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    return {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'active_tasks': total_tasks - completed_tasks,
        'completion_rate': round(completion_rate, 1),
        'total_projects': len(projects_db.get(username, []))
    }

@app.route('/')
def index():
    """Main route - serves the application dashboard if logged in, otherwise login form"""
    if 'username' in session:
        username = session['username']
        
        # Get user's projects
        user_projects = projects_db.get(username, [])
        
        # Get current project
        current_project = None
        current_project_id = current_project_db.get(username)
        if current_project_id:
            current_project = next((p for p in user_projects if p['id'] == current_project_id), None)
        
        # Get tasks for current project
        tasks = {"todo": [], "inprogress": [], "done": []}
        if current_project:
            user_tasks = tasks_db.get(username, {})
            project_tasks = user_tasks.get(current_project_id, {"todo": [], "inprogress": [], "done": []})
            tasks = project_tasks
        
        # Get user avatar data and role info
        user_initials = get_user_initials(username)
        avatar_color = get_avatar_color(username, current_project_id)
        user_avatar = get_user_avatar(username)
        user_stats = get_user_stats(username)
        user_points = get_user_points(username)
        user_settings = get_user_settings(username)
        user_info = get_user_info(username)
        user_role = get_user_role_display(user_info.get('role', 'invitado') if user_info else 'invitado')
        can_manage_projects = user_can_manage_projects(username)
        can_edit_tasks = user_can_edit_tasks(username)
        
        # Get notifications
        user_notifications = notifications_db.get(username, [])
        unread_notifications = len([n for n in user_notifications if not n['read']])
        
        # Get ranking data
        user_ranking = get_user_ranking(username)
        global_rankings = calculate_global_rankings()
        
        # Get project settings if current project exists
        project_settings = None
        if current_project_id:
            project_settings = get_project_settings(username, current_project_id)
        
        # Check for new achievements
        check_achievements(username)
        
        return render_template('index.html', 
                             logged_in=True, 
                             username=username,
                             user_initials=user_initials,
                             avatar_color=avatar_color,
                             user_avatar=user_avatar,
                             user_stats=user_stats,
                             user_points=user_points,
                             user_settings=user_settings,
                             user_role=user_role,
                             can_manage_projects=can_manage_projects,
                             can_edit_tasks=can_edit_tasks,
                             projects=user_projects,
                             current_project=current_project,
                             project_settings=project_settings,
                             tasks=tasks,
                             notifications=user_notifications,
                             unread_notifications=unread_notifications,
                             user_ranking=user_ranking,
                             global_rankings=global_rankings)
    else:
        return render_template('index.html', logged_in=False)

@app.route('/login', methods=['POST'])
def login():
    """Handle login requests"""
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()
    
    # Find user in our simple database
    user_found = None
    for user in users_db:
        if user['username'] == username and user['password'] == password:
            user_found = user
            break
    
    if user_found:
        session['username'] = username
        # Initialize user data if they don't exist
        if username not in projects_db:
            projects_db[username] = []
        if username not in tasks_db:
            tasks_db[username] = {}
        if username not in current_project_db:
            current_project_db[username] = None
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"})

@app.route('/logout')
def logout():
    """Handle logout"""
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/add_task', methods=['POST'])
def add_task():
    """Add a new task to current project"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    
    # Check permissions
    if not user_can_edit_tasks(username):
        return jsonify({"success": False, "message": "No tienes permisos para agregar tareas"})
    
    current_project_id = current_project_db.get(username)
    
    if not current_project_id:
        return jsonify({"success": False, "message": "No hay proyecto seleccionado"})
    
    task_text = request.form.get('task', '').strip()
    if not task_text:
        return jsonify({"success": False, "message": "La tarea no puede estar vacía"})
    
    # Initialize user tasks if they don't exist
    if username not in tasks_db:
        tasks_db[username] = {}
    if current_project_id not in tasks_db[username]:
        tasks_db[username][current_project_id] = {"todo": [], "inprogress": [], "done": []}
    
    # Generate unique task ID for this project
    project_tasks = tasks_db[username][current_project_id]
    task_id = f"task_{username}_{current_project_id}_{len(project_tasks['todo']) + len(project_tasks['inprogress']) + len(project_tasks['done'])}"
    
    new_task = {
        "id": task_id, 
        "text": task_text, 
        "created_at": request.form.get('created_at', 'ahora'),
        "created_by": username
    }
    project_tasks['todo'].append(new_task)
    
    # Initialize comments for this task
    comments_db[task_id] = []
    
    # Award points for creating task
    add_points(username, POINTS_PER_TASK, "Nueva tarea creada")
    
    return jsonify({"success": True, "task": new_task})

@app.route('/move_task', methods=['POST'])
def move_task():
    """Move a task between columns in current project"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    
    # Check permissions
    if not user_can_edit_tasks(username):
        return jsonify({"success": False, "message": "No tienes permisos para mover tareas"})
    
    current_project_id = current_project_db.get(username)
    
    if not current_project_id:
        return jsonify({"success": False, "message": "No hay proyecto seleccionado"})
    
    task_id = request.form.get('task_id', '').strip()
    from_column = request.form.get('from_column')
    to_column = request.form.get('to_column')
    
    user_tasks = tasks_db.get(username, {})
    project_tasks = user_tasks.get(current_project_id, {"todo": [], "inprogress": [], "done": []})
    
    # Find and remove task from source column
    task_to_move = None
    for i, task in enumerate(project_tasks[from_column]):
        if task['id'] == task_id:
            task_to_move = project_tasks[from_column].pop(i)
            break
    
    if task_to_move:
        # Add task to destination column
        project_tasks[to_column].append(task_to_move)
        tasks_db[username][current_project_id] = project_tasks
        
        # Award bonus points for completing task
        if to_column == 'done':
            add_points(username, POINTS_PER_TASK * 2, "Tarea completada")
        
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Tarea no encontrada"})

@app.route('/create_project', methods=['POST'])
def create_project():
    """Create a new project"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    
    # Check permissions
    if not user_can_manage_projects(username):
        return jsonify({"success": False, "message": "No tienes permisos para crear proyectos"})
    
    project_name = request.form.get('name', '').strip()
    if not project_name:
        return jsonify({"success": False, "message": "El nombre del proyecto no puede estar vacío"})
    
    # Initialize user projects if they don't exist
    if username not in projects_db:
        projects_db[username] = []
    
    # Generate unique project ID
    project_id = f"proj_{len(projects_db[username])}_{hash(project_name) % 10000}"
    
    new_project = {
        "id": project_id,
        "name": project_name
    }
    
    projects_db[username].append(new_project)
    
    # Initialize tasks for new project
    if username not in tasks_db:
        tasks_db[username] = {}
    tasks_db[username][project_id] = {"todo": [], "inprogress": [], "done": []}
    
    # Set as current project if it's the first one
    if len(projects_db[username]) == 1:
        current_project_db[username] = project_id
    
    # Award points for creating project
    add_points(username, POINTS_PER_PROJECT, "Nuevo proyecto creado")
    
    return jsonify({"success": True, "project": new_project})

@app.route('/select_project/<project_id>')
def select_project(project_id):
    """Select a project as current"""
    if 'username' not in session:
        return redirect(url_for('index'))
    
    username = session['username']
    
    # Verify project exists for user
    user_projects = projects_db.get(username, [])
    project_exists = any(p['id'] == project_id for p in user_projects)
    
    if project_exists:
        current_project_db[username] = project_id
    
    return redirect(url_for('index'))

@app.route('/add_comment', methods=['POST'])
def add_comment():
    """Add a comment to a task"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    task_id = request.form.get('task_id', '').strip()
    comment_text = request.form.get('comment', '').strip()
    
    if not task_id or not comment_text:
        return jsonify({"success": False, "message": "Faltan datos requeridos"})
    
    username = session['username']
    user_initials = get_user_initials(username)
    avatar_color = get_avatar_color(username)
    
    # Create new comment
    from datetime import datetime
    new_comment = {
        "id": len(comments_db.get(task_id, [])),
        "text": comment_text,
        "author": username,
        "author_initials": user_initials,
        "author_color": avatar_color,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Initialize comments if don't exist
    if task_id not in comments_db:
        comments_db[task_id] = []
    
    comments_db[task_id].append(new_comment)
    
    # Award points for commenting
    add_points(username, POINTS_PER_COMMENT, "Comentario agregado")
    
    return jsonify({"success": True, "comment": new_comment})

@app.route('/get_comments/<task_id>')
def get_comments(task_id):
    """Get comments for a task"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    task_comments = comments_db.get(task_id, [])
    return jsonify({"success": True, "comments": task_comments})

@app.route('/get_task_details/<task_id>')
def get_task_details(task_id):
    """Get detailed information about a task"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    current_project_id = current_project_db.get(username)
    
    if not current_project_id:
        return jsonify({"success": False, "message": "No hay proyecto seleccionado"})
    
    # Find task in current project
    user_tasks = tasks_db.get(username, {})
    project_tasks = user_tasks.get(current_project_id, {"todo": [], "inprogress": [], "done": []})
    
    task_found = None
    task_column = None
    
    for column in ['todo', 'inprogress', 'done']:
        for task in project_tasks[column]:
            if task['id'] == task_id:
                task_found = task
                task_column = column
                break
        if task_found:
            break
    
    if not task_found:
        return jsonify({"success": False, "message": "Tarea no encontrada"})
    
    # Get comments for this task
    task_comments = comments_db.get(task_id, [])
    
    return jsonify({
        "success": True, 
        "task": task_found,
        "column": task_column,
        "comments": task_comments,
        "comment_count": len(task_comments)
    })

# New routes for advanced features

@app.route('/upload_avatar', methods=['POST'])
def upload_avatar():
    """Handle avatar upload"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    
    if 'avatar' not in request.files:
        return jsonify({"success": False, "message": "No se seleccionó archivo"})
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"success": False, "message": "No se seleccionó archivo"})
    
    if file and allowed_file(file.filename):
        # Check file size
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        if file_length > MAX_FILE_SIZE:
            return jsonify({"success": False, "message": "El archivo es demasiado grande (máximo 5MB)"})
        file.seek(0)
        
        # Create secure filename
        file_extension = 'jpg'
        if file.filename and '.' in file.filename:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = secure_filename(f"{username}_{int(datetime.now().timestamp())}.{file_extension}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Update user avatar info
        user_avatars_db[username] = {
            "has_custom": True,
            "filename": filename
        }
        
        return jsonify({"success": True, "filename": filename})
    else:
        return jsonify({"success": False, "message": "Tipo de archivo no permitido"})

@app.route('/avatars/<filename>')
def uploaded_file(filename):
    """Serve uploaded avatar files"""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/update_settings', methods=['POST'])
def update_settings():
    """Update user settings"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    settings = get_user_settings(username)
    
    # Update theme
    if 'theme' in request.form:
        settings['theme'] = request.form.get('theme')
    
    # Update custom colors
    if 'primary_color' in request.form:
        settings['custom_colors']['primary'] = request.form.get('primary_color')
    if 'secondary_color' in request.form:
        settings['custom_colors']['secondary'] = request.form.get('secondary_color')
    if 'todo_color' in request.form:
        settings['custom_colors']['todo'] = request.form.get('todo_color')
    if 'inprogress_color' in request.form:
        settings['custom_colors']['inprogress'] = request.form.get('inprogress_color')
    if 'done_color' in request.form:
        settings['custom_colors']['done'] = request.form.get('done_color')
    
    # Update notification preferences
    settings['notifications']['email_enabled'] = request.form.get('email_notifications') == 'on'
    settings['notifications']['task_moves'] = request.form.get('task_move_notifications') == 'on'
    settings['notifications']['project_updates'] = request.form.get('project_notifications') == 'on'
    settings['notifications']['achievements'] = request.form.get('achievement_notifications') == 'on'
    
    user_settings_db[username] = settings
    
    return jsonify({"success": True, "message": "Configuraciones actualizadas"})

@app.route('/get_notifications')
def get_notifications():
    """Get user notifications"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    user_notifications = notifications_db.get(username, [])
    
    return jsonify({"success": True, "notifications": user_notifications})

@app.route('/mark_notification_read', methods=['POST'])
def mark_notification_read():
    """Mark notification as read"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    notification_id = request.form.get('notification_id')
    
    user_notifications = notifications_db.get(username, [])
    for notification in user_notifications:
        if notification['id'] == notification_id:
            notification['read'] = True
            break
    
    return jsonify({"success": True})

@app.route('/update_project_settings', methods=['POST'])
def update_project_settings():
    """Update project settings"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    current_project_id = current_project_db.get(username)
    
    if not current_project_id:
        return jsonify({"success": False, "message": "No hay proyecto seleccionado"})
    
    project_settings = get_project_settings(username, current_project_id)
    
    # Update visible columns
    if 'columns' in request.form:
        columns = request.form.getlist('columns')
        project_settings['columns'] = columns
    
    # Update task order
    if 'task_order' in request.form:
        project_settings['task_order'] = request.form.get('task_order')
    
    # Update column colors
    if 'todo_color' in request.form:
        project_settings['colors']['todo'] = request.form.get('todo_color')
    if 'inprogress_color' in request.form:
        project_settings['colors']['inprogress'] = request.form.get('inprogress_color')
    if 'done_color' in request.form:
        project_settings['colors']['done'] = request.form.get('done_color')
    
    return jsonify({"success": True, "message": "Configuraciones del proyecto actualizadas"})

@app.route('/add_task_reaction', methods=['POST'])
def add_task_reaction():
    """Add emoji reaction to a task"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    task_id = request.form.get('task_id')
    emoji = request.form.get('emoji')
    
    # Initialize reactions if don't exist
    if task_id not in comments_db:
        comments_db[task_id] = []
    
    # Add reaction as special comment
    reaction_comment = {
        "id": f"reaction_{len(comments_db[task_id])}",
        "text": f"Reaccionó con {emoji}",
        "author": username,
        "author_initials": get_user_initials(username),
        "author_color": get_avatar_color(username),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "is_reaction": True,
        "emoji": emoji
    }
    
    comments_db[task_id].append(reaction_comment)
    
    return jsonify({"success": True, "reaction": reaction_comment})

@app.route('/export_project')
def export_project():
    """Export current project data (simulated)"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    current_project_id = current_project_db.get(username)
    
    if not current_project_id:
        return jsonify({"success": False, "message": "No hay proyecto seleccionado"})
    
    # Get project data
    user_projects = projects_db.get(username, [])
    current_project = next((p for p in user_projects if p['id'] == current_project_id), None)
    
    if not current_project:
        return jsonify({"success": False, "message": "Proyecto no encontrado"})
    
    user_tasks = tasks_db.get(username, {})
    project_tasks = user_tasks.get(current_project_id, {"todo": [], "inprogress": [], "done": []})
    
    export_data = {
        "project_name": current_project['name'],
        "export_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "tasks": project_tasks,
        "total_tasks": len(project_tasks['todo']) + len(project_tasks['inprogress']) + len(project_tasks['done']),
        "completed_tasks": len(project_tasks['done'])
    }
    
    # Simulate file creation
    add_notification(username, f"Exportación del proyecto '{current_project['name']}' completada", "success")
    
    return jsonify({"success": True, "message": "Proyecto exportado exitosamente", "data": export_data})

@app.route('/change_password', methods=['POST'])
def change_password():
    """Change user password"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    current_password = request.form.get('current_password', '').strip()
    new_password = request.form.get('new_password', '').strip()
    confirm_password = request.form.get('confirm_password', '').strip()
    
    # Find user
    user_info = get_user_info(username)
    if not user_info:
        return jsonify({"success": False, "message": "Usuario no encontrado"})
    
    # Verify current password
    if user_info['password'] != current_password:
        return jsonify({"success": False, "message": "Contraseña actual incorrecta"})
    
    # Validate new password
    if len(new_password) < 4:
        return jsonify({"success": False, "message": "La nueva contraseña debe tener al menos 4 caracteres"})
    
    if new_password != confirm_password:
        return jsonify({"success": False, "message": "Las contraseñas no coinciden"})
    
    # Update password
    for user in users_db:
        if user['username'] == username:
            user['password'] = new_password
            break
    
    add_notification(username, "Contraseña cambiada exitosamente", "success")
    
    return jsonify({"success": True, "message": "Contraseña actualizada exitosamente"})

@app.route('/get_rankings')
def get_rankings():
    """Get global user rankings"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    rankings = calculate_global_rankings()
    
    return jsonify({"success": True, "rankings": rankings})

@app.route('/get_user_stats/<period>')
def get_user_stats_period(period):
    """Get user statistics for a specific period"""
    if 'username' not in session:
        return jsonify({"success": False, "message": "No autorizado"})
    
    username = session['username']
    
    # For demo purposes, generate mock data
    if period == 'weekly':
        stats = {
            "labels": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
            "completed": [2, 3, 1, 4, 2, 1, 0],
            "created": [3, 2, 2, 3, 3, 1, 1]
        }
    elif period == 'monthly':
        stats = {
            "labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
            "completed": [13, 8, 12, 7],
            "created": [15, 10, 14, 9]
        }
    else:
        stats = {
            "labels": ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            "completed": [45, 38, 52, 41, 49, 35],
            "created": [50, 42, 58, 47, 53, 40]
        }
    
    return jsonify({"success": True, "stats": stats})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
