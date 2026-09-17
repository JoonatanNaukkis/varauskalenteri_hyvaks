import { useState } from "react";

type ShiftStatus = "Varattu" | "Ilmoitus lähetetty";
type Shift = {
  id: string;
  date: string;
  weekday: string;
  start: string;
  end: string;
  unit: string;
  line: string;
  status: ShiftStatus;
};

const shifts: Shift[] = [
  {
    id: "shift-1",
    date: "12.10.2026",
    weekday: "Maanantai",
    start: "16.00",
    end: "22.00",
    unit: "Keskussairaala",
    line: "Päivystyslinja A",
    status: "Varattu",
  },
  {
    id: "shift-2",
    date: "24.10.2026",
    weekday: "Lauantai",
    start: "08.00",
    end: "16.00",
    unit: "Keskussairaala",
    line: "Päivystyslinja B",
    status: "Ilmoitus lähetetty",
  },
  {
    id: "shift-3",
    date: "02.11.2026",
    weekday: "Maanantai",
    start: "16.00",
    end: "22.00",
    unit: "Keskussairaala",
    line: "Päivystyslinja A",
    status: "Varattu",
  },
];

function StatusBadge({ status }: { status: ShiftStatus }) {
  return <span className={`status status--${status === "Varattu" ? "reserved" : "sent"}`}>{status}</span>;
}

function App() {
  const [mode, setMode] = useState<"loading" | "ready" | "empty" | "error" | "success">("ready");
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  const showSuccess = (id: string) => {
    setSelectedShift(id);
    setMode("success");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Päivystys, etusivu">
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>Päivystys</span>
        </a>
        <nav aria-label="Päänavigaatio">
          <a className="nav-link nav-link--active" href="#vuorot">Omat vuorot</a>
          <a className="nav-link" href="#ohjeet">Ohjeet</a>
        </nav>
        <div className="user-menu">
          <span className="avatar" aria-hidden="true">TL</span>
          <span className="user-name">Testi Lääkäri</span>
        </div>
      </header>

      <main id="vuorot" className="content">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Päivystäjän näkymä</p>
            <h1 id="page-title">Omat vuorot</h1>
            <p className="intro">Tarkista tulevat päivystysvuorosi ja täydennä vuoron jälkeinen ilmoitus.</p>
          </div>
          <button className="secondary-button" type="button" onClick={() => setMode("ready")}>
            Päivitä tiedot
          </button>
        </section>

        <div className="demo-controls" aria-label="Demon tilan vaihto">
          <span>Demotilat:</span>
          {(["ready", "loading", "empty", "error", "success"] as const).map((item) => (
            <button
              className={mode === item ? "demo-control demo-control--active" : "demo-control"}
              key={item}
              type="button"
              onClick={() => setMode(item)}
            >
              {item === "ready" ? "Valmis" : item === "loading" ? "Lataus" : item === "empty" ? "Tyhjä" : item === "error" ? "Virhe" : "Onnistuminen"}
            </button>
          ))}
        </div>

        {mode === "loading" && <LoadingState />}
        {mode === "empty" && <EmptyState onReset={() => setMode("ready")} />}
        {mode === "error" && <ErrorState onRetry={() => setMode("ready")} />}
        {mode === "success" && <SuccessState shift={shifts.find((shift) => shift.id === selectedShift) ?? shifts[0]} onBack={() => setMode("ready")} />}
        {mode === "ready" && (
          <>
            <div className="summary-row" aria-label="Vuorojen yhteenveto">
              <div className="summary-card">
                <span className="summary-label">Tulevat vuorot</span>
                <strong>{shifts.length}</strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">Täydennettävät ilmoitukset</span>
                <strong>{shifts.filter((shift) => shift.status === "Varattu").length}</strong>
              </div>
            </div>
            <section aria-labelledby="upcoming-title">
              <div className="section-heading">
                <h2 id="upcoming-title">Tulevat vuorot</h2>
                <span className="muted">Synteettinen testidata</span>
              </div>
              <div className="shift-list">
                {shifts.map((shift) => (
                  <article className="shift-card" key={shift.id}>
                    <div className="date-block">
                      <span>{shift.weekday}</span>
                      <strong>{shift.date}</strong>
                    </div>
                    <div className="shift-details">
                      <h3>{shift.start}–{shift.end}</h3>
                      <p>{shift.unit} · {shift.line}</p>
                    </div>
                    <StatusBadge status={shift.status} />
                    <button className="primary-button" type="button" onClick={() => showSuccess(shift.id)}>
                      {shift.status === "Varattu" ? "Täydennä ilmoitus" : "Näytä ilmoitus"}
                      <span aria-hidden="true">→</span>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="footer">Paikallinen MVP-demo · Ei tuotantodataa</footer>
    </div>
  );
}

function LoadingState() {
  return <div className="state-panel" role="status" aria-live="polite"><div className="spinner" aria-hidden="true" /><h2>Ladataan vuoroja</h2><p>Haetaan testikäyttäjän vuoroja.</p></div>;
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="state-panel" role="status"><div className="state-icon" aria-hidden="true">—</div><h2>Ei tulevia vuoroja</h2><p>Testikäyttäjälle ei löytynyt tulevia päivystysvuoroja.</p><button className="secondary-button" type="button" onClick={onReset}>Näytä testivuorot</button></div>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="state-panel state-panel--error" role="alert"><div className="state-icon" aria-hidden="true">!</div><h2>Vuorojen lataaminen ei onnistunut</h2><p>Testidataa ei voitu hakea. Yritä päivittää näkymä uudelleen.</p><button className="primary-button" type="button" onClick={onRetry}>Yritä uudelleen</button></div>;
}

function SuccessState({ shift, onBack }: { shift: Shift; onBack: () => void }) {
  return <div className="state-panel state-panel--success" role="status" aria-live="polite"><div className="state-icon" aria-hidden="true">✓</div><h2>Ilmoitus avattu</h2><p>{shift.date} · {shift.start}–{shift.end} · {shift.line}</p><p className="success-note">Seuraavassa vaiheessa voit täydentää vuoron toteutuneet tiedot.</p><button className="secondary-button" type="button" onClick={onBack}>Takaisin vuoroihin</button></div>;
}

export default App;
