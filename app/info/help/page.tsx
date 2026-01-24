"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  articles: HelpArticle[];
}

interface HelpData {
  categories: HelpCategory[];
}

export default function HilfePage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("Loading help data from JSON...");
        const response = await fetch('/help-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch help data');
        }
        const data: HelpData = await response.json();
        console.log("Loaded categories:", data.categories);
        setCategories(data.categories);
        setError(null);
      } catch (err) {
        console.error('Error loading help data:', err);
        setError('Fehler beim Laden der Hilfe-Inhalte');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(search.toLowerCase()) ||
    cat.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <p>Lade Hilfe-Inhalte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link href="/info" style={styles.backLink}>
          ← Zurück zur Info-Seite
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <Link href="/info" style={styles.backLink}>
          ← Zurück zur Info-Seite
        </Link>

        <h1 style={styles.title}>Hilfe & Support</h1>

        <input
          type="text"
          placeholder="Themen durchsuchen..."
          style={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <section style={styles.grid}>
        {filteredCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/info/help/${cat.id}`}
            style={styles.card}
          >
            <div style={styles.icon}>{cat.icon}</div>
            <h2 style={styles.cardTitle}>{cat.title}</h2>
            <p style={styles.cardDesc}>
              {cat.articles.length} Artikel
            </p>
          </Link>
        ))}
      </section>

      <footer style={styles.footer}>
        <p>Keine passende Antwort gefunden?</p>
        <Link href="/info/kontakt" style={styles.contactButton}>
          Kontakt aufnehmen
        </Link>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: "50px",
  },

  backLink: {
    color: "#888",
    textDecoration: "none",
    fontSize: "0.9rem",
  },

  title: {
    fontSize: "2.4rem",
    margin: "20px 0",
  },

  search: {
    width: "100%",
    maxWidth: "500px",
    padding: "14px 20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
  },

  card: {
    display: "block",
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #eee",
    textDecoration: "none",
    color: "#333",
    transition: "0.2s",
  },

  icon: {
    fontSize: "2rem",
    marginBottom: "10px",
  },

  cardTitle: {
    fontSize: "1.2rem",
    marginBottom: "5px",
  },

  cardDesc: {
    color: "#777",
    fontSize: "0.9rem",
  },

  footer: {
    textAlign: "center",
    marginTop: "60px",
    paddingTop: "30px",
    borderTop: "1px solid #eee",
  },

  contactButton: {
    display: "inline-block",
    marginTop: "10px",
    padding: "10px 20px",
    background: "#2c3e50",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
  },
};
