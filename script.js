// 🔁 Sidebar Toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
});

// 📦 Helper: Determine File Type
function getFilePreview(file) {
  const type = file.type;
  const url = URL.createObjectURL(file);

  if (type.startsWith("image/")) {
    return `<img src="${url}" style="max-width:100%; max-height:150px; border-radius:10px;" />`;
  } else if (type.startsWith("audio/")) {
    return `<audio controls src="${url}" style="width:100%"></audio>`;
  } else if (type === "application/pdf") {
    return `<a href="${url}" target="_blank" style="color:#fff; text-decoration:underline;">View PDF</a>`;
  } else {
    return `<p style="color:white;">Uploaded: ${file.name}</p>`;
  }
}

// 📂 File Upload Handler
function handleUpload(sectionId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*/*";

  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const preview = getFilePreview(file);
      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.innerHTML = preview;

      const section = document.getElementById(sectionId);
      section.appendChild(wrapper);

      // Save to localStorage
      const all = JSON.parse(localStorage.getItem(sectionId) || "[]");
      all.push({ name: file.name, type: file.type });
      localStorage.setItem(sectionId, JSON.stringify(all));
    }
  };

  input.click();
}

// 🗑️ Remove Last File
function handleRemove(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    uploads[uploads.length - 1].remove();

    // Update localStorage
    let all = JSON.parse(localStorage.getItem(sectionId) || "[]");
    all.pop();
    localStorage.setItem(sectionId, JSON.stringify(all));
  }
}

// ✏️ Rename Last File
function handleRename(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    const last = uploads[uploads.length - 1];
    const newName = prompt("Enter new name (in Hindi also supported):");
    if (newName) {
      last.innerHTML = `<p style="color:white;">Renamed to: ${newName}</p>`;
    }
  }
}

// ✏️ Edit File (Re-upload)
function handleEdit(sectionId) {
  handleUpload(sectionId);
}

// 🔁 Attach to all button groups
document.querySelectorAll(".section").forEach(section => {
  const id = section.id;
  const buttons = section.querySelectorAll(".btn-group button");

  buttons[0].addEventListener("click", () => handleUpload(id)); // Upload
  buttons[1].addEventListener("click", () => handleEdit(id));   // Edit
  buttons[2].addEventListener("click", () => handleRemove(id)); // Remove
  buttons[3].addEventListener("click", () => handleRename(id)); // Rename
});

// 💾 Load previously saved (optional)
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section").forEach(section => {
    const id = section.id;
    const saved = JSON.parse(localStorage.getItem(id) || "[]");
    saved.forEach(file => {
      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.innerHTML = `<p style="color:white;">${file.name} (${file.type})</p>`;
      section.appendChild(wrapper);
    });
  });
});
