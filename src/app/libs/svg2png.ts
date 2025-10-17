export async function svgStringToPng(svgString: string, height: number, width: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
    img.src = `data:image/svg+xml;base64,${svgBase64}`;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngBase64 = canvas.toDataURL("image/png").split(",")[1];
      resolve(pngBase64);
    };

    img.onerror = (err) => reject(err);
  });
}
