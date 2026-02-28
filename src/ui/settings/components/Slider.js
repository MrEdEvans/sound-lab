// src/ui/settings/components/Slider.js

export default class Slider {
  constructor(label, value, min, max, step, onChange) {
    this.label = label;
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    this.onChange = onChange;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "settings-field";

    const labelEl = document.createElement("label");
    labelEl.textContent = this.label;

    const input = document.createElement("input");
    input.type = "range";
    input.min = this.min;
    input.max = this.max;
    input.step = this.step;
    input.value = this.value;

    const valueEl = document.createElement("span");
    valueEl.className = "slider-value";
    valueEl.textContent = this.value;

    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      valueEl.textContent = v;
      this.onChange(v);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    wrapper.appendChild(valueEl);
    return wrapper;
  }
}
