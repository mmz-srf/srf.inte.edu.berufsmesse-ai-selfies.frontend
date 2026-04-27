import { nextPage, previousPage } from "@/app/libs/utils";
import Image from "next/image";

export default function Paging({ currentPage, nextPageAllowed, onNextPageClick }: { currentPage: number, nextPageAllowed: boolean, onNextPageClick: () => void }) {
    const iconLeft = "/icons/left.svg";
    const iconRight = "/icons/right.svg";

    if (currentPage === 0 || currentPage >= 4) {
        return null;
    }

    function handleNextPageClick() {
        if (nextPageAllowed) {
            nextPage();
            onNextPageClick();
        }
    }

    return (
        <div className="w-full flex flex-row items-center justify-around p-5 absolute bottom-32 left-0">
            <Image
                src={iconLeft}
                alt="Previous"
                width={52}
                height={52}
                className={`cursor-pointer ${currentPage === 0 ? "opacity-0 pointer-events-none" : ""}`}
                onClick={previousPage}
            />
            <Image
                src={iconRight}
                alt="Next"
                width={52}
                height={52}
                className={`cursor-pointer transition-opacity ${nextPageAllowed ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
                onClick={handleNextPageClick}
            />
        </div>
    )
}