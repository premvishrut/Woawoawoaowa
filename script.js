// 🔁 Sidebar Toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
});

// 📤 Upload to Cloudinary
function uploadToCloudinary(sectionId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "bhajan_upload");
  formData.append("folder", sectionId);

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
      alert("❌ Upload failed. Check internet or Cloudinary settings.");
      console.error(err);
    });
}

// 🔍 Smart Preview
function getPreview(fileInfo) {
  const { url, type, name } = fileInfo;

  if (type.startsWith("image/")) {
    return `<img src="${url}" style="max-width:100%; max-height:150px; border-radius:10px;" />`;
  } else if (type.startsWith("audio/")) {
    return `<audio controls src="${url}" style="width:100%"></audio>`;
  } else if (type.startsWith("video/")) {
    return `<video controls src="${url}" style="width:100%; max-height:200px; border-radius:10px;"></video>`;
  } else if (type === "application/pdf") {
    return `<a href="${url}" target="_blank" style="color:#fff; text-decoration:underline;">📄 View PDF</a>`;
  } else {
    return `<a href="${url}" download style="color:#fff; text-decoration:underline;">⬇️ ${name}</a>`;
  }
}

// 📂 Upload Handler
function handleUpload(sectionId) {
  if (sectionId === "search") return;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      const section = document.getElementById(sectionId);
      const uploading = document.createElement("p");
      uploading.textContent = "Uploading...";
      uploading.style.color = "white";
      section.appendChild(uploading);

      const uploaded = await uploadToCloudinary(sectionId, file);
      uploading.remove();

      if (!uploaded) return;

      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.setAttribute("data-name", uploaded.name);
      wrapper.innerHTML = getPreview(uploaded);
      section.appendChild(wrapper);

      const all = JSON.parse(localStorage.getItem(sectionId) || "[]");
      all.push(uploaded);
      localStorage.setItem(sectionId, JSON.stringify(all));
    }
  };

  input.click();
}

// ✏️ Rename Handler
function handleRename(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length > 0) {
    const names = Array.from(uploads).map((el, i) => `(${i + 1}) ${el.dataset.name}`);
    const choice = prompt("Which file to rename?\n" + names.join("\n"));
    if (!choice) return;

    const index = parseInt(choice.match(/(\d+)/)?.[1]) - 1;
    if (index >= 0 && uploads[index]) {
      const newName = prompt("Enter new name (Hindi supported):");
      if (newName) {
        uploads[index].innerHTML += `<p style='color:white;'>📝 ${newName}</p>`;
      }
    }
  }
}

// 🗑️ Remove Handler
function handleRemove(sectionId) {
  const section = document.getElementById(sectionId);
  const uploads = section.querySelectorAll(".uploaded-files");
  if (uploads.length === 0) return;

  const names = Array.from(uploads).map((el, i) => `(${i + 1}) ${el.dataset.name}`);
  const choice = prompt("Which file to remove?\n" + names.join("\n"));
  if (!choice) return;

  const index = parseInt(choice.match(/(\d+)/)?.[1]) - 1;
  if (index >= 0 && uploads[index]) {
    uploads[index].remove();
    let all = JSON.parse(localStorage.getItem(sectionId) || "[]");
    all.splice(index, 1);
    localStorage.setItem(sectionId, JSON.stringify(all));
  }
}

// ✏️ Edit Handler
function handleEdit(sectionId) {
  handleUpload(sectionId);
}

// ⏱️ Tap-and-Hold Logic
let holdTimer = null;
document.addEventListener("touchstart", (e) => {
  const section = e.target.closest(".section");
  if (!section) return;

  holdTimer = setTimeout(() => {
    const btnGroup = section.querySelector(".btn-group");
    if (btnGroup) btnGroup.classList.add("visible");
  }, 600);
});

document.addEventListener("touchend", () => {
  clearTimeout(holdTimer);
});

// 🧹 Hide Buttons on Outside Tap
document.addEventListener("click", (e) => {
  document.querySelectorAll(".btn-group").forEach((group) => {
    if (!group.contains(e.target)) group.classList.remove("visible");
  });
});

// 📂 Expand/Collapse Section
document.addEventListener("click", (e) => {
  const section = e.target.closest(".section");
  if (!section) return;

  document.querySelectorAll(".section").forEach((sec) => {
    if (sec !== section) sec.classList.remove("active");
  });

  section.classList.toggle("active");
});

// 🧠 On Load Restore
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section").forEach((section) => {
    const id = section.id;
    const btns = section.querySelectorAll(".btn-group button");

    if (id !== "search") {
      btns[0].addEventListener("click", () => handleUpload(id));
      btns[1].addEventListener("click", () => handleEdit(id));
      btns[2].addEventListener("click", () => handleRemove(id));
      btns[3].addEventListener("click", () => handleRename(id));
    }

    // Restore previews
    const saved = JSON.parse(localStorage.getItem(id) || "[]");
    saved.forEach((fileInfo) => {
      const wrapper = document.createElement("div");
      wrapper.className = "uploaded-files";
      wrapper.setAttribute("data-name", fileInfo.name);
      wrapper.innerHTML = getPreview(fileInfo);
      section.appendChild(wrapper);
    });
  });
});
