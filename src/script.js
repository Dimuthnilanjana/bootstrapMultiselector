document.addEventListener("DOMContentLoaded", () => {
  const categoryToggle = document.getElementById("categoryToggle");
  const megaMenu = document.getElementById("megaMenu");
  const bookmarkMenu = document.getElementById("bookmarkMenu");
  const bookmarkToggle = document.getElementById("bookmarkToggle");

  // Hover delay settings
  const HOVER_DELAY = 150;
  let hoverTimeouts = new Map();
  let lastActiveItems = new Map();

  // Toggle Mega Menu
  const toggleMenu = (menu) => menu.classList.toggle("show");

  categoryToggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu(megaMenu);
    if (megaMenu.classList.contains("show")) {
      loadInitialSelection();
    }
  });
  bookmarkToggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu(bookmarkMenu);
    if (bookmarkMenu.classList.contains("show")) {
      loadInitialSelection();
    }
  });

  // Close mega menu and booksmark when clicking outside
  document.addEventListener("click", (e) => {
    if (!categoryToggle.contains(e.target) && !megaMenu.contains(e.target)) {
      megaMenu.classList.remove("show");
    }
    if (!bookmarkToggle.contains(e.target) && !bookmarkMenu.contains(e.target)) {
      bookmarkMenu.classList.remove("show");
    }
  });

  // Hover effect with delay and hover intent
  const addHoverEffect = (selector, listClass, nextLevelSelector) => {
    document.querySelectorAll(selector).forEach((item) => {
      let isHovering = false;

      item.addEventListener("mouseenter", () => {
        isHovering = true;

        if (bookmarkHoverTimeouts.has(item)) {
          clearTimeout(bookmarkHoverTimeouts.get(item));
        }

        const timeoutId = setTimeout(() => {
          if (!isHovering) return;

          // Remove active class from siblings
          document.querySelectorAll(selector).forEach((el) => {
            el.classList.remove("active");
          });

          item.classList.add("active");
          lastActiveItems.set(selector, item);

          // Show corresponding submenu
          document.querySelectorAll(listClass).forEach((el) => {
            el.style.display = "none";
          });

          const targetList = document.getElementById(item.dataset.target);
          if (targetList) {
            targetList.style.display = "block";

            // Auto-select first child if no active item
            const firstChild = targetList.querySelector(nextLevelSelector);
            if (firstChild && !targetList.querySelector(`${nextLevelSelector}.active`)) {
              firstChild.classList.add("active");
              firstChild.dispatchEvent(new Event("mouseenter"));
            }
          }
        }, HOVER_DELAY);

        bookmarkHoverTimeouts.set(item, timeoutId);
      });

      item.addEventListener("mouseleave", () => {
        isHovering = false;
        if (bookmarkHoverTimeouts.has(item)) {
          clearTimeout(bookmarkHoverTimeouts.get(item));
          bookmarkHoverTimeouts.delete(item);
        }
      });
    });
  };

  // Hover tolerance function (prevents unintentional hiding)
  const addHoverTolerance = (menuElement, toleranceArea = 20) => {
    let isInToleranceArea = false;

    document.addEventListener("mousemove", (e) => {
      const rect = menuElement.getBoundingClientRect();
      isInToleranceArea =
        e.clientX >= rect.left - toleranceArea &&
        e.clientX <= rect.right + toleranceArea &&
        e.clientY >= rect.top - toleranceArea &&
        e.clientY <= rect.bottom + toleranceArea;

      if (!isInToleranceArea) {
        setTimeout(() => {
          if (!isInToleranceArea) {
            menuElement.querySelectorAll(".active").forEach((item) => item.classList.remove("active"));
          }
        }, HOVER_DELAY);
      }
    });
  };

  // Load initial selection when opening the menu
  const loadInitialSelection = () => {
    const firstDepartment = document.querySelector(".department-item");
    if (firstDepartment) {
      firstDepartment.classList.add("active");
      firstDepartment.dispatchEvent(new Event("mouseenter"));

      const firstCategory = document.querySelector(".category-list .category-item");
      if (firstCategory) {
        firstCategory.classList.add("active");
        firstCategory.dispatchEvent(new Event("mouseenter"));

        const firstSubcategory = document.querySelector(".subcategory-list .subcategory-item");
        if (firstSubcategory) {
          firstSubcategory.classList.add("active");
          firstSubcategory.dispatchEvent(new Event("mouseenter"));

          const firstItem = document.querySelector(".item-list .item");
          if (firstItem) {
            firstItem.classList.add("active");
          }
        }
      }
    }
  };

  // Apply hover effects to different levels
  addHoverEffect(".department-item", ".category-list", ".category-item");
  addHoverEffect(".category-item", ".subcategory-list", ".subcategory-item");
  addHoverEffect(".subcategory-item", ".item-list", ".item");
  addHoverEffect(".item", "", "");

  // Add hover tolerance to prevent accidental closings
  addHoverTolerance(megaMenu);

  ///////////////////////////////////////////////////////////////////////// Bookmark page

  const bookmarkItems = document.querySelectorAll(".bookmark-list .bookmark-item");
  const bookmarkCategories = document.querySelectorAll(".bookmarkcategory-list");

  let bookmarkHoverTimeouts = new Map();
  let lastActiveItem = null;

  function showCategory(targetId) {
    bookmarkCategories.forEach((category) => category.classList.remove("active"));
    const targetCategory = document.getElementById(targetId);
    if (targetCategory) {
      targetCategory.classList.add("active");
    } else {
      console.warn("No category found with ID:", targetId);
    }
  }

  function setDefaultSelection() {
    if (bookmarkItems.length > 0) {
      const firstItem = bookmarkItems[0];
      firstItem.classList.add("active");
      lastActiveItem = firstItem;

      const target = firstItem.getAttribute("data-target");
      console.log("Setting default active category:", target);
      showCategory(target);
    } else {
      console.error("No bookmark items found.");
    }
  }

  bookmarkItems.forEach((item) => {
    let isHovering = false;

    item.addEventListener("mouseenter", function () {
      isHovering = true;
      if (bookmarkHoverTimeouts.has(item)) {
        clearTimeout(bookmarkHoverTimeouts.get(item));
      }

      const target = this.getAttribute("data-target");

      const timeoutId = setTimeout(() => {
        if (!isHovering) return;

        bookmarkItems.forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        lastActiveItem = item;

        showCategory(target);
      }, 150); // Adjust delay if needed

      bookmarkHoverTimeouts.set(item, timeoutId);
    });

    item.addEventListener("mouseleave", function () {
      isHovering = false;
      if (bookmarkHoverTimeouts.has(item)) {
        clearTimeout(bookmarkHoverTimeouts.get(item));
        bookmarkHoverTimeouts.delete(item);
      }
    });

    item.addEventListener("click", function () {
      bookmarkItems.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
      lastActiveItem = this;

      const target = this.getAttribute("data-target");
      showCategory(target);
    });
  });

  bookmarkCategories.forEach((category) => {
    category.addEventListener("mouseenter", function () {
      if (bookmarkHoverTimeouts.has(lastActiveItem)) {
        clearTimeout(bookmarkHoverTimeouts.get(lastActiveItem));
      }
    });


  });

  // Set default selection on page load
  setDefaultSelection();



});

