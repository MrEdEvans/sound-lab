import { getSettings, updateSetting } from "../settings/settingsPanelAPI.js";
import SettingsPanel from "../settings/SettingsPanel.js";

export default class FloatingSettingsPanel {
  constructor(root = document.body) {
    this.root = root;
    this.visible = false;

    this.panelEl = null;
    this.backdropEl = null;
    this.contentEl = null;

    this.dragging = false;
    this.resizing = false;

    this.dragOffset = { x: 0, y: 0 };
    this.resizeStart = { x: 0, y: 0, width: 0, height: 0 };

    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
  }

  toggle() {
    this.visible ? this.close() : this.open();
  }

  open() {
    if (this.visible) return;
    this.visible = true;

    const settings = getSettings();
    const sp = settings.ui.settingsPanel;

    if (sp.backdrop) this.createBackdrop();
    this.createPanel(sp);

    const settingsPanel = new SettingsPanel(this.contentEl);
    settingsPanel.init();
  }

  close() {
    if (!this.visible) return;
    this.visible = false;

    if (this.panelEl) this.panelEl.remove();
    if (this.backdropEl) this.backdropEl.remove();

    this.panelEl = null;
    this.backdropEl = null;

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  createBackdrop() {
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

    const { x, y, width, height } = this.restoreRect(sp);
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.width = `${width}px`;
    panel.style.height = `${height}px`;

    this.root.appendChild(panel);

    this.panelEl = panel;
    this.contentEl = content;
  }

  restoreRect(sp) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = Math.min(sp.width || 420, vw - 40);
    const height = Math.min(sp.height || 520, vh - 40);

    const x = Math.min(sp.defaultX || 120, vw - width - 20);
    const y = Math.min(sp.defaultY || 80, vh - height - 20);

    return {
      x: Math.max(20, x),
      y: Math.max(20, y),
      width,
      height
    };
  }

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

  handleMouseMove(e) {
    if (this.dragging) this.updatePosition(e);
    else if (this.resizing) this.updateSize(e);
  }

  handleMouseUp() {
    if (this.dragging || this.resizing) {
      this.persistRect();
    }

    this.dragging = false;
    this.resizing = false;

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  updatePosition(e) {
    const rect = this.panelEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = e.clientX - this.dragOffset.x;
    let y = e.clientY - this.dragOffset.y;

    x = Math.max(0, Math.min(x, vw - rect.width));
    y = Math.max(0, Math.min(y, vh - rect.height));

    this.panelEl.style.left = `${x}px`;
    this.panelEl.style.top = `${y}px`;
  }

  updateSize(e) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width = this.resizeStart.width + (e.clientX - this.resizeStart.x);
    let height = this.resizeStart.height + (e.clientY - this.resizeStart.y);

    width = Math.max(260, Math.min(width, vw - 40));
    height = Math.max(260, Math.min(height, vh - 40));

    this.panelEl.style.width = `${width}px`;
    this.panelEl.style.height = `${height}px`;
  }

  persistRect() {
    const rect = this.panelEl.getBoundingClientRect();
    const settings = getSettings();
    const sp = settings.ui.settingsPanel;

    const patch = {
      defaultX: rect.left,
      defaultY: rect.top,
      width: rect.width,
      height: rect.height
    };

    if (!sp.rememberPosition) {
      delete patch.defaultX;
      delete patch.defaultY;
    }

    if (!sp.rememberSize) {
      delete patch.width;
      delete patch.height;
    }

    updateSetting("ui.settingsPanel", { ...sp, ...patch });
  }
}
