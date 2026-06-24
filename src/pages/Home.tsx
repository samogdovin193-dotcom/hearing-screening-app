import { useAppNavigation } from '../utils/navigation';

export default function Home() {
  const { go, switchLang, getLang } = useAppNavigation();
  
  const lang = getLang() as "sk" | "rom";

  type Lang = "sk" | "rom";

  const handleLanguageSwitch = () => {
    if (confirm("Naozaj chcete prepnúť jazyk?")) {
      switchLang();
    }
  };

  const TEXTS: Record<Lang, { switchLang: React.ReactNode }> = {
    sk: {
      switchLang: (
        <>
          Prejsť na verziu<br />
          pre rómsky jazyk
        </>
      ),
    },
    rom: {
      switchLang: (
        <>
          Prejsť na verziu<br />
          pre slovenský jazyk
        </>
      ),
    }
  };

  return (
    <div>
      <header>
        <h1>Kartičky robota Tomáša</h1>
      </header>

      <div className='top-controls'>
        {/* Language Switch */}
        <div className="lang-switch-wrapper">
          <button onClick={handleLanguageSwitch} id='lang-switch'>
            {TEXTS[lang].switchLang}
          </button>
        </div>

        {/* Settings button */}
        <div className='settings-wrapper'>
          <button id='settings-btn'>
            <img src="/assets/sk/images/settings.png" alt="Nastavenia" />
          </button>
        </div>
      </div>

      <br />
      <p className='action-message'>Aplikácia pre laický skríning počutia.</p>
      <p className='action-message'>(Ak chceš pokračovať, klikni na robota.)</p>


      <div className="robot-wrapper robot-wrapper--with-text">
        <div className="robot-section">
          <img
            src="/assets/sk/images/default.gif" 
            alt="Robot Tomáš" 
            onClick={() => go("/select")}
          />
        </div>
        <div>
          <p className="action-message purple" ><i>
            Robot Tomáš   <br />
            to je pletko  <br />
            horší ako     <br />
            Polepetko.    <br />
                          <br />
            Na kartičkách obrázkových     <br />
            pozabúdal čo je na nich...    <br />
                                          <br />
            Teraz milé detičky            <br /> 
            pomôžte mi                    <br />
            ku slovíčkam                  <br />
            poukladáť kartičky.           <br />
          </i></p>
        </div>
      </div>

      <div>
        <p className='action-message'>
          Volám sa robot Tomáš. Prednedávnom som sa začal učiť tvoj jazyk a stala sa mi nemilá vec. 
          Dlho som si robil zbierku obrázkov a zvukov, ktoré k sebe patria a starostlivo som si ich ukladal.
        </p>
        <p className='action-message'>
          Bohužiaľ dnes som si všimol, že môj zoznam niekto poprehadzoval. Bol by som rád, ak by si mi pomohol priradiť nasledujúce obrázky k správnemu zvuku.
        </p><br />

        <p className='text-simple'>
          "Kartičky robota Tomáša" je jednoduchá webová hra,<br /> ktorej cieľom je orientačne otestovať 
          schopnosť dieťaťa počuť a rozpoznať slová v slovenskom (prípadne rómskom) jazyku. <br />
          Slová sú navrhnuté tak, aby pokrývali celú fonetickú škálu slovenčiny.
        </p><br />

        <div>
          <p className='text-simple'>Táto aplikácia bola vytvorená na pôde slovenských univerzít: <a href="http://www.tuke.sk" target="_blank" className="">TUKE</a> a <a href="https://www.upjs.sk" target="_blank" className=""> UPJŠ</a></p>
          <p className='text-simple'>Pre viac informácií: <a href="https://nlp.kemt.fei.tuke.sk/audiometry" target="_blank" className="">Audiometry</a></p>
          <p className='text-simple'>This application was developed on Slovak universities: <a href="http://www.tuke.sk" target="_blank" className="">TUKE</a> and <a href="https://www.upjs.sk" target="_blank" className=""> UPJŠ</a></p>
          <p className='text-simple'>For more information: <a href="https://nlp.kemt.fei.tuke.sk/audiometry" target="_blank" className="">Audiometry</a></p>
        </div>
      </div>
    </div>
  );
}