"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from 'qrcode'
import { svgStringToPng } from "../libs/svg2png";

export default function Generate() {
  const [status, setStatus] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [queueSize, setQueueSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "card-done") {
      const link = localStorage.getItem('cardLink') || 'sample text';
      QRCode.toCanvas(
        document.getElementById('qr-code'),
        link,
        function (error: any) {
          if (error) console.error(error);
        }
      );
    }
  }, [status]);

  const createCard = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/create-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test Pokémon",
            imagePath: localStorage.getItem("aiImage"),
            template: "srf-v1.svg"
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }
        
        const data = await response.json();
        console.log('Card created:', data);
        const base64Image = await svgStringToPng(data.svg, 1050, 760);
        console.log('SelfieId:', localStorage.getItem("selfieId"));
        try {
            const uploadResponse = await fetch("http://localhost:8080/api/v1/upload-card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selfieId: localStorage.getItem("selfieId"),
                    image: base64Image
                }),
            });

            if (!uploadResponse.ok) {
                throw new Error(response.statusText);
            }

            const uploadData = await uploadResponse.json();
            console.log('Card uploaded:', uploadData);
            localStorage.setItem("cardLink", uploadData.url);
            setStatus("card-done"); } catch (error) {
            console.error("Error uploading card:", error);
            setError("Error uploading card");
        }
    } catch (error) {
        console.error("Error creating card:", error);
        setError("Error creating card");
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/workflow-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowId: localStorage.getItem("workflowId"),
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      const status = data.status;

      console.log("Workflow Status:", status);
      console.log("Workflow Data:", data);

      switch (status) {
        case "pending":
            setStatus("pending");
            setQueuePosition(data.position);
            setQueueSize(data.total);
            break;
        case "running":
            setStatus("running");
            break;
        case "done":
            setStatus("done");
            localStorage.setItem('aiImage', data.filename);
            createCard();
            break;
        default:
            setStatus("unknown");
      }
    } catch (error) {
      setError("Error sending getting status");
      console.error("Error getting status:", error);
    }
  };

  useEffect(() => {
    checkStatus(); // Start api calls
    pollingRef.current = setInterval(() => {
      checkStatus();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === "done" || error) {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [status, error]);

  return (
    <div
      style={{ textAlign: "center", padding: "2rem", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
    >
      <h1>Karte wird Erstellt</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {status !== "done" && status !== "card-done" ? (
        <div>
            <h1>Generating Image</h1>
            {status == "pending" ? (
                    <span>In der Warteschlange #{queuePosition} von {queueSize}</span>
                ) : (
                    <span>Dein Bild wird generiert...</span>
                )
            }
        </div>
      ) : (
        <div>Building Pokémon Card</div>
      )}
        {status === "card-done" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <canvas id="qr-code"></canvas>
                <img src={localStorage.getItem("cardLink") || ""} alt="Preview" style={{ justifyContent: "center", alignItems: "center" }} />
            </div>
        )}
    </div>
  );
}