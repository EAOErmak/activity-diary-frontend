# 📓 Activity Diary

**Your Ultimate Personal Activity & Nutrition Tracker**

Activity Diary is a comprehensive, feature-rich web application designed to help you log, monitor, and analyze your daily activities, food intake, and personal goals. With a focus on data-driven insights and a sleek, modern user interface, it provides everything you need to stay on top of your life.

---

## 🌟 Key Features

### 📅 Activity & Life Logging
- **Diary Entries**: Easily create and manage daily logs of your activities.
- **Entry Templates**: Speed up your logging process with reusable templates for common activities.
- **Calendar Integration**: Visualize your journey through an intuitive calendar interface.

### 🍎 Nutrition & Health
- **Food Tracking**: Log your meals and track nutritional information.
- **Integrated Database**: Access a general food database for quick logging.

### 🎯 Goal Management
- **Progress Tracking**: Set personal goals and monitor your progress over time.
- **Metric Insights**: Link metrics to your entries to see how your activities impact your goals.

### 📊 Advanced Analytics
- **Interactive Dashboards**: Gain deep insights through beautiful, interactive charts and data visualizations.
- **Comprehensive Statistics**: Analyze trends in your activity, nutrition, and goal achievement.

### 🛡️ Powerful Admin Panel
- **User Management**: Full control over user accounts and permissions.
- **System Configuration**: Manage tags, food databases, and metric links.
- **Database Utilities**: Direct access to system-level database management.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Echarts](https://echarts.apache.org/) & [Recharts](https://recharts.org/)
- **3D Graphics**: [Three.js](https://threejs.org/) ([React Three Fiber](https://github.com/pmndrs/react-three-fiber))
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **i18n**: [i18next](https://www.i18next.com/)

---

## 🔗 Repositories

- **Frontend Repository**: [activity-diary-frontend](https://github.com/EAOErmak/activity-diary-frontend)
- **Desktop Repository**: [activity-diary-desktop](https://github.com/EAOErmak/activity-diary-desktop) (For building the desktop version of the application)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd activity-diary-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `VITE_API_BASE_URL`.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
src/
├── api/            # API services and configurations
├── features/       # Core modules (auth, diary, dashboard, admin, etc.)
├── shared/         # Reusable components, hooks, and utilities
├── pages/          # Top-level page components
├── providers/      # React Context providers (Theme, Query, i18n)
├── router/         # Routing logic
├── assets/         # Static assets
└── platform/       # Platform-specific configurations
```

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Created with ❤️ for personal growth and productivity.*

