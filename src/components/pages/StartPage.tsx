import PageContainer from "../layout/PageContainer";
import { nextPage } from "@/app/libs/utils";
import { useEffect, useRef, useState } from "react";

export default function StartPage({page}: { page: number }) {
  const imgRef = useRef(null);
    const [imageVersion, setImageVersion] = useState(0);

    useEffect(() => {
        const eventSource = new EventSource("/api/events");

        eventSource.onmessage = (event) => {
            const version = Number(event.data);
            setImageVersion(Number.isFinite(version) ? version : Date.now());
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);


    return (
        <PageContainer page={page} nextPageAllowed={true} onNextPageClick={() => {}}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-center">Steh im SRF-Studio</h1>
            <img
                ref={imgRef}
                src={'/assets/greenscreen-test.jpeg'}
                alt="Placeholder"
                className="rounded-2xl mt-4 mb-6 sm:mt-6 w-auto h-auto max-h-[55vh] object-contain"
            />
            
            <button 
                className="bg-srf-r-700 text-white px-6 py-4 sm:px-8 sm:py-6 lg:p-8 font-bold text-2xl sm:text-4xl lg:text-6xl rounded-2xl hover:bg-srf-r-800 transition-all duration-200 ease-in-out"
                onClick={() => { nextPage() }}
            >
                Jetzt ins Studio
            </button>
        </PageContainer>
    )
}