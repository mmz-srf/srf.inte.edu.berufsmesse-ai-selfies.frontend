export const reset = () => {
    localStorage.removeItem("formData");
    localStorage.removeItem("selfieImage");
    localStorage.removeItem("imagePath");
    localStorage.removeItem("url");
    localStorage.removeItem("selfieId");
    localStorage.removeItem("workflowId");
    window.dispatchEvent(new Event("storage"));
}