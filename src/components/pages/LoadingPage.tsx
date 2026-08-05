import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";
import {uploadImage} from "@/service/backendService";
import { LocalStorageData } from "@/app/libs/model";

export default function LoadingPage({ page }: { page: number }) {
    const [generationComplete, setGenerationComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    // on page load, request image generation and poll status endpoint every second
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setError(null);
            try {
                const response = await uploadImage();
                if (cancelled) return;
                setGenerationComplete(!!response);

                // update locale storage data to send user the result page
                const storedData = localStorage.getItem("pageData");
                if (storedData) {
                    const data: LocalStorageData = JSON.parse(storedData);
                    data.page = 5;
                    localStorage.setItem("pageData", JSON.stringify(data));
                    window.dispatchEvent(new Event("storage"));
                }
            } catch {
                if (!cancelled) {
                    setError("Dein Bild konnte nicht generiert werden. Bitte versuche es erneut.");
                }
            }
        };
        fetchData();

        return () => { cancelled = true; };
    }, [attempt]);


    return (
        <PageContainer page={page} nextPageAllowed={generationComplete} onNextPageClick={() => {}}>
            <Title title="Dein Bild wird generiert!" />
            {error ? (
                <div className="mt-16 flex flex-col items-center justify-center gap-8">
                    <p className="text-2xl text-center">{error}</p>
                    <button
                        className="py-3 px-8 bg-srf-r-700 hover:bg-srf-r-800 text-white rounded-xl text-2xl sm:text-3xl font-regular transition-all duration-200 ease-in-out"
                        onClick={() => setAttempt((a) => a + 1)}
                    >
                        Erneut versuchen
                    </button>
                </div>
            ) : (
                <div className="mt-16 flex items-center justify-center">
                    <video autoPlay muted loop className="rounded-xl max-h-[60vh]">
                        <source src="/videos/loading.mp4" type="video/mp4" />
                    </video>
                </div>
            )}
        </PageContainer>
    )
}