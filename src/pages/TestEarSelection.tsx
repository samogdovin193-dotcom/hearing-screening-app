import { useAppNavigation } from '../utils/navigation';

export default function TestEarSelection() {
  const { go } = useAppNavigation();
  const { goHomeWithConfirm } = useAppNavigation();

  const selectEar = (side: 'lave' | 'prave') => {
    go('/manual', {
      mode: 'sluchadla',
      side
    });
  };

  return (
    <div>
      <header><h1 className="">Zvoľ si <i>uško</i>,<br />ktoré hláskom pošteklím ...</h1></header>

      <br /><br /><br />

      <div className="outer">
        <button
          onClick={() => selectEar('lave')}
          className="button"
        >
          Ľavé uško
        </button>

        <button
          onClick={() => selectEar('prave')}
          className="button"
        >
          Pravé uško
        </button>
      </div>

      <br /><br /><br />
      <div className="outer">
        <button
          onClick={() => go('/select')}
          className="menu-button"
        >
          <img src="/assets/sk/images/back.png" alt="Späť" className="menu-btn" />
        </button>
        <button
          onClick={goHomeWithConfirm}
          className="menu-button"
        >
          <img src="/assets/sk/images/home.png" alt="Domov" className="menu-btn" />
        </button>
      </div>
    </div>
  );
}