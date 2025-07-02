// 🔁 Sidebar Toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
});

// 📤 Upload to Cloudinary (Permanent)
function uploadToCloudinary(sectionId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "bhajan upload"); // Use your unsigned preset
  formData.append("folder", sectionId); // Save under section name

  return fetch("https://api.cloudinary.com/v1_1/denn7emmr/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.secure_url) {
        return { url: data.secure_url, type: file.type, name: file.name };
      } else {
        throw new Error("Upload failed");
      }
    })
    .catch((err) => {
      alert("❌ Upload failed. Please check your internet or Cloudinary settings.");
      console.error(err);
    });
}

// 📦 Get Preview
function getPreview(fileInfo) {
  if (fileInfo.type.startsWith("image/")) {
    return `<img src="${fileInfo.url}" style="max-width:100%; max-height:150px; border-radius:10px;" />`;
  } else if (fileInfo.type.startsWith("audio/")) {
    return `<audio controls src="${fileInfo.url}" style="width:100%"></audio>`;
  } else if (fileInfo.type === "application/pdf") {
    return `<a href="${fileInfo.url}" target="_blank" style="color:#fff; text-decoration:underline;">View PDF</a>`;
  } else {
    return `<p style="color:white;">Uploaded: ${fileInfo.name}</p>`;
  }
}

// 📂 Upload Handler
function handleUpload(sectionId) {
  if (sectionId === "search") return; // Skip "खोजें" section

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      const uploading = document.createElement("p");
      uploading.style.color = "white";
      uploading.textContent = "Uploading...";
      const section = document.getElementById(sectionId);
      section.appendChild(uploading);

      const uploaded = await uploadToCloudinary(sectionId, file);
      uploading.remove();

      if (!uploaded) return;

      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.innerHTML = getPreview(uploaded);
      section.appendChild(wrapper);

      const all = JSON.parse(localStorage.getItem(sectionId) || "[]");
      all.push(uploaded);
      localStorage.setItem(sectionId, JSON.stringify(all));
    }
  };

  input.click();
}

// 🗑️ Remove Last
function handleRemove(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    uploads[uploads.length - 1].remove();

    let all = JSON.parse(localStorage.getItem(sectionId) || "[]");
    all.pop();
    localStorage.setItem(sectionId, JSON.stringify(all));
  }
}

// ✏️ Rename
function handleRename(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    const last = uploads[uploads.length - 1];
    const newName = prompt("Enter new name (Hindi supported):");
    if (newName) {
      last.innerHTML = `<p style='color:white;'>Renamed to: ${newName}</p>`;
    }
  }
}

// ♻️ Edit
function handleEdit(sectionId) {
  handleUpload(sectionId);
}

// 🧩 Bind Buttons
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section").forEach((section) => {
    const id = section.id;
    const btns = section.querySelectorAll(".btn-group button");

    if (id !== "search") {
      btns[0].addEventListener("click", () => handleUpload(id)); // Upload
      btns[1].addEventListener("click", () => handleEdit(id));   // Edit
      btns[2].addEventListener("click", () => handleRemove(id)); // Remove
      btns[3].addEventListener("click", () => handleRename(id)); // Rename
    }

    // Load from localStorage
    const saved = JSON.parse(localStorage.getItem(id) || "[]");
    saved.forEach((fileInfo) => {
      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.innerHTML = getPreview(fileInfo);
      section.appendChild(wrapper);
    });
  });
});
