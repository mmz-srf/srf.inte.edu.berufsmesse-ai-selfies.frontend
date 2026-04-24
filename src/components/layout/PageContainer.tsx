import Navbar from "./Navbar"
import Paging from "./Paging";

export default function PageContainer(
    { 
        children, 
        page, 
        nextPageAllowed, 
        onNextPageClick 
    }: { 
        children: React.ReactNode, 
        page: number, 
        nextPageAllowed: boolean, 
        onNextPageClick: () => void }
    ) {
        return (
            <div className="min-h-screen w-full flex flex-col relative">
                <Navbar />
                <div className="flex flex-col items-center justify-start w-full flex-1 gap-8 p-8">
                    {children}
                </div>
                <Paging currentPage={page} nextPageAllowed={nextPageAllowed} onNextPageClick={onNextPageClick} />
            </div>
        );
}