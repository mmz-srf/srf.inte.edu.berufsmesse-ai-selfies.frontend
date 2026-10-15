import {LocalStorageData} from "@/app/libs/model";
import { getGeneratedImage, saveGeneratedImage } from "./imageStore";

let inFlightUpload: Promise<boolean | undefined> | null = null;

export async function uploadImage() {
    if (inFlightUpload) {
        return inFlightUpload;
    }

    inFlightUpload = uploadImageInternal();
    try {
        return await inFlightUpload;
    } finally {
        inFlightUpload = null;
    }
}

async function uploadImageInternal() {
    const storedData = localStorage.getItem("pageData");
    let data;
    if (storedData) {
        data = JSON.parse(storedData) as LocalStorageData;
    } else {
        return;
    }

    try {
        // Fetch the image from the API
        const imageResponse = await fetch('/api/latest');
        let imageBlob;
        if (!imageResponse.ok) {
            const fallbackResponse = await fetch(`/assets/greenscreen-test.jpeg`);
            if (!fallbackResponse.ok) {
                throw new Error('Failed to fetch fallback image');
            }
            imageBlob = await fallbackResponse.blob();
        } else {
            imageBlob = await imageResponse.blob();
        }

        console.log("Fetched image from Next.js API route");

        // Convert blob to base64
        const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });

        // Remove the data:image/jpeg;base64, prefix to get just the base64 string
        const base64String = base64Image.split(',')[1];

        console.log("Sending request to backend with...")

        const response = await fetch('http://localhost:8080/api/v1/card-image', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gender: data.gender,
                name: data.name,
                background: data.background,
                image: base64String
            })
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const responseData = await response.json();
        const imageBase64 = responseData.image;
        const imageUrl = responseData.url;

        localStorage.setItem("generatedImageUrl", imageUrl);
        await saveGeneratedImage(imageBase64);
        console.log("Received response from backend. Image length: " + imageBase64.length);

        // Statistics are best effort, the user should still get their result if recording fails
        fetch('/api/statistics', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ background: data.background })
        }).catch((error) => console.error('Error recording statistics:', error));

        return true;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

export async function sendImageToPrinter() {
    const printerPath = localStorage.getItem("printerPath");
    const imageBase64 = await getGeneratedImage();
    if (!imageBase64) {
        throw new Error('No generated image to print');
    }

    const response = await fetch('/api/print', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageBase64, printerPath: printerPath || '~/to_printer' })
    });

    if (!response.ok) {
        throw new Error('Failed to send image to printer');
    }
}
