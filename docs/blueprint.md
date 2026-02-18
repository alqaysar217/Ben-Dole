# **App Name**: BankTalabat

## Core Features:

- Secure User Authentication & Role Management: Implement robust user authentication with distinct roles (Super Admin, Department Supervisor, Employee), each having access to specific functionalities as per the provided credentials and access rules. This includes password protection and user identification.
- Dynamic Menu & Category Management: Provide Super Admins with a dedicated interface to easily add, edit, and delete menu items and their categories, including product names, prices (in YR), and add-ons.
- Intuitive Employee Order Interface: Allow employees to select their name from a dynamic list, browse available menu items, add/remove items using (+) and (-) buttons, and see a real-time total calculation in 'ريال يمني'. The system will prevent duplicate orders for the same employee within the same session unless explicitly added.
- Live Order Tracking & Supervisor Tools: Display a live feed of all pending and placed orders. Department Supervisors have a 'Copy Summary' button to generate and copy aggregated department orders formatted for easy sharing, such as via WhatsApp.
- Automated Delivery Rotation System: Manage the daily delivery person rotation among eligible employees. Includes features to mark a user as 'Done' (strikes through name) and a 'Skip' logic for Supervisors to defer a user's turn to the next cycle, with the rotation restarting after all eligible employees have taken their turn. The current day's assigned person is displayed in the Home Screen's top banner.
- AI-Powered Order Insight Tool: Provide Supervisors with an AI tool that analyzes their department's pending orders to offer insights such as frequently ordered combinations or potential forgotten items based on historical ordering patterns, aiding in generating comprehensive order summaries.

## Style Guidelines:

- Primary Color: A deep, professional blue (#1F4E94) to convey trust and corporate identity, ideal for main headings and interactive elements against a light background.
- Background Color: A clean, desaturated blue-grey (#ECF1F5) providing a modern and subtle backdrop that maintains clarity and complements the primary blue.
- Accent Color: A vibrant yet analogous cyan (#26BBDB) for call-to-action buttons, notifications, and key highlights, offering excellent contrast and visual emphasis.
- Font Recommendation: Use 'Inter' (sans-serif) for both headlines and body text. Its neutral, modern aesthetic aligns perfectly with a clean banking-style UI, ensuring high readability for both Arabic and Latin text.
- Style: Employ a set of clean, minimalist line icons throughout the application, ensuring consistency and clear visual communication across all functions and user roles, including navigation, order controls, and administrative actions.
- Structure: Utilize a card-based layout for displaying menu items and orders, enhancing readability and content organization. Implement fixed top and bottom navigation bars for consistent access to core application sections, maintaining a mobile-first, intuitive experience.
- Interaction: Incorporate subtle and smooth transition animations for navigation between screens and dynamic updates to lists (e.g., live orders, delivery rotation). Use understated loading indicators to enhance the user experience without being intrusive.