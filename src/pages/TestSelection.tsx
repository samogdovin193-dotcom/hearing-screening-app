import { useAppNavigation } from '../utils/navigation';

export default function TestSelection() {
  const { go } = useAppNavigation();

  return (
    <div className="">
      <h1 className="">Nastavme si ušká</h1>

      <div 
            className=""
          >
            <img 
              src="/assets/sk/images/usi_zajac.jpg"
            />
          </div>
          <p className="">
            Mám dve ušká<br />
            na obe,<br />
            reproduktor pomôže.<br />
            Ak chcem skúšať najprv pravé<br />
            a potom zas, druhé, ľavé<br />
            nasadím si slúchadlá<br />
            ako také tykadlá ...
          </p><br />
          <p className="">
            Kuk :). Tu si môžeš vybrať, či chceš na testovanie použiť:
          </p>
          <p className="">
            - vstavaný reproduktor tvojho zariadenia (mobilu, tabletu, počítača), alebo<br />
            - chceš otestovať každé uško zvášť pomocou slúchadiel. :)
          </p><br />

      <div className="">
        <button
          onClick={() => go("/manual", { mode: "reproduktor" })}
          className=""
        >
          Reproduktor
        </button>

        <button
          onClick={() => go("/select-ear")}
          className=""
        >
          Slúchadlá (ľavé / pravé ucho)
        </button>
      </div>
    </div>
  );
}