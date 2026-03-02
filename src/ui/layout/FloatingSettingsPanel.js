// src/ui/settings/FloatingSettingsPanel.js

import SettingsPanel from "../../ui/settings/SettingsPanel.js";
import { getSettings, updateSetting } from "../../ui/settings/settingsPanelAPI.js";

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

    const settings = getSettings() || {};
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

    document.body.appendChild(backdrop);
    this.backdropEl = backdrop;
  }

  createPanel(sp) {
    const panel = document.createElement("div");
    panel.className = "floating-settings-panel";

    // Header
    const header = document.createElement("div");
    header.className = "floating-settings-header";
    header.textContent = "Settings";

    const closeBtn = document.createElement("button");
    closeBtn.className = "floating-settings-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => this.close());
    header.appendChild(closeBtn);

    // DRAG ONLY FROM HEADER
    header.addEventListener("mousedown", e => this.startDrag(e));

    // --- SCROLL WRAPPER FIX ---------------------------------------
    // Outer container: NOT scrollable
    const contentOuter = document.createElement("div");
    contentOuter.className = "floating-settings-content";

    // Inner container: scrollable
    const contentInner = document.createElement("div");
    contentInner.className = "floating-settings-scroll-inner";

    // Your actual content root goes inside the scroll-inner
    const content = document.createElement("div");
    content.className = "floating-settings-content-root";

    contentInner.appendChild(content);
    contentOuter.appendChild(contentInner);
    // ---------------------------------------------------------------

    // Resize handle
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "floating-settings-resize";
    resizeHandle.addEventListener("mousedown", e => this.startResize(e));

    panel.appendChild(header);
    panel.appendChild(contentOuter);
    panel.appendChild(resizeHandle);

    // Initial position & size
    const { x, y, width, height } = this.getInitialRect(sp);
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.width = `${width}px`;
    panel.style.height = `${height}px`;

    // --- DIAGNOSTICS ----------------------------------------------------
    document.addEventListener("mousedown", e => {
      console.log(
        "%c[DOC mousedown]",
        "color: orange; font-weight: bold;",
        "target:", e.target.tagName,
        "class:", e.target.className
      );
    }, { capture: true });

    document.addEventListener("mousemove", e => {
      if (this.dragging) {
        console.log(
          "%c[DOC mousemove - dragging]",
          "color: red; font-weight: bold;",
          e.clientX, e.clientY
        );
      }
    }, { capture: true });

    header.addEventListener("mousedown", e => {
      console.log(
        "%c[HEADER mousedown]",
        "color: green; font-weight: bold;",
        "target:", e.target.tagName
      );
    });

    content.addEventListener("mousedown", e => {
      console.log(
        "%c[CONTENT mousedown]",
        "color: blue; font-weight: bold;",
        "target:", e.target.tagName
      );
    });
    // --------------------------------------------------------------------

    document.body.appendChild(panel);

    this.panelEl = panel;
    this.panelContentEl = content; // IMPORTANT: this is the actual content root
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

    const rect = this.panelEl.getBoundingClientRect();
    const panelWidth = rect.width;
    const panelHeight = rect.height;

    let x = e.clientX - this.dragOffset.x;
    let y = e.clientY - this.dragOffset.y;

    const minX = -panelWidth + 40;
    const maxX = window.innerWidth - 40;
    const minY = -panelHeight + 40;
    const maxY = window.innerHeight - 40;

    this.panelEl.style.left = `${Math.max(minX, Math.min(x, maxX))}px`;
    this.panelEl.style.top = `${Math.max(minY, Math.min(y, maxY))}px`;
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

    const dx = e.clientX - this.resizeStart.x;
    const dy = e.clientY - this.resizeStart.y;

    let newWidth = this.resizeStart.width + dx;
    let newHeight = this.resizeStart.height + dy;

    const minWidth = 200;
    const minHeight = 150;

    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);

    this.panelEl.style.width = `${newWidth}px`;
    this.panelEl.style.height = `${newHeight}px`;
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
