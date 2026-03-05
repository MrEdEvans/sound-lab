// src/ui/settings/components/TextInput.js

export default class TextInput {
  constructor(label, value, onChange, placeholder = "") {
    this.label = label;
    this.value = value;
    this.onChange = onChange;
    this.placeholder = placeholder;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "settings-field";

    const labelEl = document.createElement("label");
    labelEl.textContent = this.label;

    const input = document.createElement("input");
    input.type = "text";
    input.value = this.value;
    input.placeholder = this.placeholder;

    input.addEventListener("input", () => {
      this.onChange(input.value);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return wrapper;
  }
}
