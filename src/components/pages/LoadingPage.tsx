import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";
import {uploadImage} from "@/service/backendService";

export default function LoadingPage({ page }: { page: number }) {
    const [generationComplete, setGenerationComplete] = useState(false);
    const [resultImageBlock, setResultImageBlock] = useState<Blob | null>(null);

    // on page load, request image generation and poll status endpoint every second
    useEffect(() => {
        const fetchData = async () => {
            const resultImage = await uploadImage();
            setResultImageBlock(resultImage || null);
        };
        fetchData();
    }, []);

    return (
        <PageContainer page={page} nextPageAllowed={generationComplete} onNextPageClick={() => {}}>
            <Title title="Dein Bild wird generiert!" />
            <div className="mt-16 flex items-center justify-center">
                <video autoPlay muted loop className="rounded-xl max-h-[60vh]">
                    <source src="/videos/loading.mp4" type="video/mp4" />
                </video>

                <img src={resultImageBlock ? URL.createObjectURL(resultImageBlock) : ""} alt="Generated Image" />
            </div>
        </PageContainer>
    )
}