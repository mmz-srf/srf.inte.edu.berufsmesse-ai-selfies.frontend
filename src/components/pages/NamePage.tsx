import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";

export default function NamePage({page}: { page: number }) {
    const [name, setName] = useState<string>("");

    useEffect(() => {
        const storedData = localStorage.getItem("pageData");
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data.name) {
                setName(data.name);
            }
        }
    }, [])

    function handleNextPageClick() {
        const storedData = localStorage.getItem("pageData");
        if (storedData) {
            const data = JSON.parse(storedData);
            data.name = name;
            localStorage.setItem("pageData", JSON.stringify(data));
            window.dispatchEvent(new Event("storage"));
        }
    }

    return (
        <PageContainer page={page} nextPageAllowed={!!name} onNextPageClick={handleNextPageClick}>
            <Title title="Wie ist dein Vorname?" />
            <div className="w-full flex-1 mb-80 flex justify-center items-center flex-col gap-16">
                <input type="text" maxLength={32} value={name} onChange={(e) => setName(e.target.value)} className="text-7xl p-4 rounded-xl focus:outline-none bg-srf-gs-100" />
            </div>
        </PageContainer>
    )
}