import { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import * as QRCode from "qrcode";
import { saveDefaultData } from "@/app/libs/utils";
import { sendImageToPrinter } from "@/service/backendService";
import { clearGeneratedImage, getGeneratedImage } from "@/service/imageStore";
import { CircleCheck, CircleX } from "lucide-react";

type PrintStatus = 'idle' | 'sending' | 'success' | 'error';

const PRINT_FEEDBACK_DURATION_MS = 4000;

export default function ResultPage({ page }: { page: number }) {
    const [resultImageBlock, setResultImageBlock] = useState<Blob | null>(null);
    const [printStatus, setPrintStatus] = useState<PrintStatus>('idle');

    function handleBackClick() {
        clearGeneratedImage().catch((error) => console.error('Error clearing generated image:', error));
        localStorage.removeItem("generatedImageUrl");
        saveDefaultData();
    }

    // Drops the image into the printer share on the Raspberry Pi instead of opening the browser print dialog
    async function handlePrintClick() {
        setPrintStatus('sending');
        try {
            await sendImageToPrinter();
            setPrintStatus('success');
        } catch (error) {
            console.error('Error sending image to printer:', error);
            setPrintStatus('error');
        }
    }

    useEffect(() => {
        if (printStatus !== 'success' && printStatus !== 'error') return;
        const timeout = setTimeout(() => setPrintStatus('idle'), PRINT_FEEDBACK_DURATION_MS);
        return () => clearTimeout(timeout);
    }, [printStatus]);

    useEffect(() => {
        getGeneratedImage()
            .then((imageBase64) => {
                if (imageBase64) {
                    const imageBuffer = Buffer.from(imageBase64, 'base64');
                    const imageBlobResponse = new Blob([imageBuffer], { type: 'image/jpeg' });
                    setResultImageBlock(imageBlobResponse);
                }
            })
            .catch((error) => console.error('Error loading generated image:', error));

        const url = localStorage.getItem("generatedImageUrl")
        const qrCodeCanvas = document.getElementById('qr-code') as HTMLCanvasElement;
        if (qrCodeCanvas && url) {
            QRCode.toCanvas(
                qrCodeCanvas,
                url,
                { width: 360, color: { dark: '#000000', light: '#ffffff00' } },
                function (error: any) {
                    if (error) console.error(error);
                }
            )
        }
    }, []);

    return (
        <PageContainer page={page} nextPageAllowed={false} onNextPageClick={() => {}}>
            <h1 className="text-7xl font-bold print:hidden">Vielen Dank fürs Mitmachen!</h1>
            <div className="flex flex-1 w-full items-center justify-center flex-col gap-4">
                <div className="flex flex-row justify-around items-center w-2/3 mb-10 print:mb-0 print:w-full">
                    {resultImageBlock ? (
                        <img src={URL.createObjectURL(resultImageBlock)} alt="Generated Selfie" className="max-h-120 object-cover rounded-xl print:max-h-none print:w-full print:rounded-none" />
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
                        Neues Bild
                    </button>
                    <button
                        className="py-3 px-8 bg-srf-r-700 hover:bg-srf-r-800 text-white rounded-xl text-2xl sm:text-3xl font-regular transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={handlePrintClick}
                        disabled={!resultImageBlock || printStatus === 'sending'}
                    >
                        {printStatus === 'sending' ? 'Wird gesendet…' : 'Drucken'}
                    </button>
                </div>
            </div>

            {(printStatus === 'success' || printStatus === 'error') && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center print:hidden" onClick={() => setPrintStatus('idle')}>
                    <div className="bg-white p-12 rounded-xl shadow-lg flex flex-col items-center gap-6">
                        {printStatus === 'success' ? (
                            <>
                                <CircleCheck className="w-32 h-32 text-green-600" />
                                <p className="text-4xl font-bold text-center">Dein Bild wird gedruckt!</p>
                            </>
                        ) : (
                            <>
                                <CircleX className="w-32 h-32 text-srf-r-700" />
                                <p className="text-4xl font-bold text-center">Drucken fehlgeschlagen</p>
                                <p className="text-2xl text-center">Bitte versuche es nochmals oder melde dich beim Team.</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </PageContainer>
    )
}