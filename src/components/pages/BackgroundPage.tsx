import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";

export default function BackgroundPage({ page }: { page: number }) {
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const backgrounds = [
        "Arena",
        "Meteo",
        "Tagesschau",
        "Radio",
        "Sport"
    ];

    useEffect(() => {
        const storedData = localStorage.getItem("pageData");
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data.background) {
                setSelectedBackground(data.background);
            }
        }
    }, [])

    useEffect(() => {
        if (selectedBackground) {
            const storedData = localStorage.getItem("pageData");
            if (storedData) {
                const data = JSON.parse(storedData);
                data.background = selectedBackground;
                localStorage.setItem("pageData", JSON.stringify(data));
                window.dispatchEvent(new Event("storage"));
            }
        }
    }, [selectedBackground])

    return (
        <PageContainer page={page} nextPageAllowed={!!selectedBackground} onNextPageClick={() => {}}>
            <Title title="Vor welchem Hintergrund möchtest du stehen?" />
            <div className="flex flex-wrap justify-center gap-6 max-w-[1400px]">
                {
                    backgrounds.map((background) => (
                        <div key={background} className="flex flex-col gap-4 justify-center items-center w-[30%] min-w-[260px] transition-all duration-300 ease-in-out">
                            <div className={`p-[4px] border-2 ${selectedBackground === background ? "border-srf-r-600" : "border-transparent"} rounded-xl transition-all duration-300 ease-in-out`}>
                                <img src={`/assets/backgrounds/${background}.jpg`} alt={background} className="rounded-xl object-cover w-96 h-64" />
                            </div>
                            <button 
                                className={`py-3 px-8 ${selectedBackground === background ? "bg-srf-wg-700" : "bg-srf-r-700 hover:bg-srf-r-800"} text-white w-fit rounded-xl text-4xl font-regular duration-200 ease-in-out transition-all`}
                                onClick={() => { setSelectedBackground(background); }} >
                                {background}
                            </button>
                        </div>
                    ))
                }
            </div>
        </PageContainer>
    )
}