import hamsterTransparent from '../assets/HAMSTER TRANSPARENT.png';
import logomaking from '../assets/logomaking.jpg';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <img src={hamsterTransparent} alt="Hamster Transparent" className="h-12" />
        <span>© 2025 CryptoGrind</span>
      </div>
      <div>
        <img src={logomaking} alt="Logo Making" className="h-12" />
      </div>
    </footer>
  );
}

export default Footer;