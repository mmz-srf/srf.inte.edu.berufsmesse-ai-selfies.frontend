import { nextPage, previousPage } from "@/app/libs/utils";
import { useKeyDown } from "@/app/libs/useKeyDown";
import Image from "next/image";

export default function Paging({ currentPage, nextPageAllowed, onNextPageClick }: { currentPage: number, nextPageAllowed: boolean, onNextPageClick: () => void }) {
    const iconLeft = "/icons/left.svg";
    const iconRight = "/icons/right.svg";

    function handleNextPageClick() {
        if (nextPageAllowed) {
            nextPage();
            onNextPageClick();
        }
    }

    // Enter works like the "next" arrow, also on the start page (which has no arrows)
    useKeyDown((event) => {
        if (event.key !== "Enter" || currentPage >= 4 || !nextPageAllowed) {
            return;
        }
        // a focused button (e.g. "Jetzt ins Studio") would otherwise also be clicked and skip a second step
        event.preventDefault();
        handleNextPageClick();
    });

    if (currentPage === 0 || currentPage >= 4) {
        return null;
    }

    return (
        <div className="w-full flex flex-row items-center justify-around py-5 absolute bottom-4 sm:bottom-6 lg:bottom-8 left-0">
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
                className={`cursor-pointer transition-opacity ${currentPage == 1 ? "opacity-100" : "opacity-0"}`}
                onClick={handleNextPageClick}
            />
        </div>
    )
}