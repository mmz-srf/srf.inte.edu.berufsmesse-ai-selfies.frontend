"use client"

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import WebcamCapture from "./components/WebCam";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setImage(imageSrc);
      // TODO: send image to backend
    }
  };

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
          <div>Placeholder</div>
        ) : (
          <>
            <img
              src={image}
              alt="Captured image"
              style={{ borderRadius: 16, boxShadow: "0 0 20px rgba(0,0,0,0.4)", marginBottom: "1rem" }}
            />
          </>
        )}
      </div>
    </div>
  );
}