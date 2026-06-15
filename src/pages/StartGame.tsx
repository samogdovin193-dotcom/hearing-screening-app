import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';

export default function StartGame() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    <div className="">
      <div className="">
        <header className="">
          <h1 className="">Kartičky robota Tomáša</h1>
        </header>

        <p className="">
          Teraz pomôž robotovi Tomášovi priradiť obrázok ku každému slovu, ktoré budeš počuť.
        </p>

        {/* Big Robot Clickable Image */}
        <div className="">
          <div 
            onClick={startTest}
            className=""
          >
            <img 
              src={`/assets/${lang}/images/default.gif`} 
              alt="Spustiť hru" 
              className=""
            />
          </div>
        </div>

        <div className="">
          <p className="">Skríningový test sa automaticky ukončí:</p>
          <ul className="">
            <li className="">
              <span className="">•</span>
              ak prejde cez všetkých 10 kôl
            </li>
            <li className="">
              <span className="">•</span>
              po 3 po sebe idúcich nesprávnych odpovediach
            </li>
            <li className="">
              <span className="">•</span>
              ak vyprší čas 15s po prehraní nahrávky a neklikne sa na žiaden obrázok
            </li>
          </ul>
          <p className="">
            (Test spustíš kliknutím na robota)
          </p>
        </div>

        {/* Navigation */}
        <div className="">
          <button onClick={() => go("/manual")}>
            <img src="/assets/sk/images/back.png" alt="Späť" className="" />
          </button>
          <button onClick={() => navigate(`/?lang=${lang}`)} className="">
            <img src="/assets/sk/images/home.png" alt="Domov" className="" />
          </button>
        </div>
      </div>
    </div>
  );
}