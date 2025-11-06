"use client";

import ResultPage from "@/components/ResultPage/ResultPage";
import FormPage from "@/components/FormPage/FormPage";
import LoadingPage from "@/components/LoadingPage/LoadingPage";
import UploadPhoto from "@/components/UploadPhoto/UploadPhoto";
import { useEffect, useState } from "react";

export default function Home() {
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [url, setUrl] = useState<string | null>(null);

    const checkLocalStorage = () => {
        // Get selfie image
        const selfieImage = localStorage.getItem('selfieImage');
        setSelfieImage(selfieImage);

        // Get form data
        const formDataString = localStorage.getItem('formData');
        if (formDataString) {
            const parsedFormData: FormData = JSON.parse(formDataString);
            setFormData(parsedFormData);
        } else {
            setFormData(null);
        }

        // Get url to image on s3 bucket
        const imageUrl = localStorage.getItem('url');
        setUrl(imageUrl);
    };

    useEffect(() => {
        checkLocalStorage();
        
        // Listen for storage changes
        const handleStorageChange = () => {
            checkLocalStorage();
        };

        window.addEventListener('storage', handleStorageChange);
        
        const interval = setInterval(checkLocalStorage, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const switchApp = () => {
        window.location.href = "https://quiz.srf.ch/";
    };

    return (
        <div>
            <button className="switch-app-button" onClick={switchApp}>Wechsle zur Quiz App</button>
            <img src="/icons/SRF.png" alt="SRF Logo" className="srf-logo" />
            { !selfieImage && !formData && !url && <UploadPhoto /> }
            { selfieImage && !formData && !url && <FormPage /> }
            { selfieImage && formData && !url &&  <LoadingPage />}
            { selfieImage && formData && url && <ResultPage /> }
        </div>
    );
}
