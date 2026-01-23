"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;

  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        console.log("Loading help data from JSON...");
        const response = await fetch('/help-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch help data');
        }
        const data: HelpData = await response.json();
        const foundCategory = data.categories.find(cat => cat.id === categoryId);
        if (!foundCategory) {
          throw new Error('Category not found');
        }
        setCategory(foundCategory);
        setError(null);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Fehler beim Laden der Kategorie');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <p>Lade Kategorie...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div style={styles.wrapper}>
        <p style={{ color: 'red' }}>{error || 'Kategorie nicht gefunden'}</p>
        <Link href="/info/help" style={styles.backLink}>
          ← Zurück zur Hilfe-Seite
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <Link href="/info/help" style={styles.backLink}>
          ← Zurück zur Hilfe-Seite
        </Link>

        <div style={styles.categoryHeader}>
          <div style={styles.icon}>{category.icon}</div>
          <h1 style={styles.title}>{category.title}</h1>
          <p style={styles.description}>{category.description}</p>
        </div>
      </header>

      <section style={styles.articles}>
        {category.articles.length === 0 ? (
          <p>Keine Artikel in dieser Kategorie.</p>
        ) : (
          category.articles.map((article) => (
            <article key={article.id} style={styles.article}>
              <h2 style={styles.articleTitle}>{article.title}</h2>
              <div style={styles.articleContent}>
                {article.content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </article>
          ))
        )}
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
    marginBottom: "50px",
  },

  backLink: {
    color: "#888",
    textDecoration: "none",
    fontSize: "0.9rem",
    display: "inline-block",
    marginBottom: "20px",
  },

  categoryHeader: {
    textAlign: "center",
  },

  icon: {
    fontSize: "3rem",
    marginBottom: "10px",
  },

  title: {
    fontSize: "2.4rem",
    margin: "20px 0",
  },

  description: {
    color: "#777",
    fontSize: "1.1rem",
  },

  articles: {
    marginBottom: "60px",
  },

  article: {
    marginBottom: "40px",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #eee",
  },

  articleTitle: {
    fontSize: "1.5rem",
    marginBottom: "15px",
  },

  articleContent: {
    lineHeight: "1.6",
    color: "#333",
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