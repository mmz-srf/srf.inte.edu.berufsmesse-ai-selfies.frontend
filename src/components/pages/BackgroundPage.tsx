import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";
import { useKeyDown } from "@/app/libs/useKeyDown";
import { LocalStorageData } from "@/app/libs/model";
import { getLocalStorageData, setLocalStorageData } from "@/app/libs/utils";

export default function BackgroundPage({ page }: { page: number }) {
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const backgrounds = [
        "Arena",
        "Meteo",
        "Tagesschau",
        "Radio",
        "Sport"
    ];

    // clicking a background saves it and continues to the next page right away
    function handleBackgroundSelect(background: string) {
        const data = getLocalStorageData();
        if (data) {
            setLocalStorageData({ ...data, background: background as LocalStorageData['background'], page: data.page + 1 });
        }
    }

    // arrow keys switch to the previous/next background, wrapping around at the ends, Enter confirms it
    useKeyDown((event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const index = selectedBackground ? backgrounds.indexOf(selectedBackground) : -1;
        const nextIndex = index === -1
            ? (step === 1 ? 0 : backgrounds.length - 1)
            : (index + step + backgrounds.length) % backgrounds.length;
        setSelectedBackground(backgrounds[nextIndex]);
    });

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
            <div className="flex flex-wrap justify-center gap-4 mt-4 sm:gap-6 w-full max-w-[1400px] px-2 sm:px-4 pb-20">
                {
                    backgrounds.map((background) => (
                        <div key={background} className="flex flex-col gap-3 sm:gap-4 justify-center items-center w-[46%] sm:w-[30%] min-w-[140px] sm:min-w-[220px] max-w-[340px] transition-all duration-300 ease-in-out">
                            <div className={`p-[4px] border-2 ${selectedBackground === background ? "border-srf-r-600" : "border-transparent"} rounded-xl transition-all duration-300 ease-in-out`}>
                                <img src={`/assets/backgrounds/${background}.jpg`} alt={background} className="rounded-xl object-cover w-full aspect-[3/2] cursor-pointer" onClick={() => handleBackgroundSelect(background)} />
                            </div>
                            <button 
                                className={`py-2 sm:py-3 px-4 sm:px-8 ${selectedBackground === background ? "bg-srf-wg-700" : "bg-srf-r-700 hover:bg-srf-r-800"} text-white w-fit rounded-xl text-xl sm:text-2xl lg:text-3xl font-regular duration-200 ease-in-out transition-all`}
                                onClick={() => handleBackgroundSelect(background)} >
                                {background}
                            </button>
                        </div>
                    ))
                }
            </div>
        </PageContainer>
    )
}