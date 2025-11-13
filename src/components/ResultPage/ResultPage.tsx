import { useEffect, useState } from 'react';
import './ResultPage.css';
import QRCode from 'qrcode'
import { reset } from '@/app/libs/reset';

export default function ResultPage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = localStorage.getItem("url");
        if (!url) return;
        setImageUrl(url);

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
            const response = await fetch('https://192.168.2.1:8443/api/v1/clear-comfy-ui', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    selfieId: localStorage.getItem("selfieId"),
                    imagePath: localStorage.getItem("imagePath"),
                }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }
        } catch (error) {
            console.error("Error clearing cache:", error);
        }
    };

    return (
        <div className="result-page-container">
            <h1>Deine SRF Charakterkarte ist bereit!</h1>
            <h2>Downloade sie über den QR-Code.</h2>
            <div className="result-content">
                <div className="result-image">
                    {imageUrl && <img src={imageUrl} alt="Generated Image" />}
                </div>
                <div>
                    <div className="result-qr-code">
                        <canvas id="qr-code"></canvas>
                    </div>
                    <button onClick={reset} className='re-gen-button'>Neue Karte generieren</button>
                </div>
                
            </div>
        </div>
    );
}
