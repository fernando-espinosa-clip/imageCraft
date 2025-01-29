document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-upload");
  const submitBtn = document.getElementById("submit-btn");

  // Detectar cambios en el input de archivo
  fileInput.addEventListener("change", () => {
    submitBtn.disabled = fileInput.files.length <= 0;
  });
});
