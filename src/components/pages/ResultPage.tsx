import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";

export default function ResultPage({ page }: { page: number }) {
    const [resultImageBlock, setResultImageBlock] = useState<Blob | null>(null);

    useEffect(() => {
        const imageBase64 = localStorage.getItem("generatedImage");
        if (imageBase64) {
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const imageBlobResponse = new Blob([imageBuffer], { type: 'image/jpeg' });
            setResultImageBlock(imageBlobResponse);
        }
    }, []);

    return (
        <PageContainer page={page} nextPageAllowed={false} onNextPageClick={() => {}}>
            <h1 className="text-7xl font-bold">Vielen Dank fürs Mitmachen!</h1>
            <div className="flex-1 w-full items-center justify-center flex-col gap-4 flex">
                <div className="flex flex-row justify-around items-center w-2/3 mb-20">
                    {resultImageBlock ? (
                        <img src={URL.createObjectURL(resultImageBlock)} alt="Generated Selfie" className="max-h-[30rem] object-cover rounded-xl" />
                    ) : (
                        <div className="w-64 h-64 bg-gray-300 animate-pulse rounded-xl" />
                    )}
                    <img src="/icons/qr-code.png" alt="" className="w-64 h-64" />
                </div>

                <p className="font-regular text-4xl text-center">Du kannst innerhalb von den nächsten<br/>90 Tagen dein Foto herunterladen</p>
            </div>
        </PageContainer>
    )
}