// breadcrumb js
document.querySelectorAll(".change-iphone-breadcrumb").forEach(item => {
  item.addEventListener("click", function (event) {
    event.preventDefault(); 

    let newBreadcrumb = this.getAttribute("data-breadcrumb");
  //   iphone breadcrumb txt changes
    document.getElementById("active-iphone-breadcrumb").textContent = newBreadcrumb;
    document.getElementById("breadcrumb-title").textContent = newBreadcrumb;
  });
});


///multiselector js
// document.addEventListener("DOMContentLoaded", function () {
//   const originalSelect = document.getElementById("originalSelect");
//   const selectButton = document.getElementById("selectButton");
//   const dropdown = document.querySelector(".custom-select-dropdown");
//   const optionsContainer = document.querySelector(".select-options");
//   const selectAllCheckbox = document.getElementById("selectAll");

//   // Function to truncate text
//   function truncateText(text, length = 15) {
//     return text.length > length ? text.substring(0, length) + "..." : text;
//   }

//   // Create checkbox options dynamically
//   originalSelect.querySelectorAll("option").forEach((option) => {
//     const div = document.createElement("div");
//     div.className = "select-option";

//     const truncatedText = truncateText(option.textContent);

//     div.innerHTML = `
//       <input class="form-check-input option-checkbox" type="checkbox" value="${option.value}" id="option${option.value}">
//       <label class="form-check-label" for="option${option.value}" title="${option.textContent}">${truncatedText}</label>
//     `;
//     optionsContainer.appendChild(div);
//   });

