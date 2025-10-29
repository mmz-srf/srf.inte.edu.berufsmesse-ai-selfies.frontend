import { useRef, useState } from 'react';
import WebcamCapture from "../WebCam/WebCam";
import Webcam from 'react-webcam';
import './UploadPhoto.css';

export default function UploadPhoto() {
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);

    // Capture an image
    const capture = () => {
        if (!webcamRef.current) return;

        const video = webcamRef.current.video;
        if (!video) return;

        // Use 4:3 aspect ratio like the default camera (320x240)
        const targetWidth = 640;
        const targetHeight = 480; // 4:3 aspect ratio

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Calculate how to crop the video to fit 4:3 aspect ratio
        const targetAspect = targetWidth / targetHeight; // 4:3 = 1.333
        const videoAspect = video.videoWidth / video.videoHeight;
        
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = video.videoWidth;
        let sourceHeight = video.videoHeight;

        if (videoAspect > targetAspect) {
            // Video is wider than 4:3 - crop from sides
            sourceWidth = video.videoHeight * targetAspect;
            sourceX = (video.videoWidth - sourceWidth) / 2;
        } else {
            // Video is taller than 4:3 - crop from top/bottom  
            sourceHeight = video.videoWidth / targetAspect;
            sourceY = (video.videoHeight - sourceHeight) / 2;
        }

        // Mirror horizontally and draw
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        // Draw the cropped video with 4:3 aspect ratio
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle (4:3 from video)
            0, 0, targetWidth, targetHeight               // Destination rectangle (canvas)
        );

        const imageSrc = canvas.toDataURL("image/jpeg", 0.9);
        setImage(imageSrc);
    };

    const nextStep = () => {
        if (image) {
            localStorage.setItem('selfieImage', image);
            window.dispatchEvent(new Event('storage'));
        }
    }

    return (
    <div className='upload-photo-container'>
        <div className='top'>
            <span className='title'>Erstelle ein Foto für deine</span>
            <span className='title'>Persönliche SRF-Charakterkarte!</span>
        </div>
        <div className='webcam-section flex'>
            <div className={image == null ? '' : 'hidden'}>
                <WebcamCapture ref={webcamRef} />
            </div>
            { image && (
                <img src={image} alt="Captured" className='captured-image' />
            )}
        </div>
        <div className='webcam-buttons'>
            <button className='retake-button' onClick={() => setImage(null)} disabled={image == null}>Foto zurücksetzen</button>
            <button onClick={capture} disabled={image != null} className='capture-button'>
                <img src="/icons/photo_camera.svg" alt="Take Photo" className='camera-icon'/>
            </button>
            <button className={`next-button ${image == null ? 'disabled' : ''}`} onClick={nextStep} disabled={image == null}>Nächster Schritt</button>
        </div>
    </div>
)
}
