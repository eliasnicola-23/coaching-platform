# Plataforma Coaching

## Resumen

Coaching es una plataforma empresarial moderna construida con **React + TypeScript + TailwindCSS + shadcn/ui**, enfocada en organización interna, gestión de tareas, casos/CRM y seguimiento del rendimiento del equipo. La plataforma sigue los principios de **Clean Architecture** y **SOLID**, con una estructura modular que incluye tema oscuro/claro persistente, tablero Kanban, sistema de gestión de casos, panel de control con métricas y funciones de gamificación.

**Última actualización:** 16 de octubre de 2025  
**Stack tecnológico:** React 19, TypeScript, TailwindCSS, Zustand, React Router, Vite  
**Servidor de desarrollo:** Ejecutar con `npm run dev -- --host 0.0.0.0 --port 5000`

## Arquitectura

### Arquitectura Frontend
- **Framework:** React 19 con TypeScript  
- **Build Tool:** Vite para desarrollo rápido y builds optimizados  
- **Estilos:** TailwindCSS con tokens de diseño personalizados y soporte para modo oscuro  
- **Gestión de estado:** Zustand con persistencia en localStorage  
- **Routing:** React Router v6 para navegación del lado del cliente  
- **Iconos:** Lucide React para iconografía consistente  
- **Componentes UI:** Componentes personalizados siguiendo los patrones de shadcn/ui  

### Estructura de directorios

```yml
src/
├── components/ # Componentes compartidos (Sidebar, Header, ThemeToggle, AppLayout)
├── features/ # Módulos específicos de features (planeado para expansión futura)
├── hooks/ # Custom hooks de React (planeado)
├── lib/ # Utilidades y helpers (función cn para merge de clases)
├── pages/ # Componentes de páginas (Dashboard, Tasks, Cases, Users, Rankings, Settings)
├── store/ # Stores de Zustand (theme, user, project, task, case)
├── styles/ # Estilos globales y configuración de Tailwind
├── types/ # Definiciones de tipos TypeScript
├── utils/ # Funciones helper (planeado)
└── App.tsx # Componente principal con routing
```

### Gestión de estado

La aplicación usa Zustand para el estado global con los siguientes stores:

1. **themeStore** - Tema oscuro/claro con persistencia en localStorage  
2. **userStore** - Usuario actual, autenticación, puntos y logros  
3. **projectStore** - Gestión de proyectos y selección del proyecto actual  
4. **taskStore** - Operaciones CRUD de tareas y estado del tablero Kanban  
5. **caseStore** - Gestión de casos/CRM con seguimiento de estado  

### Sistema de diseño

- **Tema:** Modo oscuro por defecto, con opción de modo claro  
- **Colores:** Propiedades CSS personalizadas para temas  
- **Tipografía:** Fuente Inter con tamaños consistentes  
- **Gradientes:** Gradientes modernos (yellow-400 a yellow-600, blue-500 a indigo-600, etc.)  
- **Bordes:** Bordes redondeados (rounded-2xl) para cards y contenedores  
- **Sombras:** Elevación sutil con shadow-md y shadow-lg  
- **Espaciado:** Padding consistente (p-4, p-6) y gaps  

## Funcionalidades

### Funcionalidades implementadas

1. **Sistema de tema oscuro/claro**
   - Persistencia de la selección del tema usando localStorage  
   - Store de Zustand para manejo global  
   - Propiedades CSS para estilos dependientes del tema  
   - Botón de cambio de tema en el header  

2. **Dashboard**
   - Cards con métricas y gradientes  
   - Tareas completadas, activas y casos abiertos  
   - Feed de actividad reciente  
   - Indicadores de progreso  

3. **Tablero Kanban (Tareas)**
   - Layout de tres columnas (Por Hacer, En Curso, Finalizado)  
   - Creación de tareas con formularios inline  
   - Movimiento de tareas entre columnas  
   - Filtrado y búsqueda de tareas (planeado)  
   - Indicadores de prioridad y tags  

4. **Módulo Casos/CRM**
   - Operaciones CRUD completas  
   - Estado del caso (abierto, en curso, cerrado)  
   - Niveles de prioridad (baja, media, alta, urgente)  
   - Filtrado por estado  
   - Historial de casos  
   - Asignación de responsables  

