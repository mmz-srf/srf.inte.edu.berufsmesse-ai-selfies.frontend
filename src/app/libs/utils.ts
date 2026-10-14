import { backgroundResolutions } from "./config";
import { LocalStorageData } from "./model";

export function nextPage() {
    const currentPage = getLocalStorageData()?.page || 0;
    const nextPage = currentPage + 1;
    updatePage(nextPage);
    return nextPage;
}

export function previousPage() {
    const currentPage = getLocalStorageData()?.page || 1;
    let previousPage = currentPage - 1;

    updatePage(previousPage);
    return previousPage;
}

function updatePage(page: number) {
    setLocalStorageData({
        page: page,
        name: getLocalStorageData()?.name || "",
        background: getLocalStorageData()?.background || "Meteo",
        gender: getLocalStorageData()?.gender || "",
    });
}

export function getLocalStorageData(): LocalStorageData | null {
    const data = localStorage.getItem("pageData");
    if (data) {
        return JSON.parse(data) as LocalStorageData;
    }
    return null;
}

export function setLocalStorageData(data: LocalStorageData) {
    localStorage.setItem("pageData", JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
}

export function saveDefaultData() {
    const defaultData: LocalStorageData = {
        page: 0,
        name: "",
        background: "Arena",
        gender: "",
    };
    setLocalStorageData(defaultData);
}