# Overview

This is a Flask-based Kanban board application for task management and goal tracking. The system provides a modern, minimalist coaching/productivity tool where users can log in and manage their tasks across three columns: "Por hacer" (To Do), "En curso" (In Progress), and "Finalizado" (Done). Users can create tasks and drag them between columns to track progress, similar to a simplified Trello board. The interface features color-coded columns with interactive visual feedback and modern animations.

# User Preferences

- Preferred communication style: Simple, everyday language
- Design preference: Minimalist and modern interface
- Visual indicators: Color-coded columns (red for To Do, orange for In Progress, green with checkmarks for Done)
- Interactive elements: Smooth animations and hover effects

# System Architecture

## Frontend Architecture
- **Template Engine**: Uses Flask's Jinja2 templating with server-side rendering
- **Typography**: Poppins font family for modern, clean appearance
- **Layout**: Sidebar navigation with main content area, responsive design
- **Styling**: Modern CSS with flexbox layout, gradient backgrounds, and smooth animations
- **Color System**: Visual status indicators - red for "Por hacer", orange for "En curso", green for "Finalizado"  
- **Interactivity**: Vanilla JavaScript for drag-and-drop functionality, project management, form handling, and AJAX requests
- **UI Pattern**: Multi-page application with sidebar navigation and project-based organization
- **Visual Effects**: Hover animations, drag feedback, smooth transitions, and modal interactions

## Backend Architecture
- **Framework**: Flask web framework for Python
- **Session Management**: Flask sessions with server-side storage using secret keys
- **Authentication**: Simple username/password validation against in-memory user store
- **Project Management**: Multi-project support with project creation, selection, and navigation
- **Data Storage**: In-memory dictionaries for user credentials, projects, and tasks
- **API Design**: RESTful endpoints for login, project management, and task operations

## Data Storage
- **User Database**: Simple list of dictionaries containing username/password pairs
- **Project Storage**: Nested dictionary structure organized by username containing project lists
- **Task Storage**: Three-level nested structure: username → project_id → task columns (todo/inprogress/done)
- **Session Storage**: Flask's built-in session management for maintaining user and current project state
- **Current Project Tracking**: Per-user tracking of currently selected project
- **Data Persistence**: Currently uses in-memory storage (data lost on restart)

## Authentication & Authorization
- **Login System**: Form-based authentication with POST requests
- **Session Management**: Username stored in Flask session after successful login
- **Access Control**: Route protection based on session presence
- **User Isolation**: Tasks are separated by username to ensure data privacy

# External Dependencies

## Core Framework Dependencies
- **Flask**: Web framework for Python applications
- **Jinja2**: Template engine (included with Flask)
- **Werkzeug**: WSGI utilities (included with Flask)

## Frontend Libraries
- **Vanilla JavaScript**: No external JavaScript libraries required
- **CSS3**: Modern CSS features including flexbox and drag-and-drop styling
- **HTML5**: Drag and drop API for task movement functionality

## Environment Configuration
- **Environment Variables**: Uses SESSION_SECRET for production security
- **Development Server**: Flask's built-in development server
- **Static File Serving**: Flask's static file handling for CSS and JavaScript

## Potential Future Dependencies
- **Database**: Currently designed for easy migration to SQLite, PostgreSQL, or MySQL
- **Authentication**: Structure supports integration with Flask-Login or similar libraries
- **API Framework**: Architecture ready for Flask-RESTful or similar API extensions