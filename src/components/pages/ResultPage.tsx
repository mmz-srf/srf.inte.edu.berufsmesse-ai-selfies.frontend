import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import * as QRCode from "qrcode";
import { saveDefaultData } from "@/app/libs/utils";

export default function ResultPage({ page }: { page: number }) {
    const [resultImageBlock, setResultImageBlock] = useState<Blob | null>(null);

    function handleBackClick() {
        localStorage.removeItem("generatedImage");
        localStorage.removeItem("generatedImageUrl");
        saveDefaultData();
    }

    function handlePrintClick() {
        window.print();
    }

    useEffect(() => {
        const imageBase64 = localStorage.getItem("generatedImage");
        if (imageBase64) {
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const imageBlobResponse = new Blob([imageBuffer], { type: 'image/jpeg' });
            setResultImageBlock(imageBlobResponse);
        }

        const url = localStorage.getItem("generatedImageUrl")
        const qrCodeCanvas = document.getElementById('qr-code') as HTMLCanvasElement;
        if (qrCodeCanvas && url) {
            QRCode.toCanvas(
                qrCodeCanvas,
                url,
                function (error: any) {
                    if (error) console.error(error);
                }
            )
        }
    }, []);

    return (
        <PageContainer page={page} nextPageAllowed={false} onNextPageClick={() => {}}>
            <h1 className="text-7xl font-bold print:hidden">Vielen Dank fürs Mitmachen!</h1>
            <div className="flex-1 w-full items-center justify-center flex-col gap-4 flex">
                <div className="flex flex-row justify-around items-center w-2/3 mb-20 print:mb-0 print:w-full">
                    {resultImageBlock ? (
                        <img src={URL.createObjectURL(resultImageBlock)} alt="Generated Selfie" className="max-h-[30rem] object-cover rounded-xl print:max-h-none print:w-full print:rounded-none" />
                    ) : (
                        <div className="w-64 h-64 bg-gray-300 animate-pulse rounded-xl" />
                    )}
                    <canvas id="qr-code" className="print:hidden"></canvas>
                </div>

                <p className="font-regular text-4xl text-center print:hidden">Du kannst innerhalb von den nächsten<br/>90 Tagen dein Foto herunterladen</p>

                <div className="flex flex-row gap-6 print:hidden">
                    <button
                        className="py-3 px-8 bg-srf-r-700 hover:bg-srf-r-800 text-white rounded-xl text-2xl sm:text-3xl font-regular transition-all duration-200 ease-in-out"
                        onClick={handleBackClick}
                    >
                        Zurück
                    </button>
                    <button
                        className="py-3 px-8 bg-srf-wg-700 hover:bg-srf-wg-800 text-white rounded-xl text-2xl sm:text-3xl font-regular transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={handlePrintClick}
                        disabled={!resultImageBlock}
                    >
                        Drucken
                    </button>
                </div>
            </div>
        </PageContainer>
    )
}