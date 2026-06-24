import { useSearchParams } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';

export default function StartGame() {
  const [searchParams] = useSearchParams();
  const { goHomeWithConfirm } = useAppNavigation();
  const { go } = useAppNavigation();

  const mode = searchParams.get('mode') || 'reproduktor';
  const side = searchParams.get('side');
  const lang = new URLSearchParams(window.location.search).get("lang") || "sk";
  const isCalibration = searchParams.get('calibration') === '1';

  const startTest = () => {
    go("/test", {
      mode,
      side,
      calibration: isCalibration ? "1" : null,
    });
  };

  return (
    <div>
      <header><h1>Kartičky robota Tomáša</h1></header>

      <p className="action-message">Teraz pomôž robotovi Tomášovi priradiť obrázok ku každému slovu, ktoré budeš počuť.</p>

      {/* Big Robot Clickable Image */}
      <div 
        onClick={startTest}
        className="start-game"
      >
        <img 
          src={`/assets/${lang}/images/default.gif`} 
          alt="Spustiť hru" 
          className="start-game-img"
        />
      </div>

      <div>
        <p className='action-message'>Skríningový test sa automaticky ukončí:</p>
        <p className='action-message'>- ak prejde cez všetkých 10 kôl</p>
        <p className='action-message'>- po 3 po sebe idúcich nesprávnych odpovediach</p>
        <p className='action-message'>- ak vyprší čas 15s po prehraní nahrávky a neklikne sa na žiaden obrázok</p>
        <p className='action-message'>(Test spustíš kliknutím na robota)<br /><br /></p>
      </div>

      {/* Navigation */}
      <div className="outer">
        <button onClick={() => go("/manual")} className='menu-button'>
          <img src="/assets/sk/images/back.png" alt="Späť" className="menu-btn" />
        </button>
        <button onClick={goHomeWithConfirm} className="menu-button">
          <img src="/assets/sk/images/home.png" alt="Domov" className="menu-btn" />
        </button>
      </div>
    </div>
  );
}