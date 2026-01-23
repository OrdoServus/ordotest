"use client";
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={errorCodeStyle}>404</h1>
        <h2 style={titleStyle}>Seite nicht gefunden</h2>
        <p style={textStyle}>
          Es tut uns leid, aber der gesuchte Pfad existiert nicht. 
          Vielleicht wurde die Seite verschoben oder der Link ist veraltet.
        </p>
        
        <div style={dividerStyle}></div>
        
        <p style={suggestionStyle}>Möchten Sie zurück zum Dienst?</p>
        
        <div style={buttonContainerStyle}>
          <Link href="/">
            <button style={primaryButtonStyle}>Zum Dashboard</button>
          </Link>
          <Link href="/info">
            <button style={secondaryButtonStyle}>Informationen</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  padding: '20px'
};

const contentStyle = {
  maxWidth: '500px',
  backgroundColor: 'white',
  padding: '60px 40px',
  borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
};

const errorCodeStyle = {
  fontSize: '5rem',
  margin: 0,
  color: '#e74c3c',
  fontWeight: 'bold' as 'bold'
};

const titleStyle = {
  fontSize: '1.8rem',
  color: '#2c3e50',
  margin: '10px 0 20px'
};

const textStyle = {
  color: '#7f8c8d',
  lineHeight: '1.6',
  marginBottom: '30px'
};

const dividerStyle = {
  height: '1px',
  backgroundColor: '#eee',
  margin: '30px 0'
};

const suggestionStyle = {
  fontSize: '1rem',
  color: '#2c3e50',
  marginBottom: '20px',
  fontWeight: 'bold' as 'bold'
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '15px',
  justifyContent: 'center'
};

const primaryButtonStyle = {
  padding: '12px 25px',
  backgroundColor: '#2c3e50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold' as 'bold'
};

const secondaryButtonStyle = {
  padding: '12px 25px',
  backgroundColor: '#ecf0f1',
  color: '#2c3e50',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold' as 'bold'
};