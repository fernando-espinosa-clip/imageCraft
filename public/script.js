document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-upload");
  const submitBtn = document.getElementById("submit-btn");

  // Detectar cambios en el input de archivo
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      submitBtn.disabled = false; // Habilitar el botón si hay archivo
    } else {
      submitBtn.disabled = true; // Deshabilitar el botón si no hay archivo
    }
  });
});
