# Oscar Coffee & Food Site

Static site για το Oscar Coffee & Food.

## Περιεχόμενα

- `index.html`: Αρχική σελίδα πελάτη με Ελληνικά/English.
- `site-i18n.js`: Κείμενα και αλλαγή γλώσσας.
- `app.js`: Βασική λειτουργικότητα σελίδας και σύνδεση του κουμπιού μενού με WebRest.
- `qr.html`: Generator για QR ανά τραπέζι (`?table=1`, `?table=2`, ...).
- `assets/logo.jpg`: Το logo.

## Online μενού και παραγγελία

Το κουμπί μενού στην αρχική σελίδα οδηγεί στο εξωτερικό WebRest link:

`https://webrest.gr/qr_login.php?account=2`

Δεν υπάρχει τοπικό menu/catalog μέσα στο repo.

## Deploy (GitHub Pages)

1. Κάνε push αυτό το repo στο GitHub.
2. Άνοιξε `Settings -> Pages`.
3. Επίλεξε `Deploy from a branch`.
4. Βάλε branch `main` και folder `/ (root)`.
5. Περίμενε να δοθεί URL π.χ. `https://yourname.github.io/oscar/`.
