import React from 'react';
import Link from 'next/link';
import WhatsNew from '../info/WhatsNew';

const Sidebar = ({ dokumente, aktuelleId, onWähleDokument, onNeuGottesdienst, onNeuNotiz, onLöschen, onKopieren, onFavorit }) => {

    // Filter documents by type
    const gottesdienste = dokumente.filter(d => d.typ === 'gottesdienst');
    const notizen = dokumente.filter(d => d.typ === 'notiz');

    // Helper to render the list of documents
    const renderDocList = (docs) => {
        return docs.map(d => (
            <li key={d.id} style={d.id === aktuelleId ? styles.listItemAktiv : styles.listItem}>
                <span onClick={() => onWähleDokument(d.id)} style={styles.titel}>
                    {d.titel || 'Unbenannt'}
                </span>
                <div style={styles.aktionen}>
                    <button onClick={(e) => { e.stopPropagation(); onFavorit(d.id); }} style={styles.button}>{d.isFavorit ? '★' : '☆'}</button>
                    <button onClick={(e) => { e.stopPropagation(); onKopieren(d.id); }} style={styles.button}>⎘</button>
                    <button onClick={(e) => { e.stopPropagation(); onLöschen(d.id); }} style={styles.button}>🗑</button>
                </div>
            </li>
        ));
    };

    return (
        <div style={styles.sidebar}>
            {/* Services Section */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.h2}>Gottesdienste</h2>
                    <button onClick={onNeuGottesdienst} style={styles.neuButton}>+</button>
                </div>
                <ul style={styles.liste}>
                    {renderDocList(gottesdienste)}
                </ul>
            </div>

            {/* Notes Section */}
            <div style={{...styles.section, marginTop: '20px'}}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.h2}>Notizbuch</h2>
                    <button onClick={onNeuNotiz} style={styles.neuButton}>+</button>
                </div>
                <ul style={styles.liste}>
                    {renderDocList(notizen)}
                </ul>
            </div>

            {/* Footer with version info */}
            <div style={styles.footer}>
                <span>OrdoServus v1.0</span>
                <WhatsNew />
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    sidebar: {
        width: '300px',
        height: '100%',
        backgroundColor: '#f9f9fb',
        borderRight: '1px solid #eee',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
    },
    h2: {
        fontSize: '1.1rem',
        color: '#2c3e50',
        margin: 0,
    },
    neuButton: {
        backgroundColor: '#ef5c22',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    liste: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        overflowY: 'auto',
    },
    listItem: {
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
        border: '1px solid transparent',
    },
    listItemAktiv: {
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        fontWeight: 'bold',
    },
    titel: {
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    aktionen: {
        display: 'flex',
        alignItems: 'center',
    },
    button: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        fontSize: '1rem',
        color: '#7f8c8d'
    },
    footer: {
        borderTop: '1px solid #eee',
        paddingTop: '15px',
        marginTop: '20px',
        fontSize: '0.8rem',
        color: '#7f8c8d',
        textAlign: 'center',
    },
};

export default Sidebar;
