// Male helpery do DOM.
// Projekt duzo renderuje ręcznie, wiec takie funkcje oszczedzaja powtarzania tego samego kodu.
// Najczesciej używany helper. Tworzy element, ustawia klasy, atrybuty i dzieci.
export function createElement(tagName, options = {}, children = []) {
  const element = document.createElement(tagName);

  if (options.className) {
    const classes = Array.isArray(options.className) ? options.className : [options.className];
    element.className = classes.filter(Boolean).join(" ");
  }

  if (options.text !== undefined && options.text !== null) {
    element.textContent = String(options.text);
  }

  if (options.title) {
    element.title = options.title;
  }

  if (options.type) {
    element.setAttribute("type", options.type);
  }

  if (options.value !== undefined) {
    element.value = options.value;
  }

  if (options.checked !== undefined) {
    element.checked = Boolean(options.checked);
  }

  if (options.src) {
    element.setAttribute("src", options.src);
  }

  if (options.alt !== undefined) {
    element.setAttribute("alt", options.alt);
  }

  if (options.attrs) {
    for (const [name, value] of Object.entries(options.attrs)) {
      if (value !== undefined && value !== null && value !== false) {
        element.setAttribute(name, String(value));
      }
    }
  }

  if (options.dataset) {
    for (const [name, value] of Object.entries(options.dataset)) {
      if (value !== undefined && value !== null) {
        element.dataset[name] = String(value);
      }
    }
  }

  if (options.style) {
    Object.assign(element.style, options.style);
  }

  appendChildren(element, children);
  return element;
}

export function appendChildren(parent, children = []) {
  const normalized = Array.isArray(children) ? children : [children];
  for (const child of normalized) {
    if (child === undefined || child === null || child === false) {
      continue;
    }
    if (typeof child === "string" || typeof child === "number") {
      parent.append(document.createTextNode(String(child)));
      continue;
    }
    parent.append(child);
  }
  return parent;
}

export function clearNode(node) {
  node.replaceChildren();
}

export function createImage(src, alt = "", className = "") {
  const image = createElement("img", { src, alt, className });
  image.addEventListener("error", () => {
    image.classList.add("is-missing-asset");
    image.removeAttribute("src");
  }, { once: true });
  return image;
}

// Button wrapper, bo przyciski w tym projekcie maja ciagle powtarzalne opcje.
export function createButton(label, className, onClick, attrs = {}) {
  const button = createElement("button", {
    type: "button",
    className,
    attrs,
    text: label
  });
  if (onClick) {
    button.addEventListener("click", onClick);
  }
  return button;
}

export function listen(target, eventName, handler, options) {
  target.addEventListener(eventName, handler, options);
  return () => target.removeEventListener(eventName, handler, options);
}

export function setPressed(element, isPressed) {
  element.setAttribute("aria-pressed", String(Boolean(isPressed)));
}

export function isInteractiveElement(target) {
  return Boolean(target.closest("button, input, textarea, select, a, [role='button']"));
}
