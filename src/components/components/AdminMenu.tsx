import { useState } from "react";

const ADMIN_PASSWORD = "jonathan_123";

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
        onClose(existingPath);
    }

    const labelClass = "block mb-1 text-sm text-srf-gs-800";
    const inputClass = "w-full px-3 py-2 rounded-lg border border-srf-gs-200 bg-srf-gs-10 text-srf-gs-900 focus:outline-none focus:border-srf-r-700 focus:ring-2 focus:ring-srf-r-700/20";
    const primaryButtonClass = "w-full py-2 px-4 bg-srf-r-700 text-white rounded-lg hover:bg-srf-r-800 disabled:opacity-50";
    const secondaryButtonClass = "w-full py-2 px-4 bg-srf-gs-100 text-srf-gs-900 rounded-lg hover:bg-srf-gs-200";

    const existingPath = localStorage.getItem("printerPath") || "~/to_printer";

    if (!unlocked) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md">
                <h2 className="text-2xl font-bold mb-6">Admin Menu</h2>
                <div className="flex flex-col gap-4 mb-6">
                    <div>
                        <label htmlFor="path" className={labelClass}>Path</label>
                        <input id="path" type="text" autoComplete="off" className={inputClass} value={existingPath} readOnly />
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