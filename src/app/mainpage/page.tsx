"use client";

import ResultPage from "@/components/ResultPage/ResultPage";
import UploadPhoto from "@/components/UploadPhoto/UploadPhoto";

export default function Home() {
    return (
        <div>
            <img src="/icons/SRF.png" alt="SRF Logo" className="srf-logo" />
            {/*<UploadPhoto />}*/}
            <ResultPage />
        </div>
    );
}
