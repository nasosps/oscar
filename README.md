# Oscar QR Menu Site

Static site για QR στα τραπέζια με online menu από εικόνα.

## Περιεχόμενα

- `index.html`: Landing/menu page για τους πελάτες.
- `qr.html`: Generator για QR ανά τραπέζι (`?table=1`, `?table=2`, ...).
- `assets/menu.jpg`: Η εικόνα του menu.
- `assets/logo.jpg`: Το logo.

## Deploy (GitHub Pages)

1. Κάνε push αυτό το repo στο GitHub.
2. Άνοιξε `Settings -> Pages`.
3. Επίλεξε `Deploy from a branch`.
4. Βάλε branch `main` και folder `/ (root)`.
5. Περίμενε να δοθεί URL π.χ. `https://yourname.github.io/oscar/`.

## Πώς βγάζεις QR για κάθε τραπέζι

1. Άνοιξε `https://yourname.github.io/oscar/qr.html`.
2. Στο `Base URL` βάλε το τελικό URL του site σου (χωρίς `qr.html`).
3. Βάλε εύρος τραπεζιών (π.χ. `1` έως `20`).
4. Πάτα `Δημιουργία`.
5. Πάτα `Εκτύπωση` για να τα τυπώσεις.

## Example links

- `https://yourname.github.io/oscar/?table=1`
- `https://yourname.github.io/oscar/?table=2`
- `https://yourname.github.io/oscar/?table=3`
