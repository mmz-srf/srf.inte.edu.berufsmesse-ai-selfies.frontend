import { useEffect } from "react";

/**
 * Calls the handler for every key press on the page, used for the keyboard navigation (Enter = next step,
 * arrow keys = switch selection). Held-down keys only count once, so Enter can't skip several steps.
 * While an overlay marked with data-keyboard-navigation="off" is open (e.g. the admin menu), nothing is triggered.
 */
export function useKeyDown(handler: (event: KeyboardEvent) => void) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.repeat || document.querySelector('[data-keyboard-navigation="off"]')) {
                return;
            }
            handler(event);
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handler]);
}
