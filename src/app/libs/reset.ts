export const reset = () => {
    resetCache(localStorage.getItem("workflowId") || "");
    localStorage.removeItem("formData");
    localStorage.removeItem("selfieImage");
    localStorage.removeItem("imagePath");
    localStorage.removeItem("url");
    localStorage.removeItem("selfieId");
    localStorage.removeItem("workflowId");
    window.dispatchEvent(new Event("storage"));
}

const resetCache = async (workflowId: string) => {
    if (!workflowId) return;
    try {
        const response = await fetch('https://192.168.2.1:8443/api/v1/clear-comfy-ui', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                workflowId: workflowId,
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error("Error clearing cache:", error);
    }
}