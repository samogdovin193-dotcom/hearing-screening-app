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
    <div className="">
      <header className="">
        <h1 className="">Kartičky robota Tomáša</h1>
      </header>

      {/* Language Switch */}
      <div className="">
        <button onClick={handleLanguageSwitch}>
          {TEXTS[lang].switchLang}
        </button>
      </div>

      <p>Aplikácia pre laický skríning počutia.</p>
      <p>(Ak chceš pokračovať, klikni na robota.)</p>

      <div className="">
        <div className="">
          <div 
            className=""
          >
            <img 
              src="/assets/sk/images/default.gif" 
              alt="Robot Tomáš" 
              className=""
               onClick={() => go("/select")}
            />
            <p className="">
              Robot Tomáš to je pletko<br />
              horší ako Polepetko.
            </p><br />
            <p className="">
              Na kartičkách obrázkových<br />
              pozabúdal čo je na nich...
            </p><br />
            <p className="">
              Teraz milé detičky pomôžte mi<br />
              ku slovíčkam poukladáť kartičky.
            </p><br />
          </div>
        </div>

        <div className="">
          <p>
            Volám sa robot Tomáš. Prednedávnom som sa začal učiť tvoj jazyk a stala sa mi nemilá vec. 
            Dlho som si robil zbierku obrázkov a zvukov, ktoré k sebe patria a starostlivo som si ich ukladal.
          </p>
          <p>
            Bohužiaľ dnes som si všimol, že môj zoznam niekto poprehadzoval. Bol by som rád, ak by si mi pomohol priradiť nasledujúce obrázky k správnemu zvuku.
          </p><br />

          <p>
            "Kartičky robota Tomáša" je jednoduchá webová hra, ktorej cieľom je orientačne otestovať 
            schopnosť dieťaťa počuť a rozpoznať slová v slovenskom (prípadne rómskom) jazyku.
          </p>
          <p>
            Slová sú navrhnuté tak, aby pokrývali celú fonetickú škálu slovenčiny.
          </p><br />

          <div className="">
            <p>Táto aplikácia bola vytvorená na pôde slovenských univerzít:</p>
            <p>
              <a href="http://www.tuke.sk" target="_blank" className="">TUKE</a> a 
              <a href="https://www.upjs.sk" target="_blank" className=""> UPJŠ</a>
            </p>
            <p className="mt-2">
              Viac informácií: <a href="https://nlp.kemt.fei.tuke.sk/audiometry" target="_blank" className="">Audiometry</a>
            </p>
            <p>This application was developed on Slovak universities:</p>
            <p>
              <a href="http://www.tuke.sk" target="_blank" className="">TUKE</a> and 
              <a href="https://www.upjs.sk" target="_blank" className=""> UPJŠ</a>
            </p>
            <p className="mt-2">
              For more information: <a href="https://nlp.kemt.fei.tuke.sk/audiometry" target="_blank" className="">Audiometry</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}