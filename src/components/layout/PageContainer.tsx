import { useEffect, useRef, useState } from "react";
import AdminMenu from "../components/AdminMenu";
import CatMode from "../components/CatMode";
import Navbar from "./Navbar"
import Paging from "./Paging";

const CORNER_SIZE = 150;
const CORNER_CLICKS_REQUIRED = 5;
const CORNER_CLICK_WINDOW_MS = 2000;
const CAT_MODE_DURATION_MS = 5000;

type Corner = 'admin' | 'cat';

function getCorner(x: number, y: number): Corner | null {
    if (x >= window.innerWidth - CORNER_SIZE && y <= CORNER_SIZE) return 'admin';
    if (x <= CORNER_SIZE && y >= window.innerHeight - CORNER_SIZE) return 'cat';
    return null;
}

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

        const [isAdminOpen, setIsAdminOpen ] = useState(false);
        const [adminUsername, setAdminUsername] = useState<string>('');
        const [adminPassword, setAdminPassword] = useState<string>('');
        const [adminPath, setAdminPath] = useState<string>('');

        const [catModeId, setCatModeId] = useState<number | null>(null);
        const catModeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

        const cornerClicks = useRef<{ corner: Corner | null, count: number }>({ corner: null, count: 0 });
        const cornerClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

        // Hidden corner triggers: 5 quick taps top-right open the admin menu, bottom-left start cat mode
        useEffect(() => {
            function startCatMode() {
                setCatModeId(Date.now());
                if (catModeTimeout.current) clearTimeout(catModeTimeout.current);
                catModeTimeout.current = setTimeout(() => {
                    setCatModeId(null);
                }, CAT_MODE_DURATION_MS);
            }

            function handleClick(event: MouseEvent) {
                const corner = getCorner(event.clientX, event.clientY);
                if (!corner || corner !== cornerClicks.current.corner) {
                    cornerClicks.current = { corner, count: 0 };
                }
                if (!corner) return;

                cornerClicks.current.count += 1;
                if (cornerClickTimeout.current) clearTimeout(cornerClickTimeout.current);
                cornerClickTimeout.current = setTimeout(() => {
                    cornerClicks.current = { corner: null, count: 0 };
                }, CORNER_CLICK_WINDOW_MS);

                if (cornerClicks.current.count >= CORNER_CLICKS_REQUIRED) {
                    cornerClicks.current = { corner: null, count: 0 };
                    if (corner === 'admin') setIsAdminOpen(true);
                    else startCatMode();
                }
            }

            window.addEventListener('click', handleClick);
            return () => {
                window.removeEventListener('click', handleClick);
                if (cornerClickTimeout.current) clearTimeout(cornerClickTimeout.current);
                if (catModeTimeout.current) clearTimeout(catModeTimeout.current);
            };
        }, []);

        function onCloseAdminMenu(username: string, password: string, path: string) {
            setIsAdminOpen(false);
            setAdminUsername(username);
            setAdminPassword(password);
            setAdminPath(path);
        }

        return (
            <div className="min-h-screen w-full flex flex-col relative">
                <AdminMenu open={isAdminOpen} onClose={onCloseAdminMenu} />
                {catModeId !== null && <CatMode key={catModeId} durationMs={CAT_MODE_DURATION_MS} />}
                <Navbar />
                <div className={`flex flex-col items-center justify-start w-full flex-1 p-8 ${catModeId !== null ? "cat-mode-active" : ""}`}>
                    {children}
                </div>
                <Paging currentPage={page} nextPageAllowed={nextPageAllowed} onNextPageClick={onNextPageClick} />
            </div>
        );
}