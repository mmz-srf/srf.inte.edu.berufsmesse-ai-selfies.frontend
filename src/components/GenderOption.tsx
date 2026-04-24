import Image from "next/image";

export default function GenderOption({ gender, onSelect, selected }: { gender: string, onSelect: () => void, selected: boolean }) {
    const iconSrc = gender === "male" ? "/assets/male.svg" : "/assets/female.svg";

    const imageSize = selected ? 240 : 220;

    return (
        <div className="h-full w-fit flex flex-col gap-8 items-center justify-center">
            <div onClick={onSelect}>
                <Image className="cursor-pointer transition-all duration-300 ease-in-out" src={iconSrc} alt={gender === "male" ? "Male" : "Female"} width={imageSize} height={imageSize} priority />
            </div>
            <button onClick={onSelect} className={`rounded-2xl py-5 px-8 ${selected ? "bg-srf-wg-800" : "bg-srf-r-700 hover:bg-srf-r-800"} text-white transition-all duration-200 ease-in-out text-4xl`}>
                {gender === "male" ? "Männlich" : "Weiblich"}
            </button>
        </div>
    )
}