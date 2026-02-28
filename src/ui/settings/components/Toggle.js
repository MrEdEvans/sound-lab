// src/ui/settings/components/Toggle.js

export default class Toggle {
  constructor(label, value, onChange) {
    this.label = label;
    this.value = value;
    this.onChange = onChange;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "settings-field";

    const labelEl = document.createElement("label");
    labelEl.textContent = this.label;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = this.value;

    input.addEventListener("change", () => {
      this.onChange(input.checked);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return wrapper;
  }
}
