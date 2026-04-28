import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";
import { LocalStorageData } from "@/app/libs/model";
import GenderOption from "../GenderOption";

export default function GenderPage({ page}: { page: number }) {
    const [gender, setGender] = useState<string | null>(null);
    const [maleSelected, setMaleSelected] = useState(false);
    const [femaleSelected, setFemaleSelected] = useState(false);

    function handleGenderSelect(selectedGender: string) {
        setGender(selectedGender);
        setMaleSelected(selectedGender === "male");
        setFemaleSelected(selectedGender === "female");
    }

    useEffect(() => {
        const storedData = localStorage.getItem("pageData");
        if (storedData) {
            const data: LocalStorageData = JSON.parse(storedData);
            if (data.gender) {
                setGender(data.gender);
                setMaleSelected(data.gender === "male");
                setFemaleSelected(data.gender === "female");
            }
        }
    }, []);

    function handleNextPageClick() {
        // save selected gender to local storage
        const storedData = localStorage.getItem("pageData");
        if (storedData) {
            const data: LocalStorageData = JSON.parse(storedData);
            data.gender = gender as 'male' | 'female';
            localStorage.setItem("pageData", JSON.stringify(data));
            window.dispatchEvent(new Event("storage"));
        }
    }

    return (
        <PageContainer page={page} nextPageAllowed={!!gender} onNextPageClick={handleNextPageClick}>
            <Title title="Wie möchtest du angesprochen werden?" />
            <div className="w-full max-w-4xl h-full items-center justify-center sm:justify-around flex flex-row flex-wrap gap-8 sm:gap-12 mt-6 sm:mt-10 px-4">
                <GenderOption gender="male" onSelect={() => { handleGenderSelect("male") }} selected={maleSelected} />
                <GenderOption gender="female" onSelect={() => { handleGenderSelect("female") }} selected={femaleSelected} />
            </div>
        </PageContainer>
    )
}