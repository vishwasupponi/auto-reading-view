# Auto Reading Mode (Obsidian Plugin)

An Obsidian plugin that automatically opens specified notes in **Reading Mode**, while giving you full control over the default view mode for all other notes in your vault.

## ✨ Features

- **Targeted Reading Mode**: Specify notes (like Dashboards, Homepages, MOCs, or reference notes) to automatically open in Reading Mode upon opening.
- **Configurable Mode for Other Notes**: Choose how all other non-targeted notes in your vault should open:
  - **Live Preview** (Default)
  - **Source Mode** (Raw Markdown)
  - **Do Not Change** (Keeps whatever mode the current tab was already in)
- **Interactive Note Autocompletion**: Easily search and add notes from your vault directly within the plugin settings with instant autocompletion.
- **Editing Freedom**: Opening a target page sets Reading Mode once on file open—you can switch to Edit mode (`Ctrl + E`) at any time without the plugin fighting or overriding you while you type.

## 🚀 Installation

### Manual Installation

1. Download the latest release (`main.js` and `manifest.json`).
2. Inside your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a folder named `auto-reading-mode` and place `main.js` and `manifest.json` inside it.
4. In Obsidian, go to **Settings** → **Community plugins**, click **Reload plugins**, and enable **Auto Reading Mode**.

## ⚙️ Settings

- **Mode for Other (Non-Target) Pages**:
  - *Live Preview (Default)*: Ensures standard notes open in Live Preview editing mode.
  - *Source Mode*: Opens other notes in raw markdown source mode.
  - *Do Not Change*: Leaves the active tab mode untouched.
- **Target Reading Mode Pages**:
  - Search and add specific note names or paths that should open in Reading Mode.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Developed by [Vishwas Upponi](https://github.com/vishwasupponi).
