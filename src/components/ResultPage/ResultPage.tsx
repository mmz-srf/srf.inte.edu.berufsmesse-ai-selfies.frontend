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
    }, []);

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
