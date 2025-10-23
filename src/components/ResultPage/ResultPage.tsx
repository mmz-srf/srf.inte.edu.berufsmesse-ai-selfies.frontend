// @ts-ignore
import './ResultPage.css';

export default function ResultPage() {
    return (
        <div className="result-page-container">
            <h1>Deine SRF Charakterkarte ist bereit!</h1>
            <h2>Download sie über den QR-Code.</h2>
            <div className="result-content">
                <div className="result-image">
                    <img src="/path/to/generated/selfie.png" alt="Generated Selfie" />
                </div>
                <div className="result-qr-code">
                    <img src="/path/to/generated/qr-code.png" alt="QR Code" />
                </div>
            </div>
        </div>
    );
}
