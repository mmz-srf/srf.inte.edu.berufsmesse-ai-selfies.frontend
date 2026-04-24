import SRFLogo from "../../../public/icons/SRF.png";

export default function Navbar() {
 return (
    <nav className="w-full p-6 flex flex-row items-center justify-start">
        <img src={SRFLogo.src} alt="SRF Logo" className="h-12" />
    </nav>
 )
}