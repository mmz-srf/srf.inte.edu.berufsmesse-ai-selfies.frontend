"use client";

import StartPage from "@/components/pages/StartPage";
import { LocalStorageData } from "./libs/model";
import { useEffect, useState } from "react";
import { getLocalStorageData, saveDefaultData } from "./libs/utils";
import GenderPage from "@/components/pages/GenderPage";
import BackgroundPage from "@/components/pages/BackgroundPage";
import NamePage from "@/components/pages/NamePage";
import LoadingPage from "@/components/pages/LoadingPage";
import ResultPage from "@/components/pages/ResultPage";

export default function Home() {
    const [localStorageData, setLocalStorageData] = useState<LocalStorageData | null>(null);

    useEffect(() => {
        const storedData = getLocalStorageData();
        if (storedData) {
            setLocalStorageData(storedData);
        } else {
            saveDefaultData();
            setLocalStorageData(getLocalStorageData());
        }

        const handleStorage = () => {
            setLocalStorageData(getLocalStorageData());
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    if (!localStorageData) {
        return (
            <StartPage page={0} />
        );
    }

    switch (localStorageData.page) {
        case 0:
            return <StartPage page={localStorageData.page} />
        case 1:
            return <GenderPage page={localStorageData.page} />
        case 2:
            return <BackgroundPage page={localStorageData.page} />
        case 3:
            return <NamePage page={localStorageData.page} />
        case 4:
            return <LoadingPage page={localStorageData.page} />
        case 5:
            return <ResultPage page={localStorageData.page} />
        default:
            break;
    }

    return (
        <div className="flex h-full w-full items-center justify-center">
            <h1>An error occured</h1>
        </div>
    );
}
