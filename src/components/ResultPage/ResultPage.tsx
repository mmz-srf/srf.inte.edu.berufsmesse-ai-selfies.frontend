import { useEffect } from 'react';
import './ResultPage.css';
import QRCode from 'qrcode'

export default function ResultPage() {

    useEffect(() => {
        const url = localStorage.getItem("url");
        if (!url) return;

        // Generate QR code
        const qrCodeCanvas = document.getElementById('qr-code') as HTMLCanvasElement;
        QRCode.toCanvas(
            qrCodeCanvas,
            url,
            function (error: any) {
                if (error) console.error(error);
            }
        )
        clearCache();
    }, []);

    const clearCache = async () => {
        try {
            const response = await fetch('https://192.168.2.1:8443/api/v1/clear-cache', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workflowId: localStorage.getItem("workflowId"),
                    selfieId: localStorage.getItem("selfieId"),
                }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            console.log("Cache cleared:", data);
        } catch (error) {
            console.error("Error clearing cache:", error);
        }

        localStorage.removeItem("formData");
        localStorage.removeItem("selfieImage");
        localStorage.removeItem("workflowId");
        localStorage.removeItem("imagePath");
        localStorage.removeItem("url");
    };

    return (
        <div className="result-page-container">
            <h1>Deine SRF Charakterkarte ist bereit!</h1>
            <h2>Downloade sie über den QR-Code.</h2>
            <div className="result-content">
                <div className="result-image">
                    <img src={localStorage.getItem("url") || ""} alt="Generated Image" />
                </div>
                <div className="result-qr-code">
                    <canvas id="qr-code"></canvas>
                </div>
            </div>
        </div>
    );
}
