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

export function bindValueLabel(id, labelId, transform = v => v) {
    const el = document.getElementById(id);
    const label = document.getElementById(labelId);
    const update = () => label.textContent = transform(el.value);
    el.addEventListener("input", update);
    update();
}
