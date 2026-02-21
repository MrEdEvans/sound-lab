/* ---------------------------
   UI HELPERS (pure utilities)
---------------------------- */

console.log("ui-helpers.js loaded");

export function val(id) {
    return document.getElementById(id).value;
}

export function checked(id) {
    return document.getElementById(id).checked;
}

export function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

export function setChecked(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
}

export function bindValueLabel(id, labelId, transform = v => v) {
    const el = document.getElementById(id);
    const label = document.getElementById(labelId);
    const update = () => label.textContent = transform(el.value);
    el.addEventListener("input", update);
    update();
}
