// src/ui/settings/components/Slider.js

console.log("%c[SLIDER MODULE LOADED]", "color: purple; font-weight: bold;");

export default class Slider {
  constructor(label, value, min, max, step, onChange) {
    this.label = label;
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    this.onChange = onChange;

    console.log("[SLIDER config - in constructor]", this.label, {
      min: this.min,
      max: this.max,
      step: this.step,
      initial: this.value
    });
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

    // --- CRITICAL: prevent panel drag from seeing slider drags ---
    input.addEventListener("pointerdown", e => {
      e.stopPropagation();
      console.log("[SLIDER pointerdown]", this.label, {
        value: input.value,
        clientX: e.clientX
      });
      // DO NOT setPointerCapture — it breaks native slider behavior
    });

    // Log pointer movement for diagnostics only
    input.addEventListener("pointermove", e => {
      if (e.buttons === 1) {
        console.log("[SLIDER pointermove]", this.label, {
          value: input.value,
          clientX: e.clientX
        });
      }
    });

    // Native slider behavior updates value; we just react to it
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      valueEl.textContent = v;
      console.log("[SLIDER input]", this.label, v);
      this.onChange(v);
    });

    input.addEventListener("pointerup", e => {
      console.log("[SLIDER pointerup]", this.label);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    wrapper.appendChild(valueEl);
    return wrapper;
  }
}