//   // Function to toggle dropdown
//   selectButton.addEventListener("click", (e) => {
//     dropdown.classList.toggle("show");
//     e.stopPropagation();
//   });

//   // Close dropdown when clicking outside
//   document.addEventListener("click", (e) => {
//     if (!dropdown.contains(e.target) && e.target !== selectButton) {
//       dropdown.classList.remove("show");
//     }
//   });

//   // Select all functionality
//   selectAllCheckbox.addEventListener("change", () => {
//     const isChecked = selectAllCheckbox.checked;
//     document.querySelectorAll(".option-checkbox").forEach((checkbox) => {
//       checkbox.checked = isChecked;
//     });
//     updateSelectedDisplay();
//     updateOriginalSelect();
//   });

//   // Add event listeners to checkboxes
//   const checkboxes = document.querySelectorAll(".option-checkbox");
//   checkboxes.forEach((checkbox) => {
//     checkbox.addEventListener("change", () => {
//       updateSelectAllCheckbox();
//       updateSelectedDisplay();
//       updateOriginalSelect();
//     });
//   });

//   // Prevent dropdown from closing when clicking inside
//   dropdown.addEventListener("click", (e) => {
//     e.stopPropagation();
//   });

//   // Update "Select All" checkbox state
//   function updateSelectAllCheckbox() {
//     const totalCheckboxes = checkboxes.length;
//     const checkedCheckboxes = Array.from(checkboxes).filter((cb) => cb.checked).length;
//     selectAllCheckbox.checked = totalCheckboxes === checkedCheckboxes;
//   }

//   // Update button display with selected items as chips
//   function updateSelectedDisplay() {
//     const selectedCheckboxes = Array.from(document.querySelectorAll(".option-checkbox:checked"));
//     const count = selectedCheckboxes.length;

//     // Clear previous content inside the button
//     selectButton.innerHTML = "";

//     if (count === 0) {
//       selectButton.innerHTML = `<span class="select-button-text">Select Options</span>`;
//     } else {
//       // Show only first 3 chips, then add a "+X" if there are more
//       const maxVisibleChips = 3;
//       let chipsDisplayed = 0;

//       selectedCheckboxes.forEach((checkbox, index) => {
//         if (index < maxVisibleChips) {
//           const chip = document.createElement("span");
//           chip.className = "chip";
//           const fullText = checkbox.nextElementSibling.title; // Get full text
//           const truncatedText = truncateText(fullText);
          
//           // Set the chip's text and title (for hover effect)
//           chip.textContent = truncatedText;
//           chip.title = fullText; // Enables hover tooltip

//           // Add a remove icon (X) inside the chip
//           const removeIcon = document.createElement("span");
//           removeIcon.className = "remove-chip";
//           removeIcon.textContent = " ×"; // Space for styling
//           removeIcon.dataset.value = checkbox.value;

//           // Append remove functionality
//           removeIcon.addEventListener("click", (e) => {
//             e.stopPropagation(); // Prevent dropdown from opening
//             checkbox.checked = false;
//             updateSelectAllCheckbox();
//             updateSelectedDisplay();
//             updateOriginalSelect();
//           });

//           chip.appendChild(removeIcon);
//           selectButton.appendChild(chip);

//           chipsDisplayed++;
//         }
//       });

//       // Add a "+X" counter if more than 3 options are selected
//       if (count > maxVisibleChips) {
//         const moreChip = document.createElement("span");
//         moreChip.className = "chip more-chip";
//         moreChip.textContent = `+${count - maxVisibleChips}`;
//         selectButton.appendChild(moreChip);
//       }
//     }
//   }

