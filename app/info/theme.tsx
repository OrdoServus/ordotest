import React from 'react';

// ─── Brand Colors ────────────────────────────────────────────────
export const colors = {
  primary:       '#2c3e50',   // dark navy – headings, nav, footer bg
  accent:        '#ef5c22',   // orange – CTAs, links, highlights
  accentGreen:   '#27ae60',   // green – confirm/submit buttons
  accentBlue:    '#4ca1af',   // teal – hero gradient end
  text:          '#333333',   // body text
  textMuted:     '#666666',   // secondary text
  textLight:     '#aaaaaa',   // footer links, placeholders
  border:        '#eeeeee',   // card & nav borders
  bgPage:        '#f9f9fb',   // page background
  bgCard:        '#ffffff',   // card background
  bgMuted:       '#f9f9f9',   // muted section background
  bgInput:       '#ffffff',   // form inputs
  white:         '#ffffff',
  error:         '#e74c3c',
  errorBg:       '#fff5f5',
};

// ─── Typography ──────────────────────────────────────────────────
export const fonts = {
  base: "'system-ui', '-apple-system', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const fontSizes = {
  xs:   '0.8rem',
  sm:   '0.9rem',
  base: '1rem',
  md:   '1.1rem',
  lg:   '1.2rem',
  xl:   '1.5rem',
  xxl:  '2rem',
  hero: '2.5rem',
  huge: '2.8rem',
};

// ─── Spacing ─────────────────────────────────────────────────────
export const spacing = {
  xs:  '5px',
  sm:  '10px',
  md:  '20px',
  lg:  '30px',
  xl:  '40px',
  xxl: '60px',
};

// ─── Border Radius ───────────────────────────────────────────────
export const radius = {
  sm:  '6px',
  md:  '8px',
  lg:  '12px',
  xl:  '30px',
};

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  card:  '0 4px 15px rgba(0,0,0,0.05)',
  light: '0 2px 8px rgba(0,0,0,0.04)',
};

// ─── Shared Component Styles ─────────────────────────────────────

export const sharedStyles: { [key: string]: React.CSSProperties } = {

  // Page wrapper
  page: {
    fontFamily: fonts.base,
    backgroundColor: colors.bgPage,
    color: colors.text,
    lineHeight: '1.6',
    minHeight: '100vh',
  },

  // Top nav bar
  nav: {
    padding: `${spacing.md} ${spacing.md} 0`,
    backgroundColor: colors.bgCard,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },

  navFull: {
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backLink: {
    textDecoration: 'none',
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSizes.base,
  },

  navTitle: {
    fontWeight: 'bold',
    fontSize: fontSizes.lg,
    color: colors.primary,
    marginLeft: 'auto',
  },

  // Main content container
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: `${spacing.xl} ${spacing.md}`,
  },

  mainNarrow: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: `${spacing.xl} ${spacing.md}`,
  },

  // Section/page header
  pageHeader: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  h1: {
    fontSize: fontSizes.hero,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },

  h2: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.primary,
  },

  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    maxWidth: '600px',
    margin: `${spacing.sm} auto 0`,
  },

  // White content card with border
  contentCard: {
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    lineHeight: '1.7',
  },

  contentCardShadow: {
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: radius.lg,
    boxShadow: shadows.card,
  },

  section: {
    marginBottom: spacing.lg,
  },

  // Buttons
  buttonPrimary: {
    display: 'inline-block',
    padding: `12px 25px`,
    backgroundColor: colors.accent,
    color: colors.white,
    textDecoration: 'none',
    borderRadius: radius.md,
    fontWeight: 'bold',
    marginTop: spacing.md,
    border: 'none',
    cursor: 'pointer',
    fontFamily: fonts.base,
  },

  buttonDark: {
    display: 'inline-block',
    padding: `10px 20px`,
    backgroundColor: colors.primary,
    color: colors.white,
    textDecoration: 'none',
    borderRadius: radius.md,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },

  buttonGreen: {
    display: 'block',
    width: '100%',
    padding: '15px',
    backgroundColor: colors.accentGreen,
    color: colors.white,
    border: 'none',
    borderRadius: radius.md,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: fonts.base,
  },

  buttonCta: {
    padding: '12px 30px',
    fontSize: fontSizes.md,
    backgroundColor: colors.accentGreen,
    color: colors.white,
    border: 'none',
    borderRadius: radius.xl,
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  // Form inputs
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: spacing.md,
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    boxSizing: 'border-box' as const,
    fontFamily: fonts.base,
    fontSize: fontSizes.base,
    backgroundColor: colors.bgInput,
    color: colors.text,
  },

  textarea: {
    width: '100%',
    padding: '12px',
    marginBottom: spacing.md,
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    boxSizing: 'border-box' as const,
    fontFamily: fonts.base,
    fontSize: fontSizes.base,
    backgroundColor: colors.bgInput,
    color: colors.text,
    height: '120px',
    resize: 'vertical' as const,
  },

  // Utility
  ul: {
    listStyle: 'disc',
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },

  errorText: {
    color: colors.error,
    textAlign: 'center',
    padding: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
  },
};