import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";
import {uploadImage} from "@/service/backendService";
import { LocalStorageData } from "@/app/libs/model";

export default function LoadingPage({ page }: { page: number }) {
    const [generationComplete, setGenerationComplete] = useState(false);

    // on page load, request image generation and poll status endpoint every second
    useEffect(() => {
        const fetchData = async () => {
            const response = await uploadImage();
            setGenerationComplete(!!response);

            // update locale storage data to send user the result page
            const storedData = localStorage.getItem("pageData");
            if (storedData) {
                const data: LocalStorageData = JSON.parse(storedData);
                data.page = 5;
                localStorage.setItem("pageData", JSON.stringify(data));
                window.dispatchEvent(new Event("storage"));
            }
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
            </div>
        </PageContainer>
    )
}