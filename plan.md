# Project Overview

I want to build a web application that includes:

An endless “workbook” canvas where users can:
- Add tables with dummy data that they can drag and drop.
- Resize those tables.
- Mark specific tables as “expanded for PDF,” meaning that instead of 10 rows, they will show 50 rows only in the PDF view and not workbook view.

The workbook should use a pixel based layout.

A mechanism to export the workbook to a PDF by rendering the workbook in PDF mode when the `?pdf=true` query parameter is present in the URL.

- The PDF must be pixel perfect compared to the on-screen workbook layout.
- “Expanded” tables (50 rows) might break across multiple pages if they don’t fit on a single page. In this case calculate how many rows will fit on the page given where the table is placed and add that many rows and then paginate the rest of the rows in as many additional pages as needed.
    - Paginated tables on new pages should be placed on the top of the page
- Content below an expanded table in the workbook should be placed immediately after the expanded table in the PDF, potentially shifting to new pages if the table is too large.
- Expanded rows appear only in the PDF, while the workbook itself only shows 10 rows.

Technologies to use (only use what you need and add anything else that you think is necessary):
- React (with Vite)
- Typescript
- Shadcn UI
- TailwindCSS
- DND Kit for drag and drop functionality

Tasks:

- Implement the frontend UI (canvas, drag and drop, table rendering, “expanded in PDF” toggle).
- Implement a special PDF mode layout to handle pagination and expansions.
- Ensure that calling the /pdf route triggers a Puppeteer process that captures the correct layout.
