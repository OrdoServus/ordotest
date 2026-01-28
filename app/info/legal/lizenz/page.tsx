'use client'

import Link from 'next/link';

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: 1.6,
        color: '#333',
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee',
    },
    backLink: {
        textDecoration: 'none',
        color: '#3498db',
        fontSize: '1rem',
    },
    main: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    header: {
        borderBottom: '1px solid #eee',
        marginBottom: '30px',
        paddingBottom: '20px',
    },
    h1: {
        fontSize: '2.5rem',
        color: '#2c3e50',
    },
    content: {
        fontSize: '1.1rem',
    },
    ul: {
        listStyle: 'disc',
        paddingLeft: '40px',
        marginBottom: '20px'
    },
    li: {
        marginBottom: '10px'
    },
    link: {
        color: '#3498db',
        textDecoration: 'none',
    }
};

const LizenzPage = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <Link href="/info" style={styles.backLink}>← Zurück zur Info-Seite</Link>
                <div style={{ fontWeight: 'bold' }}>Lizenz</div>
            </nav>
            <main style={styles.main}>
                <header style={styles.header}>
                    <h1 style={styles.h1}>GNU AGPLv3 Lizenz</h1>
                </header>
                <section style={styles.content}>
                    <p style={{ marginBottom: '20px' }}>
                        Copyright (c) {currentYear} OrdoServus Contributors
                    </p>
                    <p style={{ marginBottom: '20px' }}>
                        Dieses Werk ist lizenziert unter der GNU Affero General Public License, Version 3 (AGPLv3).
                    </p>
                    <p style={{ marginBottom: '20px' }}>
                        Kurz gesagt bedeutet das:
                    </p>
                    <ul style={styles.ul}>
                        <li style={styles.li}><strong>Freiheit zur Nutzung:</strong> Sie dürfen die Software für jeden Zweck nutzen.</li>
                        <li style={styles.li}><strong>Freiheit zur Weitergabe:</strong> Sie dürfen Kopien der Software weitergeben.</li>
                        <li style={styles.li}><strong>Freiheit zur Veränderung:</strong> Sie dürfen die Software verändern und Ihre Änderungen weitergeben.</li>
                        <li style={styles.li}><strong>Netzwerk-Klausel:</strong> Wenn Sie eine modifizierte Version der Software auf einem Server betreiben und Benutzern den Zugriff darauf ermöglichen, müssen Sie diesen Benutzern auch den Quellcode Ihrer modifizierten Version zur Verfügung stellen.</li>
                    </ul>
                    <p style={{ marginBottom: '20px' }}>
                        Dies ist eine stark vereinfachte Zusammenfassung. Der vollständige und rechtlich bindende Lizenztext ist im <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" style={styles.link}>vollständigen Lizenztext der GNU AGPLv3</a> zu finden.
                    </p>
                    <p>
                        Der Quellcode dieses Projekts enthält eine Kopie der Lizenz in der Datei `LICENSE`.
                    </p>
                </section>
            </main>
        </div>
    );
};

export default LizenzPage;
