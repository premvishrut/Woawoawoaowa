// 🔁 Sidebar Toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
});

// 📦 Preview Helper
function getPreviewHTML(file, url, name) {
  if (file.type.startsWith("image/")) {
    return `<img src="${url}" style="max-width:100%; max-height:150px; border-radius:10px;" />`;
  } else if (file.type.startsWith("audio/")) {
    return `<audio controls src="${url}" style="width:100%"></audio>`;
  } else if (file.type === "application/pdf") {
    return `<a href="${url}" target="_blank" style="color:#fff; text-decoration:underline;">View PDF</a>`;
  } else {
    return `<p style='color:white;'>Uploaded: ${name}</p>`;
  }
}

// ☁️ Upload to Cloudinary
async function uploadToCloudinary(sectionId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "bhajan_upload");
  formData.append("folder", sectionId);

  const res = await fetch("https://api.cloudinary.com/v1_1/denn7emmr/upload", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    alert("Upload failed!");
    throw new Error("Upload failed");
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    type: file.type,
    name: file.name
  };
}

// 📂 Handle Upload
function handleUpload(sectionId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const section = document.getElementById(sectionId);
    const loading = document.createElement("p");
    loading.textContent = "Uploading...";
    loading.style.color = "white";
    section.appendChild(loading);

    try {
      const uploaded = await uploadToCloudinary(sectionId, file);
      loading.remove();

      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.innerHTML = getPreviewHTML(file, uploaded.url, uploaded.name);
      section.appendChild(wrapper);

      const saved = JSON.parse(localStorage.getItem(sectionId) || "[]");
      saved.push({ name: uploaded.name, type: uploaded.type, url: uploaded.url });
      localStorage.setItem(sectionId, JSON.stringify(saved));
    } catch (err) {
      loading.remove();
    }
  };

  input.click();
}

// 🗑️ Remove Last Upload
function handleRemove(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    uploads[uploads.length - 1].remove();
    const saved = JSON.parse(localStorage.getItem(sectionId) || "[]");
    saved.pop();
    localStorage.setItem(sectionId, JSON.stringify(saved));
  }
}

// ✏️ Rename Last Upload
function handleRename(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    const last = uploads[uploads.length - 1];
    const newName = prompt("नया नाम दर्ज करें:");
    if (newName) {
      last.innerHTML = `<p style='color:white;'>Renamed to: ${newName}</p>`;
    }
  }
}

// ✏️ Edit = Re-upload
function handleEdit(sectionId) {
  handleUpload(sectionId);
}

// 🚀 Attach All Section Buttons
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section").forEach(section => {
    const id = section.id;
    const btns = section.querySelectorAll(".btn-group button");

    btns[0].addEventListener("click", () => handleUpload(id));
    btns[1].addEventListener("click", () => handleEdit(id));
    btns[2].addEventListener("click", () => handleRemove(id));
    btns[3].addEventListener("click", () => handleRename(id));

    // Restore from localStorage
    const saved = JSON.parse(localStorage.getItem(id) || "[]");
    saved.forEach(file => {
      const wrap = document.createElement("div");
      wrap.className = "uploaded-files";
      wrap.innerHTML = getPreviewHTML({ type: file.type }, file.url, file.name);
      section.appendChild(wrap);
    });
  });
});
