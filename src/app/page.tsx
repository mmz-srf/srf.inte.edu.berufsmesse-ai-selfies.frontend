"use client"

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import WebcamCapture from "../components/WebCam/WebCam";
import { v4 as uuid } from 'uuid';
import Image from "next/image";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);

  const capture = () => {
    if (!webcamRef.current) return;

    const video = webcamRef.current.video;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Spiegelung horizontal
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL("image/png");
    setImage(imageSrc);
  };


  const handleSendImage = async () => {
    if (!image) {
      console.error("No image to send");
      return;
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const selfieId = uuid();
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/card-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          selfieId: selfieId
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      const workflowId = data.workflowId;
      localStorage.setItem('workflowId', workflowId);
      localStorage.setItem('selfieId', selfieId);
      window.location.href = "/generate";
    } catch (error) {
      console.error('Error sending image:', error);
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Webcam Demo </h1>

      <WebcamCapture ref={webcamRef} width={400} height={300} />
      <div style={{ marginTop: "1rem" }}>
          <button
            onClick={capture}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: 7,
              border: "1.1px solid #3571baff",
              background: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Foto aufnehmen
          </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {!image ? (
          <div>Noch kein Bild aufgenommen</div>
        ) : (
          <>
            <Image
              src={image}
              alt="Captured image"
              style={{ borderRadius: 16, boxShadow: "0 0 20px rgba(0,0,0,0.4)", marginBottom: "1rem", maxHeight: "300px" }}
            />
          </>
        )}
      </div>
          <button
            onClick={handleSendImage}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: 7,
              border: "1.1px solid #3571baff",
              background: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Bild Generieren
          </button>
    </div>
  );
}