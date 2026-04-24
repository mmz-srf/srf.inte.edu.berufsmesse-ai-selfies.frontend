import PageContainer from "../layout/PageContainer";
import Title from "../Title";

export default function ResultPage({ page }: { page: number }) {
    return (
        <PageContainer page={page} nextPageAllowed={false} onNextPageClick={() => {}}>
            <h1 className="text-7xl font-bold">Vielen Dank fürs Mitmachen!</h1>
            <div className="flex-1 w-full items-center justify-center flex-col gap-20 flex">
                <div className="flex flex-row justify-around items-center w-2/3 mb-20">
                    <img src="/icons/placeholder.png" alt="" />
                    <img src="/icons/qr-code.png" alt="" className="w-64 h-64" />
                </div>

                <p className="font-regular text-4xl text-center">Du kannst innerhalb von den nächsten<br/>90 Tagen dein Foto herunterladen</p>
            </div>
        </PageContainer>
    )
}