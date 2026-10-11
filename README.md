# Mini Inventory Lab 📦✨

**Mini Inventory Lab** is a modern, responsive inventory management web application built with vanilla HTML5, CSS3, and JavaScript. It provides real-time stock tracking, multi-parameter filtering, low-stock threshold alerting, and persistent client-side data management using LocalStorage.

---

## 🚀 Features

- **Product Management (CRUD)**: Add, edit, view, and delete products with SKU, category, unit price, stock quantity, alert threshold, and location notes.
- **Instant Stock Stepper**: Increment (`+`) and decrement (`-`) quantity controls with floor limits and real-time state updates.
- **Low-Stock Alerting**:
  - Live metric card reflecting items at or below safety threshold.
  - Interactive top warning banner with quick filter navigation.
  - Dynamic status badges: *In Stock* (`badge-success`), *Low Stock* (`badge-warning` with pulse animation), and *Out of Stock* (`badge-danger`).
- **Dashboard Metrics**: Real-time calculated counters:
  - Total Products count
  - Total Units on Hand
  - Inventory Valuation ($\sum \text{Price} \times \text{Quantity}$)
  - Low Stock Alerts count
- **Search & Multi-Filtering**:
  - Instant text search across name, SKU, category, and notes.
  - Dynamic category selector populated from current catalog.
  - Stock status filtering (*All*, *In Stock*, *Low Stock*, *Out of Stock*).
  - Multi-direction sorting (Name A-Z/Z-A, Price Low/High, Stock Low/High, Low Stock First).
- **Dual Display Modes**: Toggle between responsive Data Table view and Mobile Grid Cards view.
- **Persistence & Backup**:
  - Zero-backend client-side persistence via `localStorage`.
  - Realistic demo dataset pre-loaded on first visit.
  - **Export Data**: Single-click JSON backup export.
  - **Reset Demo Data**: Easily restore demo state.

---

## 🛠️ Built With

- **HTML5**: Semantic document structure, native `<dialog>` modals, and accessible markup.
- **CSS3**: Custom design tokens, responsive CSS grid/flexbox, glassmorphic header, and micro-interactions.
- **JavaScript (ES6+)**: Modular closure architecture, event delegation, and reactive DOM rendering.
- **Google Fonts (Inter)** & **Font Awesome 6** (via CDN).

---

## 🌐 GitHub Pages Deployment

This project is completely static and ready for direct hosting on **GitHub Pages**:
1. Entry point: `index.html` at repository root.
2. All asset paths (`style.css`, `app.js`) are relative, supporting custom domains and GitHub repository subpaths (`https://<username>.github.io/<repo>/`).
3. No build tools or package managers required.

---

## 💻 Local Usage

Simply open `index.html` in any modern web browser, or serve using any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .
```

---

## 📄 License

MIT License. Free to use, adapt, and build upon!
