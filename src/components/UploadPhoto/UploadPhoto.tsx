import './UploadPhoto.css';
import { useRef, useState } from 'react';
import WebcamCapture from "../WebCam/WebCam";
import Webcam from 'react-webcam';

export default function UploadPhoto() {
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);

    // Capture an image
    const capture = () => {
        if (!webcamRef.current) return;

        const video = webcamRef.current.video;
        if (!video) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Mirror horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageSrc = canvas.toDataURL("image/png");
        setImage(imageSrc);
    };

    return (
    <div className='upload-photo-container'>
        <div className='top'>
            <span className='title'>Erstelle ein Foto für deine</span>
            <span className='title'>Persönliche SRF-Charakterkarte!</span>
        </div>
        <div className='webcam-section flex'>
            <div className={image == null ? '' : 'hidden'}>
                <WebcamCapture ref={webcamRef} width={666} height={500} />
            </div>
            { image && (
                <img src={image} alt="Captured" className='captured-image' />
            )}
        </div>
        <div className='webcam-buttons'>
            <button className='retake-button' onClick={() => setImage(null)}>Foto zurücksetzen</button>
            <button onClick={capture} disabled={image != null} className='capture-button'>
                <img src="/icons/photo_camera.svg" alt="Take Photo" width="32px" height="auto"/>
            </button>
            <button className='next-button'>Nächster Schritt</button>
        </div>
    </div>
)
}
