// src/ui/settings/components/ColorPicker.js

export default class ColorPicker {
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
    input.type = "color";
    input.value = this.value;

    input.addEventListener("input", () => {
      this.onChange(input.value);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return wrapper;
  }
}
