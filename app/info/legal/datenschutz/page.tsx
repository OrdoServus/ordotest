export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-gray-200">

        <header className="mb-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
            Datenschutzerklärung
          </h1>
          <div className="mt-3 h-1 w-20 bg-yellow-600 mx-auto rounded-full" />
        </header>

        <section className="space-y-10 text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              1. Verantwortliche Stelle
            </h2>
            <p>
              Katholische Kirche [Name der Kirchgemeinde oder Organisation] <br />
              [Strasse und Hausnummer] <br />
              [PLZ und Ort] <br />
              Schweiz
            </p>
            <p className="mt-2">
              E‑Mail: florian@my.mail.ch
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              2. Allgemeines zur Datenbearbeitung
            </h2>
            <p>
              Wir bearbeiten personenbezogene Daten im Einklang mit dem Schweizer
              Datenschutzgesetz (revDSG). Die Nutzung unserer kostenlosen Web‑Software
              ist grundsätzlich ohne Angabe personenbezogener Daten möglich. 
              Soweit Daten erhoben werden, erfolgt dies nur im technisch notwendigen 
              Umfang oder aufgrund Ihrer freiwilligen Angaben.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              3. Erhebung und Zweck der Datenbearbeitung
            </h2>
            <p>Wir bearbeiten personenbezogene Daten insbesondere für folgende Zwecke:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Bereitstellung und Betrieb der Web‑Software</li>
              <li>Kommunikation mit Nutzerinnen und Nutzern</li>
              <li>Sicherstellung der Systemsicherheit und ‑stabilität</li>
              <li>Auswertung der Nutzung (z. B. technische Logs)</li>
              <li>Freiwillige Eingaben in Formularen oder Benutzerkonten</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              4. Server‑Log‑Daten
            </h2>
            <p>
              Beim Zugriff auf unsere Web‑Software werden automatisch technische Daten 
              erfasst, darunter IP‑Adresse, Datum und Uhrzeit, Browsertyp, Betriebssystem 
              und aufgerufene Seiten. Diese Daten dienen der Sicherstellung des 
              technischen Betriebs und werden nicht zur Identifikation von Personen 
              verwendet.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              5. Cookies und Tracking
            </h2>
            <p>
              Unsere Web‑Software verwendet nur technisch notwendige Cookies, sofern 
              nicht anders angegeben. Falls zusätzliche Analyse‑ oder Tracking‑Tools 
              eingesetzt werden, informieren wir darüber gesondert oder holen Ihre 
              Einwilligung ein.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              6. Weitergabe von Daten
            </h2>
            <p>
              Eine Weitergabe personenbezogener Daten erfolgt nur, wenn dies zur 
              Erfüllung eines Zwecks notwendig ist, gesetzliche Verpflichtungen bestehen 
              oder Sie ausdrücklich eingewilligt haben. Eine kommerzielle Weitergabe 
              findet nicht statt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              7. Datensicherheit
            </h2>
            <p>
              Wir treffen angemessene technische und organisatorische Massnahmen, um 
              personenbezogene Daten vor Verlust, Missbrauch oder unbefugtem Zugriff 
              zu schützen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              8. Ihre Rechte
            </h2>
            <p>Sie haben im Rahmen des revDSG insbesondere folgende Rechte:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Auskunft über die bearbeiteten personenbezogenen Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung, soweit keine gesetzlichen Pflichten entgegenstehen</li>
              <li>Herausgabe oder Übertragung Ihrer Daten (Datenportabilität)</li>
              <li>Widerspruch gegen bestimmte Datenbearbeitungen</li>
            </ul>
            <p className="mt-2">
              Zur Ausübung dieser Rechte können Sie uns jederzeit kontaktieren.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              9. Kontakt
            </h2>
            <p>
              Bei Fragen zum Datenschutz wenden Sie sich bitte an die oben genannte
              verantwortliche Stelle.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              10. Änderungen dieser Datenschutzerklärung
            </h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen. 
              Es gilt die jeweils aktuelle Version, die in der Web‑Software abrufbar ist. <br/>
              Letzte Aktualisierung: 14.01.2026
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}
