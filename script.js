document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");

  sections.forEach((section) => {
    const card = section.querySelector(".card");
    const group = card.querySelector(".btn-group");

    // Create container for uploaded files
    const display = document.createElement("div");
    display.className = "uploaded-files";
    card.appendChild(display);

    const sectionId = section.id;

    // Load saved data
    const saved = JSON.parse(localStorage.getItem(sectionId)) || [];
    saved.forEach(file => addToDisplay(file));

    // Upload handler
    const uploadBtn = group.querySelector("button:nth-child(1)");
    uploadBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";
      input.onchange = () => {
        const file = input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const newFile = {
              name: file.name,
              url: e.target.result,
              type: file.type
            };
            saved.push(newFile);
            localStorage.setItem(sectionId, JSON.stringify(saved));
            addToDisplay(newFile);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });

    // Edit handler (not implemented deeply yet)
    const editBtn = group.querySelector("button:nth-child(2)");
    editBtn.addEventListener("click", () => {
      alert("Edit feature coming soon.");
    });

    // Remove handler
    const removeBtn = group.querySelector("button:nth-child(3)");
    removeBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear this section?")) {
        localStorage.removeItem(sectionId);
        display.innerHTML = "";
      }
    });

    // Rename handler
    const renameBtn = group.querySelector("button:nth-child(4)");
    renameBtn.addEventListener("click", () => {
      const newName = prompt("Enter new name (in Hindi if you wish):");
      if (newName) {
        const last = saved[saved.length - 1];
        if (last) {
          last.name = newName;
          localStorage.setItem(sectionId, JSON.stringify(saved));
          display.innerHTML = "";
          saved.forEach(addToDisplay);
        }
      }
    });

    function addToDisplay(file) {
      const container = document.createElement("div");
      container.style.marginBottom = "10px";
      container.innerHTML = `<strong>${file.name}</strong><br/>`;

      if (file.type.startsWith("audio")) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = file.url;
        container.appendChild(audio);
      } else if (file.type.startsWith("image")) {
        const img = document.createElement("img");
        img.src = file.url;
        img.style.maxWidth = "200px";
        img.style.display = "block";
        container.appendChild(img);
      } else if (file.type === "application/pdf") {
        container.innerHTML += `<a href="${file.url}" target="_blank">📄 View PDF</a>`;
      } else {
        container.innerHTML += `<a href="${file.url}" target="_blank">📎 Open File</a>`;
      }

      display.appendChild(container);
    }
  });

  // Hamburger toggle
  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("active");
  });
});
