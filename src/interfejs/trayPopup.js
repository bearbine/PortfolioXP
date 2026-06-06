// Male panele po kliknięciu ikon traya.
// Volume, clock, audit i inne szybkie rzeczy trzymam w jednym komponencie.
import { createElement, createImage } from "../rdzen/dom.js";

// Jeden popup, różna zawartosc. Tak jest prosciej niz tworzyc osobny panel dla kazdej ikonki.
export class OknoZasobnika {
  constructor() {
    this.element = createElement("section", { className: "tray-popup", attrs: { role: "dialog" } });
    this.close = this.close.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  open({ anchor, title, icon, content }) {
    this.close();
    this.element.replaceChildren(
      createElement("div", { className: "tray-popup-naglowek" }, [
        icon ? createImage(icon, "", "tray-popup-ikona") : null,
        createElement("strong", { text: title })
      ]),
      createElement("div", { className: "tray-popup-tresc" }, content)
    );
    document.body.append(this.element);

    const anchorRect = anchor.getBoundingClientRect();
    const popupRect = this.element.getBoundingClientRect();
    const left = Math.min(window.innerWidth - popupRect.width - 8, Math.max(8, anchorRect.right - popupRect.width));
    const top = Math.max(8, anchorRect.top - popupRect.height - 8);
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;

    window.setTimeout(() => {
      document.addEventListener("pointerdown", this.close);
      document.addEventListener("keydown", this.handleKeydown);
    }, 0);
  }

  handleKeydown(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }

  close(event = null) {
    if (event && this.element.contains(event.target)) {
      return;
    }
    this.element.remove();
    document.removeEventListener("pointerdown", this.close);
    document.removeEventListener("keydown", this.handleKeydown);
  }
}