//   // Update original select field
//   function updateOriginalSelect() {
//     checkboxes.forEach((checkbox) => {
//       const option = originalSelect.querySelector(`option[value="${checkbox.value}"]`);
//       option.selected = checkbox.checked;
//     });
//   }
// });
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".select-wrapper").forEach((wrapper) => {
    const originalSelect = wrapper.querySelector("select");
    const selectButton = wrapper.querySelector(".form-select.text-start");
    const dropdown = wrapper.querySelector(".custom-select-dropdown");
    const optionsContainer = wrapper.querySelector(".select-options");
    const selectAllCheckbox = wrapper.querySelector(".form-check-input");

    // Function to truncate text
    function truncateText(text, length = 24) {
      return text.length > length ? text.substring(0, length) + "..." : text;
    }

    // Create checkbox options dynamically
    originalSelect.querySelectorAll("option").forEach((option) => {
      const div = document.createElement("div");
      div.className = "select-option";

      const truncatedText = truncateText(option.textContent);

      div.innerHTML = `
        <input class="form-check-input option-checkbox" type="checkbox" value="${option.value}">
        <label class="form-check-label" title="${option.textContent}">${truncatedText}</label>
      `;
      optionsContainer.appendChild(div);
    });

    // Function to toggle dropdown
    selectButton.addEventListener("click", (e) => {
      dropdown.classList.toggle("show");
      e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== selectButton) {
        dropdown.classList.remove("show");
      }
    });

    // Select all functionality
    selectAllCheckbox.addEventListener("change", () => {
      const isChecked = selectAllCheckbox.checked;
      wrapper.querySelectorAll(".option-checkbox").forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      updateSelectedDisplay();
      updateOriginalSelect();
    });

    // Add event listeners to checkboxes
    const checkboxes = wrapper.querySelectorAll(".option-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateSelectAllCheckbox();
        updateSelectedDisplay();
        updateOriginalSelect();
      });
    });

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Update "Select All" checkbox state
    function updateSelectAllCheckbox() {
      const totalCheckboxes = checkboxes.length;
      const checkedCheckboxes = Array.from(checkboxes).filter((cb) => cb.checked).length;
      selectAllCheckbox.checked = totalCheckboxes === checkedCheckboxes;
    }

    // Update button display with selected items as chips
    function updateSelectedDisplay() {
      const selectedCheckboxes = Array.from(wrapper.querySelectorAll(".option-checkbox:checked"));
      const count = selectedCheckboxes.length;

      // Clear previous content inside the button
      selectButton.innerHTML = "";

      if (count === 0) {
        selectButton.innerHTML = `<span class="select-button-text">Select Options</span>`;
      } else {
        // Show only first 3 chips, then add a "+X" if there are more
        const maxVisibleChips = 3;
        let chipsDisplayed = 0;

        selectedCheckboxes.forEach((checkbox, index) => {
          if (index < maxVisibleChips) {
            const chip = document.createElement("span");
            chip.className = "chip";
            const fullText = checkbox.nextElementSibling.title; // Get full text
            const truncatedText = truncateText(fullText);
            
            // Set the chip's text and title (for hover effect)
            chip.textContent = truncatedText;
            chip.title = fullText; // Enables hover tooltip

            // Add a remove icon (X) inside the chip
            const removeIcon = document.createElement("span");
            removeIcon.className = "remove-chip";
            removeIcon.textContent = " ×"; // Space for styling
            removeIcon.dataset.value = checkbox.value;

            // Append remove functionality
            removeIcon.addEventListener("click", (e) => {
              e.stopPropagation(); // Prevent dropdown from opening
              checkbox.checked = false;
              updateSelectAllCheckbox();
              updateSelectedDisplay();
              updateOriginalSelect();
            });

            chip.appendChild(removeIcon);
            selectButton.appendChild(chip);

            chipsDisplayed++;
          }
        });

        // Add a "+X" counter if more than 3 options are selected
        if (count > maxVisibleChips) {
          const moreChip = document.createElement("span");
          moreChip.className = "chip more-chip";
          moreChip.textContent = `+${count - maxVisibleChips}`;
          selectButton.appendChild(moreChip);
        }
      }
    }

    // Update original select field
    function updateOriginalSelect() {
      checkboxes.forEach((checkbox) => {
        const option = originalSelect.querySelector(`option[value="${checkbox.value}"]`);
        option.selected = checkbox.checked;
      });
    }
  });
});
