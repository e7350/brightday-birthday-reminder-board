# BrightDay - Birthday Reminder Board

BrightDay is a small, elegant birthday reminder board built for quick use and great visuals. It was created using the simplest app scaffolding from [Teda.dev](https://teda.dev), which helps build small web apps quickly and reliably.

What it does

- Add, edit, and delete birthday entries.
- Quick Add form for fast input.
- Search and filters for Today or This week.
- Sort by soonest or name.
- Data persists to your browser via localStorage so your board is available on reload.

Files

- index.html - Beautiful landing page and CTA to the app.
- app.html - The main, fully interactive birthday board.
- styles/main.css - Custom CSS complementing Tailwind utilities.
- scripts/helpers.js - Utilities for storage, date math, and avatar colors.
- scripts/ui.js - App namespace, UI wiring, rendering, and event handling.
- scripts/main.js - Entry point that initializes App on document ready.

Notes

- The interface is designed to be mobile-first, accessible, and responsive with generous white space and clear call-to-action elements.
- BrightDay uses Tailwind Play CDN and jQuery 3.7.x for rapid styling and concise DOM handling.

Getting started

1. Open index.html in your browser to see the landing page.
2. Click Open Board to go to app.html and begin adding birthdays.

This project was built by Teda.dev to demonstrate a complete, production-like single-user web app experience.

<!-- Teda Live URL -->
Live URL: https://e7350.github.io/brightday-birthday-reminder-board/
