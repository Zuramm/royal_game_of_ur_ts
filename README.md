# The Royal Game of Ur

A 3D implementation of The Royal Game of Ur using Three.js and TypeScript. This ancient board game, dating back to 2600 BCE, is brought to life with modern web technologies and beautiful 3D graphics.

![Game of Ur](https://img.shields.io/badge/Game-Ancient%20Board%20Game-blue)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Graphics-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Typed%20JavaScript-blue)

## 🎮 About The Royal Game of Ur

The Royal Game of Ur is one of the oldest known board games, discovered in the ancient city of Ur (modern-day Iraq). It was played by the Sumerians and later by the Babylonians. The game involves strategy, luck, and tactical thinking as players race their pieces around a distinctive board with special squares.

## ✨ Features

-   **3D Graphics**: Beautiful Three.js-powered 3D rendering
-   **Interactive Gameplay**: Click to move pieces and execute moves
-   **Visual Path Indicators**: See possible moves highlighted in real-time
-   **Responsive Design**: Works on desktop and mobile devices
-   **Modern Web Technologies**: Built with TypeScript and Webpack
-   **Authentic Game Rules**: Faithful implementation of the ancient game

## 🚀 Getting Started

### Prerequisites

-   Node.js (version 14 or higher)
-   npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/philippwalter/game-of-ur.git
cd game-of-ur
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

To create a production build:

```bash
npm run build
```

## 🎯 How to Play

### Game Rules

1. **Objective**: Be the first player to move all 7 pieces from start to finish
2. **Movement**: Roll dice to determine how many spaces to move
    ```
    ┌───┬───┬───┬───┐       ┌───┬───┐
    │ ⁕ │   │   │   │       │ ⁕ │   │
    ├───┼───┼───┼───┼───┬───┼───┼───┤
    │ ╭───────────────────────────╮ │
    ├ │ ┼───┼───┼───┼───┴───┼───┼ │ ┤
    │ ╰───────────────X    ←──────╯ │
    └───┴───┴───┴───┘       └───┴───┘
    ```
3. **Special Squares**:
    - **Rosette squares** (marked with stars): Safe zones where pieces cannot be captured
        ```
        ┌───┬───┬───┬───┐       ┌───┬───┐
        │ ⁕ │   │   │   │       │ ⁕ │   │
        ├───┼───┼───┼───┼───┬-──┼───┼───┤
        │   │   │   │ ⁕ │   │   │   │   │
        ├───┼───┼───┼───┼───┴───┼───┼───┤
        │ ⁕ │   │   │   │       │ ⁕ │   │
        └───┴───┴───┴───┘       └───┴───┘
        ```
    - **Combat zone**: Pieces can capture opponents by landing on the same square
        ```
        ┌───┬───┬───┬───┐       ┌───┬───┐
        │ ⁕ │   │   │   │       │ ⁕ │   │
        ├───┼───┼───┼───┼───┬-──┼───┼───┤
        │ ⚔ │ ⚔ │ ⚔ │ ⚔ │ ⚔ │ ⚔ │ ⚔ │ ⚔ │
        ├───┼───┼───┼───┼───┴───┼───┼───┤
        │ ⁕ │   │   │   │       │ ⁕ │   │
        └───┴───┴───┴───┘       └───┴───┘
        ```
4. **Winning**: Get all 7 pieces safely to the end of the board

## 🛠️ Technology Stack

-   **Three.js**: 3D graphics and rendering
-   **TypeScript**: Type-safe JavaScript development
-   **Webpack**: Module bundling and development server

## 📁 Project Structure

```
game-of-ur/
├── src/
│   ├── Game.ts              # Core game logic and rules
│   ├── GameRenderer.ts      # 3D rendering and visualization
│   ├── generateMovePath.ts  # Path generation for moves
│   ├── index.ts             # Main application entry point
│   └── index.html           # HTML template
├── public/
│   ├── models/              # 3D models (GLB files)
│   └── style.css            # Styling
└── package.json             # Project configuration
```

## 📚 Learn More

-   [Wikipedia: Royal Game of Ur](https://en.wikipedia.org/wiki/Royal_Game_of_Ur)
-   [British Museum: The Royal Game of Ur](https://www.britishmuseum.org/collection/object/W_1928-1009-378)
-   [Three.js Documentation](https://threejs.org/docs/)

---

**Enjoy playing one of humanity's oldest board games in a modern 3D environment!** 🎲
