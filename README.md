# ♟️ Game Review Automator

> A modern, lightweight browser extension that bridges **Chess.com** and **Lichess.org** — export and analyze your finished games using Lichess's free Stockfish engine in a single click.

Instead of manually copying PGN text, opening a new tab, and pasting it into Lichess, this extension automates the entire process silently in the background.

---

## ✨ Features

| Feature                  | Description                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| **One-Click Analysis**   | Injects an unobtrusive "Analyze on Lichess" button directly into Chess.com game pages       |
| **Invisible Extraction** | Fetches PGN directly from Chess.com's internal API — no pop-ups or screen flashes           |
| **Automatic Import**     | Sends PGN to the Lichess Import API and opens the analysis board in a new tab               |
| **Modern Architecture**  | Built with strict TypeScript, bundled with esbuild, fully compliant with Chrome Manifest V3 |

---

## 📖 How to Use

1. Navigate to any **finished game** or archive on Chess.com.
2. Look for the floating green **"Analyze on Lichess"** button in the bottom-right corner.
3. Click the button.
4. The button briefly shows **"Exporting..."**, then a new tab opens with your game fully loaded into the Lichess analysis board.

---

## 🚀 Installation

### End Users — Manual Installation

> This extension is not yet published on the Chrome Web Store. Install it manually via Developer Mode:

1. **Download** the latest release `.zip` from the [Releases page](#).
2. **Extract** the ZIP file to a folder on your computer.
3. Open your Chromium-based browser and navigate to the Extensions page:
   - **Chrome / Brave:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
4. Enable **"Developer mode"** (toggle in the top-right corner).
5. Click **"Load unpacked"** in the top-left corner.
6. Select the folder containing `manifest.json`.

---

## 🛠️ For Developers

### Building from Source

Ensure you have **Node.js** installed, then run:

```bash
# Clone the repository
git clone https://github.com/yourusername/game-review-automator.git
cd game-review-automator

# Install dependencies
npm install

# Build the extension
npm run build
```

The compiled, ready-to-load extension files are output into the `dist/` folder.

---

### Architecture

The extension follows a clean separation of concerns using **Manifest V3**:

```
src/
├── index.ts        # Content Script  — UI, button injection, user workflow
├── extractor.ts    # The Brain       — Parses game ID, queries Chess.com APIs, retrieves PGN
├── api.ts          # The Bridge      — Communicates with the background worker (bypasses CORS)
├── background.ts   # The Worker      — Makes secure cross-origin POST requests to Lichess API
└── logger.ts       # Utility         — Logging class; strips debug logs in production builds
```

---

### Development & Debugging

Because heavy lifting is delegated to a **background service worker**, content-script logs alone won't tell the full story.

**To view full debug logs:**

1. Open `chrome://extensions/` in your browser.
2. Find **Game Review Automator** and click the **service worker** (or _Background page_) link.
3. A dedicated DevTools window will open for the background script.
4. In the Console tab, set the **"Log levels"** filter to include **Verbose** or **All logs**.
5. Reload a Chess.com game page and click the analyze button to trace execution.

---

## 🛡️ Security & Privacy

- **No Data Exfiltration** — Game data is sent _only_ to Lichess.org for analysis. Nothing else.
- **Zero Tracking** — No browsing history, credentials, or telemetry are captured or shared.
- **Modern Security** — Built on Chrome's Manifest V3 architecture, which heavily restricts unauthorized code execution.

---

## 📝 License

Distributed under the **MIT License**. See the [`LICENSE`](./LICENSE) file for more information.
