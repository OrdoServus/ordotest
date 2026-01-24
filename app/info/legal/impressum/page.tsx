export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-gray-200">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
            Impressum
          </h1>
          <div className="mt-3 h-1 w-20 bg-yellow-600 mx-auto rounded-full" />
        </header>

        <section className="space-y-10 text-gray-700 leading-relaxed">
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verantwortliche Stelle
            </h2>
            <p>
              [BITTE HIER IHREN NAMEN ODER DEN NAMEN DER ORGANISATION EINTRAGEN] <br />
              [BITTE HIER IHRE STRASSE UND HAUSNUMMER EINTRAGEN] <br />
              [BITTE HIER IHRE PLZ UND DEN ORT EINTRAGEN] <br />
              Schweiz
            </p>
            <p className="mt-2">
              E‑Mail: [BITTE HIER IHRE KONTAKT-E-MAIL EINTRAGEN] <br />
              Website: [BITTE HIER DIE DOMAIN DER WEB-SOFTWARE EINTRAGEN]
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Vertretungsberechtigte Person
            </h2>
            <p>
              [BITTE HIER DEN NAMEN DER VERANTWORTLICHEN PERSON EINTRAGEN] <br />
              Funktion: [BITTE HIER DIE FUNKTION EINTRAGEN, z.B. Pfarrer, IT-Leitung]
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Haftungsausschluss
            </h2>
            <p>
              Die Inhalte dieser Web‑Software werden mit grösstmöglicher Sorgfalt erstellt. 
              Dennoch übernimmt die verantwortliche Stelle keine Gewähr für die 
              Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Informationen.
            </p>
            <p className="mt-2">
              Haftungsansprüche gegen die verantwortliche Stelle wegen Schäden materieller 
              oder immaterieller Art, die aus dem Zugriff oder der Nutzung bzw. Nichtnutzung 
              der veröffentlichten Informationen entstehen, sind ausgeschlossen, 
              soweit gesetzlich zulässig.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Externe Links
            </h2>
            <p>
              Diese Web‑Software kann Links zu externen Websites enthalten. Für Inhalte 
              externer Seiten wird keine Verantwortung übernommen. Für den Inhalt der 
              verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Urheberrecht
            </h2>
            <p>
              Die Inhalte, Strukturen und der Quellcode dieser Web‑Software sind 
              urheberrechtlich geschützt. Jede Verwendung ausserhalb der engen Grenzen 
              des Urheberrechts bedarf der schriftlichen Zustimmung der verantwortlichen Stelle.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Datenschutz
            </h2>
            <p>
              Informationen zur Verarbeitung personenbezogener Daten finden Sie in der{" "}
              <a href="/info/legal/datenschutz" className="text-yellow-700 underline">
                Datenschutzerklärung
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Kontakt
            </h2>
            <p>
              Bei Fragen zum Impressum oder zur Web‑Software wenden Sie sich bitte an die oben genannte
              verantwortliche Stelle.
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}
