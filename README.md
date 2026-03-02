<div align="center">

# 🌊 Flowra
### Your All-in-One Planner & Task Management Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS](https://img.shields.io/badge/Plain_CSS-Custom_Design-38B2AC?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Flowra** is a beautiful, professional, and comprehensive task and project management dashboard.  
Plan your days, track project progress, visualize your year, and stay on top of everything with a clean, modern light-theme design.

[Features](#-features) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 📊 Comprehensive Dashboard
- **Live Metrics**: Track total tasks, completion rate, daily streaks, and active projects.
- **Priority Donut Chart**: Visualize your workload distribution by High, Medium, and Low priorities.
- **Status Distribution**: Clean horizontal progress bars showing In Progress, Completed, and Overdue tasks.
- **Weekly Activity Chart**: Heatmap-style visual representation of your productivity over the last 7 days.
- **Project Workload**: Quick table view of active projects and their overall health (On Track, At Risk).

### 📋 Interactive Task Board (Kanban & Table)
- **View Toggle**: Seamlessly switch between a standard Table view and a Board view.
- **Colored Kanban Columns**: Drag and drop tasks between *To Do*, *In Progress*, and *Done*.
- **Priority & Category Badges**: Clear visual tags for University, Project, Personal, Work, and Other tasks.
- **Quick Add**: Instantly add new tasks directly from the board.

### 🚀 Advanced Project Tracker
- **Project Cards**: View all projects with summary stats and progress rings.
- **Detailed Project View**: Dive into a specific project to see its timeline, status, and an isolated Kanban board just for that project.
- **Status Filters**: Filter projects by Active, Paused, or Completed.

### 📅 Calendar & Year Planner
- **Monthly View**: A traditional grid calendar highlighting tasks due on specific days.
- **Yearly Heatmap**: A GitHub-style contribution graph offering a bird's-eye view of your productivity across the entire year.

---

## 📸 Screenshots

*(Replace with actual screenshots of your application)*

| Dashboard | Task Board (Kanban) |
|-----------|--------------------|
| Overview of all productivity metrics | Drag-and-drop task management |

| Project Tracker | Yearly Planner |
|-----------------|----------------|
| Track individual project progress | Heatmap of your yearly activity |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 6 |
| **Styling** | Vanilla CSS (Custom Design System, CSS Variables) |
| **State Management** | React Context API & useReducer |
| **Data Persistence** | LocalStorage |
| **Routing** | React Router v6 |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (Node Package Manager)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/AshrafulKabir7/Flowra.git
cd Flowra
```

**2. Install all dependencies**
```bash
npm install
```

**3. Start the development server**
```bash
npm run dev
```

**4. Open the app**
Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
Flowra/
├── src/                        # React frontend
│   ├── main.jsx                # App entry point
│   ├── App.jsx                 # Routes & Context provider
│   ├── index.css               # Global styles & custom design system
│   ├── components/             # Reusable UI components
│   │   ├── Layout.jsx          # Shell with Topbar
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   ├── TaskModal.jsx       # Task creation/editing
│   │   ├── ProjectModal.jsx    # Project creation/editing
│   │   ├── CategoryBadge.jsx   # Pill components
│   │   └── ProgressRing.jsx    # SVG progress circle
│   ├── pages/                  # Main views
│   │   ├── Dashboard.jsx       # Analytics & summary
│   │   ├── DailyBoard.jsx      # Task Kanban & Table
│   │   ├── ProjectTracker.jsx  # Project list & details
│   │   ├── MonthlyView.jsx     # Calendar grid
│   │   └── YearlyPlanner.jsx   # 12-month heatmap
│   ├── context/
│   │   └── AppContext.jsx      # Global state & reducer
│   └── utils/
│       ├── helpers.js          # Date matching, stats calculations
│       └── storage.js          # LocalStorage wrappers
│
├── index.html                  # HTML entry
├── vite.config.js              # Vite config
└── package.json                # Dependencies
```

---

## 🎨 Design System

Flowra uses a custom, lightweight CSS architecture built natively without heavy frameworks like Tailwind, ensuring clean and maintainable code:

| Token | Description |
|-------|-------------|
| `var(--bg-card)` | Clean white container backgrounds |
| `var(--bg-page)` | Soft, light-themed canvas |
| `var(--blue)` | Primary brand accent connecting the UI |
| `var(--shadow-card)` | Subtle elevation for depth and focus |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add an amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by Ashraful Kabir

**[⬆ Back to Top](#-flowra)**

</div>
