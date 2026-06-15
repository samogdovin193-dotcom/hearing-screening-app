import { useAppNavigation } from '../utils/navigation';
import { useNavigate } from 'react-router-dom';

export default function TestEarSelection() {
  const { go } = useAppNavigation();
  const navigate = useNavigate();

  const lang = new URLSearchParams(window.location.search).get("lang") || "sk";

  const selectEar = (side: 'lave' | 'prave') => {
    go('/manual', {
      mode: 'sluchadla',
      side
    });
  };

  return (
    <div className="">
      <div className="">
        <h1 className="">
          Zvoľ si <i>uško</i>,<br />ktoré hláskom pošteklím...
        </h1>

        <div className="space-y-6">
          <button
            onClick={() => selectEar('lave')}
            className=""
          >
            Ľavé uško
          </button>

          <button
            onClick={() => selectEar('prave')}
            className=""
          >
            Pravé uško
          </button>
        </div>

        <div className="">
          <button
            onClick={() => go('/select')}
            className=""
          >
            <img src="/assets/sk/images/back.png" alt="Späť" className="" />
          </button>
          <button
            onClick={() => navigate(`/?lang=${lang}`)}
            className=""
          >
            <img src="/assets/sk/images/home.png" alt="Domov" className="" />
          </button>
        </div>
      </div>
    </div>
  );
}