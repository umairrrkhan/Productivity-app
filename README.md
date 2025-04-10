#  Productivity Tracker App - Beginner's Guide

![App Preview](https://via.placeholder.com/1200x400?text=Clean+Modern+Interface+with+Progress+Tracking)

##  Table of Contents
1. [Getting Started](#-getting-started)
2. [Feature Walkthrough](#-feature-walkthrough)
3. [Firebase Setup](#-firebase-setup)
4. [Daily Usage](#-daily-usage)
5. [Troubleshooting](#-troubleshooting)
6. [Contributing](#-contributing)
7. [License](#-license)

##  Getting Started

### System Requirements
- Node.js 16+ 
- Android/iOS device or emulator
- Firebase account (free tier)

### Installation Guide
```bash
# 1. Clone repository
npx --yes degit user/repo productivity-tracker

# 2. Navigate to project directory
cd productivity-tracker

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start development server
npm run android  # For Android
npm run ios      # For iOS (requires macOS)
```

##  Feature Walkthrough

### Streak Management
- **Creating Streaks**: Tap ➕ > Select type > Set daily reminder
- **Tracking Progress**: Visual calendar with color-coded days
- **Achievement System**: Badges for milestones (7/30/90 days)

![Streak Creation Flow](https://via.placeholder.com/600x400?text=Step-by-Step+Creation+Process)

##  Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add Project" > Follow setup wizard

2. **Enable Services**:
   - Authentication > Email/Password sign-in
   - Firestore Database > Start in test mode
   - Storage > Start in test mode

3. **Configure App**:
   Create `src/config/firebase.js` with:
```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
```

##  Daily Usage

### Basic Operations
1. **Mark Daily Completion**: Tap calendar date
2. **View Statistics**: Swipe to analytics dashboard
3. **Share Progress**: Export streak history as PNG/PDF

### Advanced Features
- Custom streak types (Nofap/Virgin/Exercise)
- Data export functionality
- Cross-device sync

## 🛠 Troubleshooting

### Common Issues
| Symptom | Solution |
|---------|----------|
| App won't start | Run `npm cache clean --force` |
| Firebase errors | Verify config values match console |
| Missing modules | Reinstall dependencies with `npm ci` |

##  Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open Pull Request
