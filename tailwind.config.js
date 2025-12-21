/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ===== PAGE ===== */
        page: "hsl(var(--page-bg))",

        /* ===== BASE ===== */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        /* ===== SURFACE (твои) ===== */
        surface: "hsl(var(--surface))",
        surfaceMuted: "hsl(var(--surface-muted))",
        surfaceForeground: "hsl(var(--surface-foreground))",
        mutedForeground: "hsl(var(--muted-foreground))",

        /* ===== CARD ===== */
        card: "hsl(var(--card))",
        cardForeground: "hsl(var(--card-foreground))",

        /* ===== POPOVER ===== */
        popover: "hsl(var(--popover))",
        popoverForeground: "hsl(var(--popover-foreground))",

        /* ===== ACCENT ===== */
        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        /* ===== INPUT / BORDER ===== */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",

        /* ===== PRIMARY ===== */
        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",

        /* ===== FEEDBACK ===== */
        destructive: "hsl(var(--destructive))",
        destructiveForeground: "hsl(var(--destructive-foreground))",

        /* ===== FOCUS ===== */
        ring: "hsl(var(--ring))",

        /* ===== EVENTS ===== */
        planned: "hsl(var(--event-planned-bg))",
        active: "hsl(var(--event-active-bg))",
        win: "hsl(var(--event-win-bg))",
        lose: "hsl(var(--event-lose-bg))",

        plannedText: "hsl(var(--event-planned-text))",
        activeText: "hsl(var(--event-active-text))",
        winText: "hsl(var(--event-win-text))",
        loseText: "hsl(var(--event-lose-text))",

        plannedBorder: "hsl(var(--event-planned-border))",
        activeBorder: "hsl(var(--event-active-border))",
        winBorder: "hsl(var(--event-win-border))",
        loseBorder: "hsl(var(--event-lose-border))",

        primaryForeground: "hsl(var(--primary-foreground))",
        danger: "hsl(var(--danger))",
        dangerForeground: "hsl(var(--danger-foreground))",

        background: "hsl(var(--background))",
        popover: "hsl(var(--popover))",
        popoverForeground: "hsl(var(--popover-foreground))",

        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",     
        
        background: "hsl(var(--background))",
        overlay: "hsl(var(--overlay))",

        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        ring: "hsl(var(--ring))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // popover
        popover: "hsl(var(--popover))",
        popoverForeground: "hsl(var(--popover-foreground))",

        // ring / accent (используются в calendar, dialog, select)
        ring: "hsl(var(--ring))",
        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        popover: "hsl(var(--popover))",
        popoverForeground: "hsl(var(--popover-foreground))",

        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        muted: "hsl(var(--muted))",
        input: "hsl(var(--input))",

        ring: "hsl(var(--ring))",
        skeleton: "hsl(var(--skeleton))",
        background: "hsl(var(--background))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};
