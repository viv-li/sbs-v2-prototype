interact(".resize-editor")
  .resizable({
    edges: {
      top: ".resize-top",
      left: ".resize-left",
      bottom: ".resize-bottom",
      right: ".resize-right"
    },

    modifiers: [
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

interact(".resize-sbs")
  .resizable({
    edges: {
      top: ".resize-top",
      left: ".resize-left",
      bottom: ".resize-bottom",
      right: ".resize-right"
    },

    modifiers: [
      interact.modifiers.restrictSize({
        min: { width: 50 },
        max: { width: 480 }
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
    for (let el of document.getElementsByClassName("image-resizer")) {
      el.classList.remove("selected");
    }
  },
  onKeyDown: e => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Backspace" || key === "Delete") {
      const selectedImage = document.querySelector(".image-resizer.selected");
      if (selectedImage !== null) {
        selectedImage.remove();
      }
    }
  },
  onClickImage: e => {
    e.stopPropagation();
    e.target.closest(".image-resizer").classList.toggle("selected");
  },
  onKeyDownEditor: e => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Enter") {
      e.preventDefault();
      let $newLine;
      if (e.target.tagName === "H1") {
        $newLine = $(
          `<h1
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></h1>`
        );
      } else {
        $newLine = $(
          `<p
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></p>`
        );
      }
      $newLine.insertAfter(e.target);
      $newLine.focus();
      return false;
    } else if (key === "Backspace" || key === "Delete") {
      e.stopPropagation();
      if (
        e.target.textContent === "" &&
        !e.target.classList.contains("undeletable")
      ) {
        try {
          e.target.previousElementSibling.focus();
        } finally {
          e.target.remove();
        }
      }
      return false;
    }
    return true;
  },
  onFocusEditor: e => {
    const elWA = document.getElementById("widget-adder");

    // hide sbs option if in sbs
    if (e.target.closest(".sbs") !== null) {
      elWA.classList.add("hide-sbs");
    } else {
      elWA.classList.remove("hide-sbs");
    }

    // position the widget adder to the focussed line
    const { top, left, height } = e.target.getBoundingClientRect();
    elWA.style.top = `${window.scrollY + top + height / 2}px`;
    elWA.style.left = `${window.scrollX + left - 40}px`;

    window.lastFocussedLine = e.target;
  },
  onBlurEditor: e => {
    if (e.target.id !== "widget-adder") {
      const elWA = document.getElementById("widget-adder");
      elWA.style.top = `-100px`;
      elWA.style.left = `-100px`;
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
    const $imageResizer = $(
      `<div class="image-resizer" onclick="window.editorFns.onClickImage(event)">
        <div class="resize-handle resize-top resize-left"></div>
        <div class="resize-handle resize-top resize-right"></div>
        <div class="resize-handle resize-bottom resize-left"></div>
        <div class="resize-handle resize-bottom resize-right"></div>
      </div>`
    );

    if (window.lastFocussedLine.closest(".sbs") !== null) {
      $imageResizer.addClass("resize-sbs");
    } else {
      $imageResizer.addClass("resize-editor");
    }

    let imageUrl = prompt("Enter image url: ");
    if (imageUrl === null) {
      return;
    }
    var elImg = new Image();
    elImg.onload = function() {
      // Get image width and set the resizer to that width
      const width = elImg.width;
      $imageResizer.style.width = width;
    };
    elImg.src = imageUrl;
    $imageResizer.append(elImg);

    const $newLine = $(
      `<p
        contenteditable="true"
        onkeydown="window.editorFns.onKeyDownEditor(event)"
        onfocus="window.editorFns.onFocusEditor(event)"
        onblur="window.editorFns.onBlurEditor(event)"
      ></p>`
    );
    $imageResizer.insertAfter(window.lastFocussedLine);
    $newLine.insertAfter($imageResizer);
  },
  onClickAddSbs: e => {
    e.preventDefault();
    const $sbs = $(
      `<div class="sbs">
        <div class="sbs-left">
          <h1
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></h1>
          <p
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></p>
        </div>
        <div class="sbs-right">
          <div
            class="image-placeholder"
            onclick="window.editorFns.onClickImagePlaceholder(event)"
          >
            <p><img src="assets/icons/images-monotone.svg" /></p>
            <h4>
              <strike>Drag an image in, or</strike> click to browse images
            </h4>

            <img
              class="delete-button"
              onclick="window.editorFns.onClickDeleteImagePlaceholder(event)"
              src="assets/icons/Delete.svg"
            />
          </div>
          <p
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></p>
        </div>
      </div>`
    );

    const $newLine = $(
      `<p
        contenteditable="true"
        onkeydown="window.editorFns.onKeyDownEditor(event)"
        onfocus="window.editorFns.onFocusEditor(event)"
        onblur="window.editorFns.onBlurEditor(event)"
      ></p>`
    );
    $sbs.insertAfter(window.lastFocussedLine);
    $newLine.insertAfter($sbs);
    $sbs.find("h1").focus();
  },

  onClickImagePlaceholder: e => {
    e.preventDefault();
    const elImagePlaceholder = e.target.closest(".image-placeholder");

    const $imageResizer = $(
      `<div class="image-resizer resize-sbs" onclick="window.editorFns.onClickImage(event)">
        <div class="resize-handle resize-top resize-left"></div>
        <div class="resize-handle resize-top resize-right"></div>
        <div class="resize-handle resize-bottom resize-left"></div>
        <div class="resize-handle resize-bottom resize-right"></div>
      </div>`
    );

    let imageUrl = prompt("Enter image url: ");
    if (imageUrl === null) {
      return;
    }
    var elImg = new Image();
    elImg.src = imageUrl;
    $imageResizer.width("480px");
    $imageResizer.append(elImg);
    $imageResizer.insertAfter(elImagePlaceholder);
    elImagePlaceholder.remove();
  },
  onClickDeleteImagePlaceholder: e => {
    e.preventDefault();
    e.stopPropagation();
    const elImagePlaceholder = e.target.closest(".image-placeholder");
    elImagePlaceholder.remove();
  }
};

document.addEventListener("click", window.editorFns.onClick);
document.addEventListener("keydown", window.editorFns.onKeyDown);
