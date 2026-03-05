// src/ui/settings/components/Dropdown.js

export default class Dropdown {
  constructor(label, value, options, onChange) {
    this.label = label;
    this.value = value;
    this.options = options;
    this.onChange = onChange;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "settings-field";

    const labelEl = document.createElement("label");
    labelEl.textContent = this.label;

    const select = document.createElement("select");
    this.options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      if (opt === this.value) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      this.onChange(select.value);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    return wrapper;
  }
}