5. **Layout y navegación**
   - Sidebar fijo con información de usuario y proyecto  
   - Header superior con búsqueda y notificaciones  
   - Diseño responsive  
   - Navegación con React Router  

6. **Gestión de usuarios**
   - Perfiles de usuario con roles (admin, miembro, invitado)  
   - Sistema de puntos y niveles  
   - Seguimiento de logros  
   - Avatares con iniciales y gradientes  

7. **Gestión de proyectos**
   - Soporte para múltiples proyectos  
   - Selección y cambio de proyecto  
   - Tareas y datos específicos por proyecto  

### Funcionalidades planeadas

- Chat mejorado con @mentions  
- Adjuntar archivos a mensajes y casos  
- Analíticas y gráficos avanzados con Recharts  
- Rankings y leaderboard de usuarios  
- Panel de configuración personalizado  
- Colaboración en tiempo real  
- Integración futura con backend API  

## Modelo de datos

### Entidades principales

- **User**: id, username, email, role, points, level, achievements  
- **Project**: id, name, description, color, createdBy, createdAt  
- **Task**: id, text, status, projectId, createdBy, assignedTo, priority, tags, dueDate  
- **Case**: id, cliente, descripcion, estado, prioridad, responsable, notasInternas, historial  
- **Message**: id, author, text, timestamp, projectId, mentions, attachments  

Actualmente, todas las entidades se almacenan en stores de Zustand con persistencia en localStorage. Futura fase: integración con backend API (Supabase o REST).

## Guía de desarrollo

### Estilo de código
- Usar TypeScript para todo el código nuevo  
- Seguir principios SOLID y Single Responsibility Principle  
- Usar imports solo para tipos cuando corresponda  
- Nombres descriptivos para componentes y variables  
- Componentes modulares y enfocados  

### Estructura de componentes
- Componentes compartidos: `src/components/`  
- Páginas: `src/pages/`  
- Módulos complejos: feature folders (planeado)  
- Exportar componentes con named exports  

### Gestión de estado
- Stores de Zustand para estado global  
- Persistencia en localStorage de datos importantes  
- Mantener lógica de store simple y enfocada  
- Usar selectors para estados derivados  

### Estilos
- Clases utilitarias de TailwindCSS  
- Seguir paleta de colores del sistema de diseño  
- Usar `cn()` para clases condicionales  
- Mantener consistencia en spacing y sizing  

## Cómo ejecutar la aplicación

### Desarrollo

**IMPORTANTE:** El workflow en `.replit` todavía apunta al antiguo backend Flask. Debe actualizarse manualmente:

1. Abrir el archivo `.replit`  
2. Buscar la sección `[[workflows.workflow.tasks]]` de "Start application"  
3. Cambiar esta línea:
   ```
   args = "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
   ```
   Por:
   ```
   args = "npm run dev -- --host 0.0.0.0 --port 5000"
   ```

Alternatively, run manually:
```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5000
```

The application will run on `http://localhost:5000`

### Building for Production
```bash
npm run build
npm run preview
```

## Preferencias del usuario

- **Idioma:** Español (ES) para la interfaz  
- **Diseño:** Moderno y minimalista con gradientes y bordes redondeados  
- **Tema:** Modo oscuro por defecto  
- **Feedback visual:** Transiciones suaves y efectos hover  
- **Código limpio:** Sin comentarios innecesarios, código autoexplicativo  

## Actualizaciones recientes (16 de octubre de 2025)

### Funcionalidades completadas

- ✅ Migración completa a React + TypeScript  
- ✅ Tema oscuro/claro persistente con Zustand + localStorage  
- ✅ Tablero Kanban con drag & drop usando @dnd-kit  
- ✅ Módulo Casos/CRM con operaciones CRUD completas  
- ✅ Módulo de chat seguro con soporte @mention (XSS corregido)  
- ✅ Sistema de gamificación con rankings, puntos y logros  
- ✅ Gradientes modernos y pulido visual en toda la interfaz  

### Detalles técnicos

- No depende de Flask ni backend en Python  
- Todo el estado se maneja con Zustand + persistencia en localStorage  
- Renderizado seguro de mensajes (sin vulnerabilidades XSS)  
- Arquitectura limpia y principios SOLID aplicados  
- TypeScript tipado y seguro en todo el proyecto
