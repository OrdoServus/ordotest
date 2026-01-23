/**
 * OrdoServus Pro-File System
 * Speichert Dokumente in einem proprietären Format mit Header und Base64-Kodierung.
 */

const FILE_HEADER = "ORDOSERVUS_FILE_V1";

export const ordoFileService = {
  /**
   * Exportiert ein Dokument als .ordo Datei
   */
  export(doc: any) {
    try {
      const payload = {
        metadata: {
          app: "OrdoServus",
          version: "1.0",
          exportedAt: new Date().toISOString(),
          type: doc.typ // 'gottesdienst' oder 'notizbuch'
        },
        content: doc
      };

      // 1. JSON zu String
      const jsonString = JSON.stringify(payload);
      
      // 2. UTF-8 sichere Base64 Kodierung
      const encoded = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));

      // 3. Datei mit Header zusammensetzen
      const finalContent = `${FILE_HEADER}\n${encoded}`;

      // 4. Download auslösen
      const blob = new Blob([finalContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sichererTitel = (doc.titel || doc.title || "unbenannt")
        .toString()
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      a.download = `${sichererTitel}.ordo`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export fehlgeschlagen:", error);
      alert("Fehler beim Exportieren der Datei.");
    }
  },

  /**
   * Importiert eine .ordo Datei und gibt das Dokument zurück
   */
  async import(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const rawContent = e.target?.result as string;
          const lines = rawContent.split('\n');

          // Check 1: Header prüfen
          if (lines[0].trim() !== FILE_HEADER) {
            throw new Error("Ungültiges Dateiformat. Diese Datei gehört nicht zu OrdoServus.");
          }

          // Check 2: Base64 dekodieren
          const decoded = decodeURIComponent(atob(lines[1]).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(decoded);
          
          // Erfolg
          resolve(payload.content);
        } catch (error) {
          reject("Die Datei konnte nicht gelesen werden. Möglicherweise ist sie beschädigt.");
        }
      };

      reader.onerror = () => reject("Dateifehler beim Lesen.");
      reader.readAsText(file);
    });
  }
};