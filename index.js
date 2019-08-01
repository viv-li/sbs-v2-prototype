interact(".image-resize")
  .resizable({
    edges: {
      top: ".resize-top",
      left: ".resize-left",
      bottom: ".resize-bottom",
      right: ".resize-right"
    },

    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: "parent",
        endOnly: true
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 50 },
        max: { width: 800 }
      })
    ],

    inertia: true
  })
  .on("resizemove", function(event) {
    var target = event.target;
    var x = parseFloat(target.getAttribute("data-x")) || 0;
    var y = parseFloat(target.getAttribute("data-y")) || 0;

    // update the element's style
    target.style.width = event.rect.width + "px";

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
      "translate(" + x + "px," + y + "px)";
  });

window.editorFns = {
  onClick: e => {
    for (let el of document.getElementsByClassName("image-resize")) {
      el.classList.remove("selected");
    }
  },
  onKeyDown: e => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Backspace" || key === "Delete") {
      const selectedImage = document.querySelector(".image-resize.selected");
      if (selectedImage !== null) {
        selectedImage.remove();
      }
    }
  },
  onClickImage: e => {
    e.stopPropagation();
    e.target.closest(".image-resize").classList.toggle("selected");
  },
  onKeyDownEditor: e => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Enter") {
      e.preventDefault();
      const $newLine = $(
        `<p
          contenteditable="true"
          onkeydown="window.editorFns.onKeyDownEditor(event)"
          onfocus="window.editorFns.onFocusEditor(event)"
          onblur="window.editorFns.onBlurEditor(event)"
        ></p>`
      );
      $newLine.insertAfter(e.target);
      $newLine.focus();
      return false;
    } else if (key === "Backspace" || key === "Delete") {
      e.stopPropagation();
      if (
        e.target.textContent === "" &&
        !e.target.classList.contains("undeletable")
      ) {
        e.target.previousSibling.focus();
        e.target.remove();
      }
      return false;
    }
    return true;
  },
  onFocusEditor: e => {
    const elWA = document.getElementById("widget-adder");
    const { top, height } = e.target.getBoundingClientRect();

    elWA.style.top = `${top + height / 2}px`;
  },
  onBlurEditor: e => {
    if (e.target.id !== "widget-adder") {
      const elWA = document.getElementById("widget-adder");
      elWA.style.top = `-100px`;
      elWA.classList.remove("show-menu");
    }
  },
  onClickWidgetAdder: e => {
    e.preventDefault();
    const elWA = document.getElementById("widget-adder");
    elWA.classList.toggle("show-menu");
  },
  onClickAddImage: e => {
    e.preventDefault();
  },
  onClickAddSbs: e => {
    e.preventDefault();
  }
};

document.addEventListener("click", window.editorFns.onClick);
document.addEventListener("keydown", window.editorFns.onKeyDown);
