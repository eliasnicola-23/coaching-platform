import os
import logging
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

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

# Gamification constants
POINTS_PER_TASK = 10
POINTS_PER_COMMENT = 5
POINTS_PER_PROJECT = 50

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

def get_avatar_color(username):
    """Generate consistent color for user avatar based on username"""
    colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
        '#00D2D3', '#FF9F43', '#EE5A24', '#0984E3'
    ]
    # Use hash of username to pick consistent color
    color_index = hash(username) % len(colors)
    return colors[color_index]

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
        avatar_color = get_avatar_color(username)
        user_stats = get_user_stats(username)
        user_points = get_user_points(username)
        user_info = get_user_info(username)
        user_role = get_user_role_display(user_info.get('role', 'invitado') if user_info else 'invitado')
        can_manage_projects = user_can_manage_projects(username)
        can_edit_tasks = user_can_edit_tasks(username)
        
        # Check for new achievements
        check_achievements(username)
        
        return render_template('index.html', 
                             logged_in=True, 
                             username=username,
                             user_initials=user_initials,
                             avatar_color=avatar_color,
                             user_stats=user_stats,
                             user_points=user_points,
                             user_role=user_role,
                             can_manage_projects=can_manage_projects,
                             can_edit_tasks=can_edit_tasks,
                             projects=user_projects,
                             current_project=current_project,
                             tasks=tasks)
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
