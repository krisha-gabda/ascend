# Ascend

**Turn your everyday tasks into progress.**

Ascend is a beautiful, modern React Native application built with Expo designed to help you track your tasks, build consistent habits, and visualize your daily progress. 

With a premium dark-mode interface and vibrant, glowing accents, Ascend makes productivity feel rewarding.

## Features ✨

- **Task Management**: Keep track of your daily to-dos. Easily add tasks and mark them as complete.
- **Habit Tracking**: Build better habits with tracking logs. Ascend calculates your current and longest streaks to keep you motivated.
- **Dashboard Overview**: A clean home screen that gives you a quick snapshot of your open tasks and active habits at a glance.
- **Secure Authentication**: Built-in login and signup flows using JWT authentication to keep your data synced and secure.
- **Premium UI**: Carefully crafted dark-mode styling with intuitive UX, custom components, and vibrant contrast.
- **Cross-Platform**: Built with Expo and React Native, delivering a native experience on both iOS and Android.

## Tech Stack 🛠️

- **Frontend**: React Native, Expo (using Expo Router for file-based navigation)
- **Backend**: FastAPI (Python) for robust, high-performance API endpoints
- **Database**: Supabase (PostgreSQL) integrated with SQLAlchemy ORM
- **Styling**: Custom responsive styling (`StyleSheet`)
- **State & Storage**: React Hooks, `@react-native-async-storage/async-storage`
- **Networking**: Fetch API communicating with the FastAPI server

## Getting Started 🚀

### Prerequisites

- Node.js (LTS recommended)
- `npm` or `yarn`
- [Expo Go](https://expo.dev/go) app on your physical device, OR an iOS Simulator / Android Emulator.

### Installation

1. **Navigate to the project folder**:
   ```bash
   cd ascend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   The app connects to a backend API. By default, it looks for an environment variable `EXPO_PUBLIC_API_URL`. 
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=http://your-local-ip:8000
   ```
   *(Note: If testing on a physical device via Expo Go, ensure you use your computer's local network IP address rather than `localhost`)*

4. **Start the development server**:
   ```bash
   npx expo start
   ```

5. **Run the App**:
   - Press `a` in the terminal to open the Android Emulator.
   - Press `i` to open the iOS Simulator.
   - Scan the QR code with the Expo Go app on your physical device to view it live.

## Project Structure 📁

```
ascend/
├── assets/           # App icons, splash screens, and images
├── src/
│   ├── app/          # Expo Router file-based routing
│   │   ├── (tabs)/   # Main app tabs (Home, Tasks, Habits)
│   │   ├── _layout.tsx # Root layout
│   │   ├── index.tsx # Landing screen
│   │   ├── login.tsx # Login screen
│   │   └── signup.tsx# Signup screen
│   └── styles/       # Global styles and color palette (global.ts)
└── app.json          # Expo configuration
```

## Contributing 🤝

Contributions, issues, and feature requests are welcome! Feel free to submit a pull request or open an issue.

## License 📝

This project is licensed under the MIT License.
