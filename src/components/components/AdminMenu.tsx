import { useEffect, useState } from "react";
import type { Statistics } from "@/app/libs/statistics";

const ADMIN_PASSWORD = "jonathan_123";
const DEFAULT_PRINTER_PATH = "/home/berufsmesse/to_printer";

interface AdminMenuProps {
    open: boolean;
    onClose: (path: string) => void;
    path?: string;
}

export default function AdminMenu(
    { 
        open, 
        onClose,
    }: AdminMenuProps
){
    const [unlocked, setUnlocked] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [unlockError, setUnlockError] = useState('');

    const [printerPath, setPrinterPath] = useState(DEFAULT_PRINTER_PATH);
    const [statistics, setStatistics] = useState<Statistics | null>(null);

    useEffect(() => {
        if (open) {
            setPrinterPath(localStorage.getItem("printerPath") || DEFAULT_PRINTER_PATH);
        }
    }, [open]);

    useEffect(() => {
        if (!unlocked) return;
        fetch('/api/statistics')
            .then((response) => response.ok ? response.json() : null)
            .then(setStatistics)
            .catch((error) => console.error('Error loading statistics:', error));
    }, [unlocked]);

    if (!open) return null;

    function handleUnlock(event: React.FormEvent) {
        event.preventDefault();
        if (adminPasswordInput === ADMIN_PASSWORD) {
            setUnlocked(true);
            setUnlockError('');
        } else {
            setUnlockError('Wrong password');
        }
        setAdminPasswordInput('');
    }

    // Lock again on close so every opening asks for the password
    function handleClose() {
        setUnlocked(false);
        setUnlockError('');
        setAdminPasswordInput('');
        onClose(printerPath);
    }

    const labelClass = "block mb-1 text-sm text-srf-gs-800";
    const inputClass = "w-full px-3 py-2 rounded-lg border border-srf-gs-200 bg-srf-gs-10 text-srf-gs-900 focus:outline-none focus:border-srf-r-700 focus:ring-2 focus:ring-srf-r-700/20";
    const primaryButtonClass = "w-full py-2 px-4 bg-srf-r-700 text-white rounded-lg hover:bg-srf-r-800 disabled:opacity-50";
    const secondaryButtonClass = "w-full py-2 px-4 bg-srf-gs-100 text-srf-gs-900 rounded-lg hover:bg-srf-gs-200";


    if (!unlocked) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" data-keyboard-navigation="off">
                <form onSubmit={handleUnlock} className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md">
                    <h2 className="text-2xl font-bold mb-6">Admin Menu</h2>
                    <div className="mb-6">
                        <label htmlFor="admin-password" className={labelClass}>Admin password</label>
                        <input id="admin-password" type="password" autoComplete="off" autoFocus className={inputClass} value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} />
                        {unlockError && <p className="mt-2 text-sm text-srf-r-700">{unlockError}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <button type="submit" className={primaryButtonClass} disabled={!adminPasswordInput}>
                            Unlock
                        </button>
                        <button type="button" className={secondaryButtonClass} onClick={handleClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" data-keyboard-navigation="off">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md">
                <h2 className="text-2xl font-bold mb-6">Admin Menu</h2>
                <div className="flex flex-col gap-4 mb-6">
                    <div>
                        <label htmlFor="path" className={labelClass}>Path</label>
                        <input id="path" type="text" autoComplete="off" className={inputClass} value={printerPath} onChange={(e) => setPrinterPath(e.target.value)} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">Statistics</h3>
                        {!statistics ? (
                            <p className="text-sm text-srf-gs-800">Statistics unavailable</p>
                        ) : Object.keys(statistics.days).length === 0 ? (
                            <p className="text-sm text-srf-gs-800">No statistics recorded yet</p>
                        ) : (
                            <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
                                {Object.entries(statistics.days).sort(([a], [b]) => b.localeCompare(a)).map(([day, daily]) => (
                                    <div key={day}>
                                        <h4 className="font-bold">{new Date(`${day}T00:00:00`).toLocaleDateString('de-CH')}</h4>
                                        <dl className="pl-5 grid grid-cols-[1fr_auto] text-sm font-normal gap-x-4 gap-y-1 text-srf-gs-900">
                                            <dt>Finished results</dt>
                                            <dd className="text-right">{daily.totalResults}</dd>
                                            <dt>Prints</dt>
                                            <dd className="text-right">{daily.totalPrints}</dd>
                                        </dl>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    className={primaryButtonClass}
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}