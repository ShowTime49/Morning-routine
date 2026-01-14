# Morning Routine App 🌅

A beautiful, family-friendly morning routine tracker built with React, TypeScript, and Framer Motion.

## Features

✅ **Configurable Schedule** - Set your own wake-up, critical, and leave times  
✅ **Add/Remove Children** - Manage your family members in the routine  
✅ **Editable Names** - Click on any child's name to customize it  
✅ **Task Tracking** - Track brushing teeth, washing face, and getting dressed  
✅ **Audio Alerts** - Sounds for wake-up, task completion, and critical time  
✅ **Bluetooth Speaker** - Connect external speakers for louder alerts  
✅ **Smooth Clock** - No more flashing on time updates  
✅ **Beautiful UI** - Vibrant colors with hot pink, teal, and cyan accents  

## Color Scheme

- **Primary**: #FF69B4 (Hot Pink)
- **Secondary**: #069494 (Teal)
- **Accent**: #00F0FF (Cyan)
- **Text**: #FFFFFF (White)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to the project directory
cd azure-cassini

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`

## Usage

### Managing Children
1. Click the **Settings** gear icon in the header
2. Scroll to "Add Child" section
3. Enter a name and click "Add"
4. To remove a child, click the trash icon on their card

### Editing Names
- Click directly on any child's name to edit it inline
- Press Enter to save or Escape to cancel

### Configuring Schedule
1. Open Settings
2. Adjust "Wake Up Time", "Critical Time", and "Leave Time"
3. Click "Save Changes"

### Audio Alerts
- Enable/disable sounds in Settings
- Adjust volume with the slider
- Click "Test Sound" to preview

### Bluetooth Speaker
1. Open Settings
2. Click "Connect Speaker"
3. Choose your Bluetooth speaker from the browser dialog
4. Audio alerts will play through the connected speaker

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Web Audio API** - Sound generation
- **Web Bluetooth API** - Speaker connection
- **LocalStorage** - Data persistence

## Project Structure

```
src/
├── components/
│   ├── AnnouncementLog.tsx    # Activity feed
│   ├── ChildTaskCard.tsx      # Child task tracker
│   ├── Clock.tsx              # Smooth clock display
│   ├── InstructionsCard.tsx   # Quick tips
│   ├── PhaseIndicator.tsx     # Phase progress
│   ├── SettingsPanel.tsx      # Settings slide-out
│   └── TaskTimeline.tsx       # Daily schedule
├── context/
│   └── RoutineContext.tsx     # Global state management
├── pages/
│   └── Index.tsx              # Main app page
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx                    # App wrapper
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

## License

MIT

---

Built with ❤️ for busy mornings ☀️
