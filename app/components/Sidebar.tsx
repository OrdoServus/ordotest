
import React from 'react';
import { Plus, Star, Copy, Trash2, FileText, Book } from 'lucide-react';

// TypeScript-Interfaces für Typensicherheit
interface Dokument {
  id: string;
  typ: 'gottesdienst' | 'notiz';
  titel: string;
  isFavorit: boolean;
}

interface SidebarProps {
  dokumente: Dokument[];
  aktuelleId: string | null;
  onWähleDokument: (id: string) => void;
  onNeuGottesdienst: () => void;
  onNeuNotiz: () => void;
  onLöschen: (id: string) => void;
  onKopieren: (id: string) => void;
  onFavorit: (id: string) => void;
  docType: 'gottesdienst' | 'notiz';
}

const Sidebar: React.FC<SidebarProps> = ({ 
    dokumente, 
    aktuelleId, 
    onWähleDokument, 
    onNeuGottesdienst, 
    onNeuNotiz, 
    onLöschen, 
    onKopieren, 
    onFavorit,
    docType
}) => {

    const renderDocList = (docs: Dokument[], Icon: React.ElementType) => {
        return docs.map(d => (
            <li key={d.id} 
                style={d.id === aktuelleId ? styles.listItemAktiv : styles.listItem}
                onClick={() => onWähleDokument(d.id)}
            >
                <Icon size={16} style={{ marginRight: '10px', color: '#6c757d', flexShrink: 0 }} />
                <span style={styles.titel}>{d.titel || 'Unbenannt'}</span>
                <div style={styles.aktionen}>
                    <button onClick={(e) => { e.stopPropagation(); onFavorit(d.id); }} style={styles.iconButton}>
                        <Star size={16} color={d.isFavorit ? '#f39c12' : '#7f8c8d'} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onKopieren(d.id); }} style={styles.iconButton}>
                        <Copy size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onLöschen(d.id); }} style={styles.iconButton}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </li>
        ));
    };

    // --- RENDER NOTIZBUCH (ONE-NOTE-STIL) ---
    if (docType === 'notiz') {
        return (
            <div style={styles.sidebarNotiz}>
                {/* Header */}
                <div style={styles.notizHeader}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Digitales Notizbuch</h3>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.9 }}>
                        Gedanken, Katechese und Notizen organisieren.
                    </p>
                    <button onClick={onNeuNotiz} style={styles.neuSeiteButton}>
                        <Plus size={18} style={{ marginRight: '8px' }} /> Neue Seite
                    </button>
                </div>

                {/* Seiten-Liste */}
                <ul style={styles.liste}>
                    {renderDocList(dokumente, FileText)}
                </ul>
            </div>
        );
    }

    // --- RENDER GOTTESDIENST-PLANER ---
    return (
        <div style={styles.sidebarGottesdienst}>
            <div style={styles.neueButtonsContainer}>
                <button onClick={onNeuGottesdienst} style={styles.neuGottesdienstButton}>
                    <Plus size={20} style={{ marginRight: '8px' }}/> Neuer Gottesdienst
                </button>
            </div>

            <div style={styles.section}>
                <h2 style={styles.h2}><Book size={18} style={{ marginRight: '10px' }} />Gottesdienste</h2>
                <ul style={styles.liste}>
                    {renderDocList(dokumente, Book)}
                </ul>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    // --- Allgemeine Stile ---
    liste: {
        listStyle: 'none',
        padding: '10px',
        margin: 0,
        overflowY: 'auto',
    },
    listItem: {
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '6px',
        transition: 'background-color 0.2s ease',
    },
    listItemAktiv: {
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '6px',
        backgroundColor: '#e9ecef',
        fontWeight: '600',
    },
    titel: {
        flexGrow: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginRight: '10px',
    },
    aktionen: {
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    iconButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        color: '#7f8c8d',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '5px',
        transition: 'background-color 0.2s ease',
    },

    // --- Stile für Gottesdienst-Sidebar ---
    sidebarGottesdienst: {
        width: '320px',
        height: '100%',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        paddingTop: '24px',
    },
    neueButtonsContainer: {
        marginBottom: '24px',
        padding: '0 24px',
    },
    neuGottesdienstButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: '500',
    },
    section: {
        marginBottom: '24px',
    },
    h2: {
        fontSize: '1.1rem',
        color: '#343a40',
        margin: '0 0 12px 24px',
        display: 'flex',
        alignItems: 'center',
    },

    // --- Stile für Notizbuch-Sidebar (OneNote-Look) ---
    sidebarNotiz: {
        width: '320px',
        height: '100%',
        backgroundColor: '#fdfdff',
        borderRight: '1px solid #e1e1e1',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    notizHeader: {
        padding: '24px',
        backgroundColor: '#80397B',
        color: 'white',
        flexShrink: 0,
    },
    neuSeiteButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
    },
};

export default Sidebar;
