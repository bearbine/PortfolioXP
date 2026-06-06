// Menu kontekstowe pulpitu.
// Male, ale łatwo je popsuc klikaniem poza elementem, wiec trzymam je osobno.
import { createElement } from "../rdzen/dom.js";

// Context menu jest jedno i tylko podmieniam mu pozycje oraz elementy.
export class ContextMenu {
  constructor() {
    this.element = createElement("div", { className: "context-menu", attrs: { role: "menu" } });
    this.close = this.close.bind(this);
  }

  open({ x, y, items }) {
    this.close();
    this.element.replaceChildren();
    for (const item of items) {
      if (item.separator) {
        this.element.append(createElement("div", { className: "context-menu-separator" }));
        continue;
      }
      const button = createElement("button", { type: "button", className: "context-menu-pozycja", text: item.label, attrs: { role: "menuitem" } });
      button.disabled = Boolean(item.disabled);
      button.addEventListener("click", () => {
        this.close();
        item.action?.();
      });
      this.element.append(button);
    }
    document.body.append(this.element);
    const rect = this.element.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 6);
    const top = Math.min(y, window.innerHeight - rect.height - 6);
    this.element.style.left = `${Math.max(4, left)}px`;
    this.element.style.top = `${Math.max(4, top)}px`;
    window.setTimeout(() => {
      document.addEventListener("pointerdown", this.close, { once: true });
      document.addEventListener("keydown", this.close, { once: true });
    }, 0);
  }

  close() {
    this.element.remove();
    document.removeEventListener("pointerdown", this.close);
    document.removeEventListener("keydown", this.close);
  }
}
