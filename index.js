interact(".image-resizer")
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

window.editorFns = {
  unselectAllWidgets: () => {
    for (let el of document.getElementsByClassName("image-resizer")) {
      el.classList.remove("selected");
    }
    for (let el of document.getElementsByClassName("sbs")) {
      el.classList.remove("selected");
    }
    window.editorFns.hideDeleteToolbar();
  },
  onClick: e => {
    window.editorFns.unselectAllWidgets();
  },
  onKeyDown: e => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Backspace" || key === "Delete") {
      const selectedWidget = document.querySelector(".selected");
      if (selectedWidget !== null) {
        e.preventDefault();
        selectedWidget.remove();
        window.editorFns.hideDeleteToolbar();
      }
      return false;
    } else if (key === "Enter") {
      const selectedWidget = document.querySelector(".selected");
      if (selectedWidget !== null) {
        e.preventDefault();
        const $newLine = $(
          `<p
              contenteditable="true"
              onkeydown="window.editorFns.onKeyDownEditor(event)"
              onfocus="window.editorFns.onFocusEditor(event)"
              onblur="window.editorFns.onBlurEditor(event)"
            ></p>`
        );
        $newLine.insertAfter(selectedWidget);
        $newLine.focus();
        return false;
      }
    }
    return true;
  },
  onClickImage: e => {
    e.stopPropagation();

    window.editorFns.unselectAllWidgets();

    const elImageWidget = e.target.closest(".image-resizer");
    elImageWidget.classList.toggle("selected");
    if (elImageWidget.classList.contains("selected")) {
      window.editorFns.positionDeleteToolbar(elImageWidget);
    }
  },
  positionDeleteToolbar: elWidget => {
    const elDeleteToolbar = document.getElementById("delete-toolbar");
    const { top, left, width } = elWidget.getBoundingClientRect();
    elDeleteToolbar.style.top = `${window.scrollY + top - 40}px`;
    elDeleteToolbar.style.left = `${window.scrollX + left + width / 2}px`;
  },
  hideDeleteToolbar: () => {
    const elDeleteToolbar = document.getElementById("delete-toolbar");
    elDeleteToolbar.style.top = "-100px";
    elDeleteToolbar.style.left = "-100px";
  },
  onKeyDownEditor: e => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
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
    window.editorFns.unselectAllWidgets();

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

  onClickModalImage: e => {
    if (window.elImagePlaceholder !== null) {
      window.editorFns.addImageToImagePlaceholder(e.target.src);
    } else {
      window.editorFns.addImageToEditor(e.target.src);
    }

    $("#image-gallery-modal").modal("toggle");
  },

  onClickAddImage: e => {
    e.preventDefault();
    window.elImagePlaceholder = null;
    $("#image-gallery-modal").modal();
  },

  addImageToEditor: imageUrl => {
    const $imageResizer = $(
      `<div class="image-resizer">
        <div class="resize-handle resize-top resize-left"></div>
        <div class="resize-handle resize-top resize-right"></div>
        <div class="resize-handle resize-bottom resize-left"></div>
        <div class="resize-handle resize-bottom resize-right"></div>
      </div>`
    );

    var elImg = new Image();
    elImg.onload = function() {
      // Get image width and set the resizer to that width
      const width = elImg.width;
      $imageResizer.width(width);
    };
    elImg.src = imageUrl;
    elImg.addEventListener("click", window.editorFns.onClickImage);
    $imageResizer.append(elImg);
    $imageResizer.insertBefore(window.lastFocussedLine);
  },

  onClickAddSbs: e => {
    e.preventDefault();
    const $sbs = $(
      `<div class="sbs" onclick="window.editorFns.onClickSbs(event)">
        <div class="sbs-selector">
          <div class="gutter">
            <div
              class="swap-columns-button"
              onclick="window.editorFns.onClickSwapColumnsButton(event)">
              <img src="assets/images/swap-columns-button.svg">
            </div>
          </div>
        </div>
        <div class="sbs-left">
          <h2
            class="undeletable"
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></h2>
          <p
            class="undeletable"
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
              Click to browse images
            </h4>

            <img
              class="delete-button"
              onclick="window.editorFns.onClickDeleteImagePlaceholder(event)"
              src="assets/icons/Delete.svg"
            />
          </div>
          <p
            class="undeletable"
            contenteditable="true"
            onkeydown="window.editorFns.onKeyDownEditor(event)"
            onfocus="window.editorFns.onFocusEditor(event)"
            onblur="window.editorFns.onBlurEditor(event)"
          ></p>
        </div>
      </div>`
    );

    $sbs.insertBefore(window.lastFocussedLine);
    $sbs.find("h2").focus();
  },

  onClickImagePlaceholder: e => {
    e.stopPropagation();
    window.elImagePlaceholder = e.target.closest(".image-placeholder");
    $("#image-gallery-modal").modal();
  },

  addImageToImagePlaceholder: imageUrl => {
    const $imageResizer = $(
      `<div class="image-resizer resize-sbs">
        <div class="resize-handle resize-top resize-left"></div>
        <div class="resize-handle resize-top resize-right"></div>
        <div class="resize-handle resize-bottom resize-left"></div>
        <div class="resize-handle resize-bottom resize-right"></div>
      </div>`
    );

    var elImg = new Image();
    elImg.src = imageUrl;
    elImg.addEventListener("click", window.editorFns.onClickImage);
    $imageResizer.width("472px");
    $imageResizer.append(elImg);
    $imageResizer.insertAfter(window.elImagePlaceholder);
    window.elImagePlaceholder.remove();
  },

  onClickDeleteImagePlaceholder: e => {
    e.stopPropagation();
    const elImagePlaceholder = e.target.closest(".image-placeholder");
    elImagePlaceholder.remove();
  },

  onClickSwapColumnsButton: e => {
    e.stopPropagation();
    e.target.closest(".sbs").classList.toggle("reverse");
  },

  onClickSbs: e => {
    e.stopPropagation();

    window.editorFns.unselectAllWidgets();

    if (e.target.contentEditable !== "true") {
      const elSbs = e.target.closest(".sbs");
      elSbs.classList.toggle("selected");

      if (elSbs.classList.contains("selected")) {
        window.editorFns.positionDeleteToolbar(elSbs);
      }
    }
  },

  onClickDeleteToolbar: e => {
    e.stopPropagation();
    const selectedWidget = document.querySelector(".selected");
    if (selectedWidget !== null) {
      selectedWidget.remove();
      window.editorFns.hideDeleteToolbar();
    }
  }
};

document.addEventListener("click", window.editorFns.onClick);
document.addEventListener("keydown", window.editorFns.onKeyDown);
