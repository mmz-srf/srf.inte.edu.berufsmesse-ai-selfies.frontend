import './LoadingPage.css';
import { useEffect, useRef, useState } from 'react';
import { FormData } from '@/app/libs/types/FormData';

export default function LoadingPage() {
    const [status, setStatus] = useState<string>('pending');
    const [position, setPosition] = useState<number>(1);
    const [queueSize, setQueueSize] = useState<number>(1);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const checkStatus = async () => {
        const workflowId = localStorage.getItem("workflowId");
        if (!workflowId) return;
        try {
            const response = await fetch('https://192.168.2.1:8443/api/v1/workflow-status', {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                workflowId: workflowId,
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
                    setPosition(data.position);
                    setQueueSize(data.total);
                    break;
                case "running":
                    setStatus("running");
                    break;
                case "done":
                    setStatus("done");
                    const fileName = data.filename;
                    localStorage.setItem("imagePath", fileName);
                    createCard(fileName);
                    break;
                default:
                    setStatus("unknown");
            }
        } catch (error) {
            console.error("Error getting status:", error);
            setStatus("error");
        }
    }

    const createCard = async (filename: string) => {
        const formDataString = localStorage.getItem("formData");
        if (!formDataString) return;
        const formData = JSON.parse(formDataString) as FormData;
        const { name, color, age } = formData;

        const selfieId = localStorage.getItem("selfieId");
        if (!selfieId) return;

        try {
            const response = await fetch('https://192.168.2.1:8443/api/v1/create-card', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    imagePath: filename,
                    template: color,
                    age: age
                    }),
                });

                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                
                const data = await response.json();
                console.log('Card created:', data);

                // Call server-side API to generate PNG (server-only puppeteer)
                const genResp = await fetch('/api/generate-png', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html: data.html }),
                });

                if (!genResp.ok) throw new Error('Failed to generate PNG');

                const genData = await genResp.json();
                const base64Image = genData.image;
                try {
                    const uploadResponse = await fetch('https://192.168.2.1:8443/api/v1/upload-card', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            selfieId: selfieId,
                            image: base64Image
                        }),
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(response.statusText);
                    }

                    const uploadData = await uploadResponse.json();
                    console.log('Card uploaded:', uploadData);
                    localStorage.setItem("url", uploadData.url);
                } catch (error) {
                    console.error("Error uploading card:", error);
                }
            } catch (error) {
                console.error("Error creating card:", error);
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

    // Stop polling when done or error
    useEffect(() => {
        if (status === "done" || status === "error") {
            if (pollingRef.current) clearInterval(pollingRef.current);
        }
    }, [status]);

    return (
        <div className="loading-page-container">
            <h1>Deine SRF Charakterkarte wird generiert</h1>
            <div className="loading-spinner">
                <div className="loader">
                    <div className="loader-inner">
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                    </div>
                </div>
            </div>
            {status === 'pending' && <h2>Platz in der Warteschleife: {position}/{queueSize}</h2>}
            {status === 'running' && <h2>Bild wird generiert...</h2>}
            {status === 'done' && <h2>Deine Karte wird erstellt...</h2>}
        </div>
    );
}