# DeskDrop - CloudExify Web Project 2

Interactive limited-drop e-commerce storefront for CloudExify Full Stack Web Development Internship 2026, Month 1, Project 2.

## Student Details

- Name: Muzammil Hayat Minhas
- Registration Number: CX-INT-2026-GEN-0195
- Project: E-Commerce Product Page
- Drop Concept Chosen: Indie Tech Desk Drop
- Tech Stack: HTML5, CSS3, Bootstrap 5 CDN, Vanilla JavaScript, localStorage

## Required Features

- Product cards rendered dynamically from `js/data.js`
- Countdown timer updated every second
- Live stock indicators that decrease as products are added to cart
- Persistent cart using localStorage
- Search, category, price, stock, and sort controls working together
- Bootstrap product detail modal populated dynamically
- Cart quantity increase/decrease, remove, clear, subtotal, shipping, discount, and total
- Checkout form with Bootstrap validation and simulated order success
- Responsive grid tested on desktop and mobile widths

## Bonus Features

- Wishlist saved in localStorage
- Dark/light theme toggle saved in localStorage
- Discount code support: `CX2026` or `DROP10`
- Toast notification after cart actions
- Sticky filter toolbar and cart offcanvas
- Generated product imagery stored locally in `assets/products`

## Links

- Repository: https://github.com/muzzammilminhas/cloudexify-web-p2-muzammilminhas
- Live Vercel Link: https://cloudexify-web-p2-muzammilminhas.vercel.app

## Project Structure

```text
cloudexify-web-p2-muzammilminhas/
|-- index.html
|-- css/
|   `-- style.css
|-- js/
|   |-- data.js
|   `-- script.js
|-- assets/
|   |-- design/
|   |   `-- accepted-concept.png
|   `-- products/
|       |-- product-sheet.png
|       |-- apex-pro-75.jpg
|       |-- nova-buds-pro.jpg
|       |-- loop-deck-mini.jpg
|       |-- photon-cable.jpg
|       |-- lumabar-pro.jpg
|       |-- rise-stand-air.jpg
|       |-- pulse-keycap-set.jpg
|       `-- contour-ssd-puck.jpg
|-- screenshots/
|   |-- desktop/
|   `-- mobile/
`-- README.md
```

## Testing Checklist

- Open local and live site
- Countdown timer updates every second
- Add to cart decreases visible stock
- Refresh keeps cart contents
- Remove and quantity controls recalculate totals
- Search and filters combine correctly
- Product modal shows correct product details
- Checkout form shows validation errors for empty/invalid input
- Valid checkout clears cart and shows success message
- Mobile layout collapses cleanly
- Browser console has no JavaScript errors
