// src/ui/settings/FloatingSettingsPanel.js

import { getSettings, updateSetting } from "./settingsPanelAPI.js";
import SettingsPanel from "./SettingsPanel.js";

export default class FloatingSettingsPanel {
  constructor(root = document.body) {
    this.root = root;
    this.visible = false;
    this.panelEl = null;
    this.backdropEl = null;
    this.settingsPanel = null;

    this.dragging = false;
    this.resizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.resizeStart = { x: 0, y: 0, width: 0, height: 0 };

    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
  }

  // -------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------

  async open() {
    if (this.visible) return;
    this.visible = true;

    const settings = getSettings();
    const sp = settings.ui.settingsPanel;

    this.createBackdrop(sp.backdrop);
    this.createPanel(sp);

    this.settingsPanel = new SettingsPanel(this.panelContentEl);
    await this.settingsPanel.init();
  }

  close() {
    if (!this.visible) return;
    this.visible = false;

    if (this.settingsPanel) {
      this.settingsPanel.destroy?.();
      this.settingsPanel = null;
    }

    if (this.panelEl) {
      this.panelEl.remove();
      this.panelEl = null;
    }

    if (this.backdropEl) {
      this.backdropEl.remove();
      this.backdropEl = null;
    }

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  toggle() {
    if (this.visible) this.close();
    else this.open();
  }

  // -------------------------------------------------------------
  // DOM creation
  // -------------------------------------------------------------

  createBackdrop(enabled) {
    if (!enabled) return;

    const backdrop = document.createElement("div");
    backdrop.className = "settings-backdrop";
    backdrop.addEventListener("click", () => this.close());

    this.root.appendChild(backdrop);
    this.backdropEl = backdrop;
  }

  createPanel(sp) {
    const panel = document.createElement("div");
    panel.className = "floating-settings-panel";

    const header = document.createElement("div");
    header.className = "floating-settings-header";
    header.textContent = "Settings";

    const closeBtn = document.createElement("button");
    closeBtn.className = "floating-settings-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => this.close());
    header.appendChild(closeBtn);

    header.addEventListener("mousedown", e => this.startDrag(e));

    const content = document.createElement("div");
    content.className = "floating-settings-content";

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "floating-settings-resize";
    resizeHandle.addEventListener("mousedown", e => this.startResize(e));

    panel.appendChild(header);
    panel.appendChild(content);
    panel.appendChild(resizeHandle);

    // Position & size
    const { x, y, width, height } = this.getInitialRect(sp);
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.width = `${width}px`;
    panel.style.height = `${height}px`;

    this.root.appendChild(panel);
    this.panelEl = panel;
    this.panelContentEl = content;
  }

  getInitialRect(sp) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = Math.min(sp.width || 420, vw - 40);
    const height = Math.min(sp.height || 520, vh - 40);

    const x = Math.min(sp.defaultX || 120, vw - width - 20);
    const y = Math.min(sp.defaultY || 80, vh - height - 20);

    return { x: Math.max(20, x), y: Math.max(20, y), width, height };
  }

  // -------------------------------------------------------------
  // Dragging
  // -------------------------------------------------------------

  startDrag(e) {
    e.preventDefault();
    if (!this.panelEl) return;

    this.dragging = true;
    const rect = this.panelEl.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  handleMouseMove(e) {
    if (this.dragging) {
      this.updatePosition(e);
    } else if (this.resizing) {
      this.updateSize(e);
    }
  }

  handleMouseUp() {
    if (this.dragging) {
      this.dragging = false;
      this.persistRect();
    }
    if (this.resizing) {
      this.resizing = false;
      this.persistRect();
    }

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  updatePosition(e) {
    if (!this.panelEl) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = this.panelEl.getBoundingClientRect();

    let x = e.clientX - this.dragOffset.x;
    let y = e.clientY - this.dragOffset.y;

    x = Math.max(0, Math.min(x, vw - rect.width));
    y = Math.max(0, Math.min(y, vh - rect.height));

    this.panelEl.style.left = `${x}px`;
    this.panelEl.style.top = `${y}px`;
  }

  // -------------------------------------------------------------
  // Resizing
  // -------------------------------------------------------------

  startResize(e) {
    e.preventDefault();
    if (!this.panelEl) return;

    this.resizing = true;
    const rect = this.panelEl.getBoundingClientRect();
    this.resizeStart = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    };

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  updateSize(e) {
    if (!this.panelEl) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width = this.resizeStart.width + (e.clientX - this.resizeStart.x);
    let height = this.resizeStart.height + (e.clientY - this.resizeStart.y);

    width = Math.max(260, Math.min(width, vw - 40));
    height = Math.max(260, Math.min(height, vh - 40));

    this.panelEl.style.width = `${width}px`;
    this.panelEl.style.height = `${height}px`;
  }

  // -------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------

  persistRect() {
    if (!this.panelEl) return;

    const rect = this.panelEl.getBoundingClientRect();
    const settings = getSettings();
    const sp = settings.ui.settingsPanel;

    const patch = {
      ui: {
        settingsPanel: {
          defaultX: rect.left,
          defaultY: rect.top,
          width: rect.width,
          height: rect.height
        }
      }
    };

    // Respect rememberPosition / rememberSize flags
    if (!sp.rememberPosition) {
      delete patch.ui.settingsPanel.defaultX;
      delete patch.ui.settingsPanel.defaultY;
    }
    if (!sp.rememberSize) {
      delete patch.ui.settingsPanel.width;
      delete patch.ui.settingsPanel.height;
    }

    updateSetting("ui.settingsPanel", {
      ...sp,
      ...patch.ui.settingsPanel
    });
  }
}
