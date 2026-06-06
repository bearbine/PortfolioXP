// Prosty Paint jako aplikacja demonstracyjna.
// Nie robi Photoshopa, tylko daje klimat narzędzia z pulpitu.
import { createElement } from "../rdzen/dom.js";

const TOOLS = ["Select", "Pencil", "Brush", "Fill", "Text", "Line", "Rectangle", "Ellipse"];
const COLORS = ["#000000", "#ffffff", "#808080", "#c0c0c0", "#800000", "#ff0000", "#808000", "#ffff00", "#008000", "#00ff00", "#008080", "#00ffff", "#000080", "#0000ff", "#800080", "#ff00ff"];

// Tu renderuje narzędzia, kolory i obszar roboczy. Prosto, ale daje dobry efekt wizualny.
export function renderujPaint() {
  const root = createElement("div", { className: "app app-paint" });
  const menu = createElement("div", { className: "paint-menu" }, ["File", "Edit", "View", "Image", "Colors", "Help"].map((item) => (
    createElement("button", { type: "button", className: "menu-button", text: item })
  )));
  const body = createElement("div", { className: "paint-body" });
  const tools = createElement("div", { className: "paint-tools" }, TOOLS.map((tool, index) => (
    createElement("button", {
      type: "button",
      className: index === 1 ? "paint-tool is-selected" : "paint-tool",
      text: tool.charAt(0),
      title: tool,
      attrs: { "aria-label": tool }
    })
  )));
  const canvasArea = createElement("div", { className: "paint-canvas-wrap" }, [
    createElement("div", { className: "paint-canvas" }, [
      createElement("span", { text: "Paint workspace placeholder" })
    ])
  ]);
  body.append(tools, canvasArea);
  const palette = createElement("div", { className: "paint-palette" }, COLORS.map((color) => (
    createElement("button", {
      type: "button",
      className: "paint-swatch",
      title: color,
      attrs: { "aria-label": `Color ${color}` },
      style: { backgroundColor: color }
    })
  )));
  root.append(menu, body, palette);
  return { element: root };
}
