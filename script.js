// 🔁 Sidebar Toggle const menuToggle = document.getElementById("menu-toggle"); const sidebar = document.getElementById("sidebar"); menuToggle.addEventListener("click", () => { sidebar.style.display = sidebar.style.display === "block" ? "none" : "block"; });

// 📦 Get Preview HTML function getFilePreview(file) { const type = file.type; const url = URL.createObjectURL(file); if (type.startsWith("image/")) { return <img src="${url}" style="max-width:100%; max-height:150px; border-radius:10px;" />; } else if (type.startsWith("audio/")) { return <audio controls src="${url}" style="width:100%"></audio>; } else if (type === "application/pdf") { return <a href="${url}" target="_blank" style="color:#fff; text-decoration:underline;">View PDF</a>; } else { return <p style="color:white;">Uploaded: ${file.name}</p>; } }

// 📤 Upload to Cloudinary by Folder function uploadToCloudinary(sectionId, file) { const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", "bhajan_upload"); formData.append("folder", sectionId); // Folder based on section ID

return fetch("https://api.cloudinary.com/v1_1/denn7emmr/upload", { method: "POST", body: formData }) .then(res => res.json()) .then(data => ({ url: data.secure_url, type: file.type, name: file.name })) .catch(err => { alert("Upload failed"); console.error(err); }); }

// 📂 Handle Upload function handleUpload(sectionId) { const input = document.createElement("input"); input.type = "file"; input.accept = "/"; input.onchange = async () => { const file = input.files[0]; if (file) { const uploading = document.createElement("p"); uploading.style.color = "white"; uploading.textContent = "Uploading..."; const section = document.getElementById(sectionId); section.appendChild(uploading);

const uploaded = await uploadToCloudinary(sectionId, file);
  uploading.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "uploaded-files";

  if (uploaded.type.startsWith("image/")) {
    wrapper.innerHTML = `<img src="${uploaded.url}" style="max-width:100%; max-height:150px; border-radius:10px;" />`;
  } else if (uploaded.type.startsWith("audio/")) {
    wrapper.innerHTML = `<audio controls src="${uploaded.url}" style="width:100%"></audio>`;
  } else if (uploaded.type === "application/pdf") {
    wrapper.innerHTML = `<a href="${uploaded.url}" target="_blank" style="color:#fff; text-decoration:underline;">View PDF</a>`;
  } else {
    wrapper.innerHTML = `<p style="color:white;">Uploaded: ${uploaded.name}</p>`;
  }

  section.appendChild(wrapper);

  const all = JSON.parse(localStorage.getItem(sectionId) || "[]");
  all.push({ name: uploaded.name, type: uploaded.type, url: uploaded.url });
  localStorage.setItem(sectionId, JSON.stringify(all));
}

}; input.click(); }

// 🗑️ Remove Last Upload function handleRemove(sectionId) { const section = document.getElementById(sectionId); const uploads = section.querySelectorAll(".uploaded-files"); if (uploads.length > 0) { uploads[uploads.length - 1].remove(); let all = JSON.parse(localStorage.getItem(sectionId) || "[]"); all.pop(); localStorage.setItem(sectionId, JSON.stringify(all)); } }

// ✏️ Rename function handleRename(sectionId) { const section = document.getElementById(sectionId); const uploads = section.querySelectorAll(".uploaded-files"); if (uploads.length > 0) { const last = uploads[uploads.length - 1]; const newName = prompt("Enter new name (Hindi supported):"); if (newName) { last.innerHTML = <p style='color:white;'>Renamed to: ${newName}</p>; } } }

// ✏️ Edit function handleEdit(sectionId) { handleUpload(sectionId); }

// 🖱️ Attach Actions window.addEventListener("DOMContentLoaded", () => { document.querySelectorAll(".section").forEach(section => { const id = section.id; const btns = section.querySelectorAll(".btn-group button"); btns[0].addEventListener("click", () => handleUpload(id)); btns[1].addEventListener("click", () => handleEdit(id)); btns[2].addEventListener("click", () => handleRemove(id)); btns[3].addEventListener("click", () => handleRename(id));

const saved = JSON.parse(localStorage.getItem(id) || "[]");
saved.forEach(file => {
  const wrap = document.createElement("div");
  wrap.className = "uploaded-files";
  if (file.type.startsWith("image/")) {
    wrap.innerHTML = `<img src="${file.url}" style="max-width:100%; max-height:150px; border-radius:10px;" />`;
  } else if (file.type.startsWith("audio/")) {
    wrap.innerHTML = `<audio controls src="${file.url}" style="width:100%"></audio>`;
  } else if (file.type === "application/pdf") {
    wrap.innerHTML = `<a href="${file.url}" target="_blank" style="color:#fff; text-decoration:underline;">View PDF</a>`;
  } else {
    wrap.innerHTML = `<p style='color:white;'>${file.name}</p>`;
  }
  section.appendChild(wrap);
});

}); });

