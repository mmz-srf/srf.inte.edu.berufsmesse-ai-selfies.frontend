import PageContainer from "../layout/PageContainer";
import PlaceHolderImage from "../../../public/icons/placeholder.png";
import { nextPage } from "@/app/libs/utils";

export default function StartPage({page}: { page: number }) {
    return (
        <PageContainer page={page} nextPageAllowed={true} onNextPageClick={() => {}}>
            <h1 className="text-8xl font-bold">Steh im SRF-Studio</h1>
            <p className="text-5xl font-regular">In 1 Minute zu deinem SRF-Foto</p>
            <img src={PlaceHolderImage.src} alt="Placeholder" className="w-[750px] h-[550px] rounded-2xl mt-8" />
            <button 
                className="bg-srf-r-700 text-white p-8 font-bold text-6xl rounded-2xl hover:bg-srf-r-800 transition-all duration-200 ease-in-out"
                onClick={nextPage}
            >
                Jetzt ins Studio
                </button>
        </PageContainer>
    )
}