export default class ActionBar {
  constructor(onSettingsClick) {
    this.onSettingsClick = onSettingsClick;
  }

  mount(root) {
    const bar = document.createElement("div");
    bar.className = "action-bar";

    const title = document.createElement("div");
    title.className = "action-title";
    title.textContent = "SoundLab";

    const settingsBtn = document.createElement("button");
    settingsBtn.className = "action-settings-btn";
    settingsBtn.textContent = "⚙️";
    settingsBtn.addEventListener("click", this.onSettingsClick);

    bar.appendChild(title);
    bar.appendChild(settingsBtn);

    root.appendChild(bar);
  }
}
