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
            <h1 className="text-7xl font-bold">Steh im SRF-Studio</h1>
            <img ref={imgRef} src={`/api/latest?t=${imageVersion}`} alt="Placeholder" className="w-[750px] h-[550px] rounded-2xl mt-6" />
            
            <button 
                className="bg-srf-r-700 text-white p-8 font-bold text-6xl rounded-2xl hover:bg-srf-r-800 transition-all duration-200 ease-in-out"
                onClick={() => { nextPage() }}
            >
                Jetzt ins Studio
            </button>
        </PageContainer>
    )
}