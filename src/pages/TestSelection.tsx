import { useAppNavigation } from '../utils/navigation';

export default function TestSelection() {
  const { go } = useAppNavigation();

  return (
    <div>
      <header>
        <h1>Nastavme si ušká</h1>
      </header><br />

      <img className='img-zajac' src="/assets/sk/images/usi_zajac.jpg"/>
      <br />

      <p className="action-message purple">
        Mám dve ušká          <br />
        na obe,               <br />
        reproduktor pomôže.   <br />

        Ak chcem skúšať najprv pravé  <br />
        a potom zas, druhé, ľavé      <br />
        nasadím si slúchadlá          <br />
        ako také tykadlá ...          <br />
      </p>

      <p className="text-simple"><br />
        <b>Kuk :). Tu si môžeš vybrať, či chceš na testovanie použiť: </b>
        <br /><br />
        - <i><b>vstavaný reproduktor</b></i> tvojho zariadenia (mobilu, tabletu, počítača), alebo
        <br />
        - chceš <i>otestovať každé uško zvášť <b> pomocou slúchadiel.</b> :)</i>
        <br /><br />
      </p>

      <div className="outer">
        <button
          onClick={() => go("/manual", { mode: "reproduktor" })}
          className="button"
        >
          Reproduktor
        </button>

        <button
          onClick={() => go("/select-ear")}
          className="button"
        >
          Slúchadlá
        </button>
      </div>
    </div>
  );
}