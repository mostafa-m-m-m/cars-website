# Blueprint: car rental website

## Goal (what this project proves on a CV)
A realistic booking flow: search and filter a catalog, pick dates, see a live price breakdown, submit a validated reservation, and manage it later. Shows state management, date and money logic with unit tests, accessible forms, and a bilingual Arabic/English RTL interface.

## Known problems (found by reading the code)
1. Critical: `CarDetalis` crashes (white screen) on an unknown car URL; car and blog pages are looked up by display name, so links break on any rename.
2. Critical: the booking form has no state, no submit and no validation; the "Reserve Now" button is outside the form; "From address" is `type=email` and "To address" is `type=number`.
3. Sort, Find Car and Contact forms do nothing; payment radios are not grouped (several can be selected).
4. Fake catalog: 8 cars reuse 5 images, names do not match photos (a "Toyota Aventador" that shows a Nissan), every description is Lorem ipsum, ratings are always five stars, prices are in USD.
5. Template residue: Lorem ipsum, "Phone:" shown twice, social links `#`, typos ("Pupular", "Form Address").
6. Tooling: Create React App, Bootstrap + reactstrap + react-bootstrap + react-slick (four UI libraries for one site), icon font from a CDN.
7. No tests, no README, no SEO, English only.

## Done means
- Every link, form and button works; no crash on bad URLs (a friendly 404).
- Catalog of real cars whose names match their photos; search, filters (type, transmission, seats, price) and sorting, kept in the URL.
- Booking: pick-up and return date and time, extras, live price breakdown (days, extras, VAT), validation, confirmation with a reference, "My bookings" page with cancel.
- Pure, unit-tested pricing and date logic (min 1 day, return after pick-up, past dates rejected).
- Arabic and English with RTL, dark and light; prices in EGP.
- axe: 0 violations on every page, both languages and themes; keyboard usable.
- Lighthouse: mobile performance 90+, others 100.
- Vite + React 19 + Router 7, no UI framework, 0 `npm audit` issues, tests and CI, README with screenshots.

## Not doing
Backend, real payments (no card data is collected, ever), accounts. A concept site: the footer says so.

## Brand
"Masar Car Rental", fictional, Cairo. Prices in EGP per day.
