"use client";

import ResultPage from "@/components/ResultPage/ResultPage";
import FormPage from "@/components/FormPage/FormPage";
import UploadPhoto from "@/components/UploadPhoto/UploadPhoto";
import { useEffect, useState } from "react";

export default function Home() {
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [svg, setSvg] = useState<string | null>(null);

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

        // Get SVG
        const svgString = localStorage.getItem('generatedSVG');
        setSvg(svgString);
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

    return (
        <div>
            <img src="/icons/SRF.png" alt="SRF Logo" className="srf-logo" />
            { !selfieImage && !formData && !svg && <UploadPhoto /> }
            { selfieImage && !formData && !svg && <FormPage /> }
        </div>
    );
}
