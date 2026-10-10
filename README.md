# Auto Reading View

[![Latest Release](https://img.shields.io/github/v/release/vishwasupponi/auto-reading-view?color=3b82f6&label=Version)](https://github.com/vishwasupponi/auto-reading-view/releases/latest)
[![Obsidian](https://img.shields.io/badge/Obsidian-v1.13.0%2B-7C3AED.svg)](https://obsidian.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)

> [!NOTE]
> **Safe & Non-Destructive**: This plugin operates strictly at the UI view level. It **never modifies, edits, alters, or writes to any files or notes** in your vault.

An Obsidian plugin that automatically opens specified notes in **Reading View**, while giving you full control over the default view mode for all other notes in your vault.

---

## ✨ Features

- **Targeted Reading View**: Specify notes (such as Dashboards, Homepages, MOCs, or reference notes) to automatically open in Reading View upon opening.
- **Configurable Mode for Other Notes**: Choose how all other non-targeted notes in your vault should open:
  - **Live Preview** (Default)
  - **Source Mode** (Raw Markdown)
  - **Do Not Change** (Preserves whatever mode the active tab was already in)
- **Interactive Note Autocompletion**: Add target notes easily within the settings tab using native fuzzy search over your vault.
- **Editing Freedom**: Opening a target note sets Reading View once on open. You can switch to editing mode (`Ctrl+E` / `Cmd+E`) at any time without the plugin overriding your choice while you type.

---

## 🚀 Installation

### From Obsidian Community Plugins *(Recommended)*
1. In Obsidian, navigate to **Settings** → **Community plugins**.
2. Turn off **Restricted mode** if prompted.
3. Click **Browse** and search for **Auto Reading View**.
4. Click **Install**, then click **Enable**.

### Manual Installation
1. Download `main.js` and `manifest.json` from the [Latest Release](https://github.com/vishwasupponi/auto-reading-view/releases/latest).
2. Inside your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a folder named `auto-reading-view` and copy `main.js` and `manifest.json` into it.
4. Go to **Settings** → **Community plugins**, click **Reload plugins**, and enable **Auto Reading View**.

---

## ⚡ Quick Start

1. Go to **Settings** → **Auto Reading View**.
2. Under **Target pages**, click **Add page** and select a note (e.g., `Dashboard.md` or `Homepage.md`).
3. Open the note—it automatically opens in **Reading View**.
4. Open any other note to confirm it opens in your preferred default editing mode (e.g., **Live Preview**).

---

## ⚙️ Settings

- **Default view mode for other notes**:
  - *Live preview (default)*: Automatically opens regular notes in Live Preview editing mode.
  - *Source mode (raw markdown)*: Opens other notes in raw Markdown editing mode.
  - *Do not change (leave tab mode as-is)*: Leaves the existing tab view mode unaltered.
- **Target pages**:
  - Click **Add page** to search and select notes in your vault that should open in Reading View.
  - Reorder notes using drag handles, or delete entries at any time.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Developed by [Vishwas Upponi](https://github.com/vishwasupponi).
