import Image from "next/image";

export default function GenderOption({ gender, onSelect, selected }: { gender: string, onSelect: () => void, selected: boolean }) {
    const iconSrc = gender === "male" ? "/assets/male.svg" : "/assets/female.svg";

    return (
        <div className="h-full w-fit flex flex-col gap-5 sm:gap-7 items-center justify-center">
            <div onClick={onSelect}>
                <Image
                    className={`cursor-pointer transition-all duration-300 ease-in-out w-[130px] sm:w-[180px] lg:w-[220px] h-auto ${selected ? "scale-105" : "scale-100"}`}
                    src={iconSrc}
                    alt={gender === "male" ? "Male" : "Female"}
                    width={220}
                    height={220}
                    priority
                    sizes="(max-width: 640px) 130px, (max-width: 1024px) 180px, 220px"
                />
            </div>
            <button onClick={onSelect} className={`rounded-2xl py-3 sm:py-4 px-5 sm:px-7 ${selected ? "bg-srf-wg-800" : "bg-srf-r-700 hover:bg-srf-r-800"} text-white transition-all duration-200 ease-in-out text-2xl sm:text-3xl lg:text-4xl`}>
                {gender === "male" ? "Männlich" : "Weiblich"}
            </button>
        </div>
    )
}