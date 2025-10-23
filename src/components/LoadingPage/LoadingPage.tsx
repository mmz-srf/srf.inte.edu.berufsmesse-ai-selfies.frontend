// @ts-ignore
import './LoadingPage.css';

export default function LoadingPage() {
    return (
        <div className="loading-page-container">
            <h1>Deine SRF Charakterkarte wird generiert</h1>
            <div className="loading-spinner">
                <div className="loader">
                    <div className="loader-inner">
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                        <div className="loader-block"></div>
                    </div>
                </div>
            </div>
            <h2>Platz in der Warteschleife: X/5</h2>
        </div>
    );
}