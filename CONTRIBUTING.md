# Contributing to Jingle Bells Piano Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🎯 Project Overview

Jingle Bells Piano Tracker is a real-time attendance system built with:
- **Frontend:** Vanilla JavaScript + CSS3
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Deployment:** Netlify (with serverless functions)
- **Language:** Thai interface with English comments

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- A Supabase account
- A Netlify account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rollon555/jingle-bells-piano-tracker.git
   cd jingle-bells-piano-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase URL and Anon Key

4. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
jingle-bells-piano-tracker/
├── index.html                 # Main HTML file
├── style.css                  # All styling
├── app.js                     # Main application logic
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── netlify.toml              # Netlify build settings
├── .env.local.example        # Environment template
├── .gitignore                # Git ignore patterns
├── README.md                 # Setup guide
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # This file
├── supabase/
│   └── schema.sql           # Database schema
└── netlify/
    └── functions/
        └── verify-password.js # Password verification
```

## 💻 Development Workflow

### Code Style
- Use **vanilla JavaScript** (no frameworks)
- Add comments in English
- UI text in Thai (ภาษาไทย)
- Consistent indentation (2 spaces)
- Descriptive variable and function names

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Modify HTML in `index.html`
   - Update styles in `style.css`
   - Add logic in `app.js`

3. **Test locally**
   ```bash
   npm run dev
   ```
   - Test on mobile (DevTools: Ctrl+Shift+I → toggle device toolbar)
   - Test on multiple browsers
   - Test with Supabase connected

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
   Use conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation
   - `style:` formatting
   - `refactor:` code improvement
   - `test:` testing

5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing Checklist

Before submitting a PR, ensure:

- [ ] **Mobile Responsive** - Works on 360px+ width
- [ ] **Desktop Responsive** - Works on 1200px+ width
- [ ] **Realtime Updates** - Changes sync across devices
- [ ] **Password Lock** - Unlock/lock works correctly
- [ ] **CRUD Operations**
  - [ ] Create class/student
  - [ ] Read and display data
  - [ ] Update student pass/fail status
  - [ ] Delete class/student
- [ ] **No Console Errors** - F12 → Console shows no errors
- [ ] **Accessibility** - Tab navigation works
- [ ] **Performance** - No memory leaks (DevTools)

## 🔐 Security Guidelines

### Never Do
- ❌ Commit `.env.local` or sensitive credentials
- ❌ Hardcode API keys in JavaScript
- ❌ Commit `node_modules/` or `.netlify/`
- ❌ Expose passwords in comments or code

### Always Do
- ✅ Use environment variables via Netlify or `.env.local`
- ✅ Use Netlify Functions for sensitive operations
- ✅ Validate all user inputs
- ✅ Test with Browser Console open

## 🐛 Bug Reporting

Found a bug? Please:

1. Check if it's already reported in [Issues](https://github.com/Rollon555/jingle-bells-piano-tracker/issues)
2. Create a new issue with:
   - 📱 Device/Browser information
   - 🔍 Steps to reproduce
   - 📸 Screenshots if applicable
   - 💻 Console errors (F12)

## 💡 Feature Requests

Have an idea? Please:

1. Check existing [Issues](https://github.com/Rollon555/jingle-bells-piano-tracker/issues)
2. Create a new issue describing:
   - 🎯 What problem it solves
   - 💭 How you'd like it to work
   - 🎨 Any UI/UX suggestions

## 📚 Key Components

### Frontend (app.js)
- `initializeSupabase()` - Connect to Supabase
- `subscribeToRealtimeUpdates()` - Listen for database changes
- `unlockSystem()` - Verify password and unlock editing
- `saveStudentStatus()` - Update pass/fail in database
- `addStudent()`, `deleteStudent()` - CRUD operations

### Backend (Netlify Function)
- `verify-password.js` - Secure password checking
- Returns `{ valid: true/false }`
- Checks against `ATTENDANCE_PASSWORD` env var

### Database (supabase/schema.sql)
- `classes` table - Class information
- `students` table - Student records with sort_order
- Automatic cascade delete
- Realtime subscriptions enabled

## 🚀 Deployment

### To Production
1. Changes are merged to `main` branch
2. Netlify automatically builds and deploys
3. Changes live at production URL

### Manual Redeploy
```bash
npm run build
netlify deploy --prod
```

## 📖 Documentation

- **README.md** - Setup and usage guide (Thai)
- **CHANGELOG.md** - Version history
- **CONTRIBUTING.md** - This file
- **Code comments** - Explain complex logic

## 🤝 Community

- Be respectful and constructive
- Help others in Issues/PRs
- Share ideas and feedback
- Report bugs clearly

## ❓ Questions?

- Check the [README.md](README.md) troubleshooting section
- Review existing [Issues](https://github.com/Rollon555/jingle-bells-piano-tracker/issues)
- Create a new issue with your question

---

**Happy Contributing! 🎹🔔**
