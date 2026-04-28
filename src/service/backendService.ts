import {LocalStorageData} from "@/app/libs/model";

export async function uploadImage() {
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
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image');
        }
        const imageBlob = await imageResponse.blob();

        // Convert blob to base64
        const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });

        // Remove the data:image/jpeg;base64, prefix to get just the base64 string
        const base64String = base64Image.split(',')[1];

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

        return response;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}