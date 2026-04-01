# Design System Documentation: The Editorial Dashboard

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Curator"
This design system rejects the clinical, cold nature of traditional SaaS dashboards in favor of an **editorial, high-end fintech aesthetic**. It is built on the philosophy that data is more digestible when presented with the breathability and intent of a premium physical magazine. 

We move beyond the "template" look by using exaggerated roundedness (`24px+`), intentional asymmetry, and a warm, tactile color palette. By treating the UI as a series of layered organic surfaces rather than a rigid grid of boxes, we create a workspace that feels both authoritative and approachable.

---

## 2. Colors

The palette is anchored by a sophisticated cream base, providing a "warm paper" feel that reduces eye strain and establishes a premium tone.

### Core Palette
- **Background (`#fffcf7`):** Our foundational "paper" layer.
- **Primary (`#9d4f00`):** Used for critical actions and brand expression.
- **Primary Container (`#f68a2f`):** A vibrant orange used for high-visibility cards and primary buttons to inject energy.
- **On-Surface (`#383835`):** A deep charcoal for maximum legibility without the harshness of pure black.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, designers must use background color shifts or tonal transitions. For example, a `surface-container-low` card sitting on a `surface` background creates a clear boundary through contrast rather than a 1px stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface tiers to create depth:
1.  **Canvas:** `surface` (`#fffcf7`)
2.  **Sectioning:** `surface-container` (`#f6f3ee`)
3.  **Floating Cards:** `surface-container-lowest` (`#ffffff`) for maximum "pop" and lift.

### The "Glass & Gradient" Rule
To add visual "soul," use subtle gradients on primary CTAs (transitioning from `primary` to `primary_container`). For floating utility panels (like search bars or user profiles), apply **Glassmorphism**: use a semi-transparent surface color with a `20px` backdrop-blur to allow underlying colors to bleed through softly.

---

## 3. Typography

The typography strategy pairs a high-character headline font with a functional, geometric body font to achieve an editorial balance.

*   **Headlines (Epilogue):** Bold, grounded, and authoritative. Used for `display` and `headline` roles to command attention.
*   **Body (Manrope):** Modern, clean, and highly legible. Used for `title`, `body`, and `label` roles to ensure clarity in dense data environments.

### Scale Highlights
- **Display-LG (3.5rem / Epilogue):** Used for hero numbers or major welcome states.
- **Headline-MD (1.75rem / Epilogue):** Standard for page titles.
- **Body-MD (0.875rem / Manrope):** The workhorse for all interface text and descriptions.

---

## 4. Elevation & Depth

We eschew traditional "Material" shadows in favor of **Tonal Layering** and **Ambient Light**.

### The Layering Principle
Hierarchy is achieved by stacking surface tiers. A `surface-container-lowest` card placed on a `surface-container` background creates a natural, soft lift. This is our primary method of elevation.

### Ambient Shadows
When a card requires true "float" (e.g., a hover state or a primary metric):
- **Blur:** Large and diffused (e.g., `32px` to `48px`).
- **Opacity:** Extremely low (`4%` to `8%`).
- **Tinting:** Never use pure black. Use a tinted version of `on_surface` (`#383835`) to mimic natural light.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in high-contrast modes), use a **Ghost Border**: the `outline_variant` token at `15%` opacity. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Cards
- **Corner Radius:** Always use `xl` (`3rem` / `48px`) for outer containers and `md` (`1.5rem` / `24px`) for nested elements.
- **Layout:** Card-based logic. Use vertical white space from the spacing scale (`8` or `10`) instead of divider lines to separate content.

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. White text (`on_primary`). Large corner radius (`full`).
- **Secondary:** `surface-container-high` background with `on_surface` text. No border.
- **Quick Action (FAB):** `primary` background with a soft, tinted ambient shadow.

### Input Fields
- **Styling:** Soft `surface-container` background. No border.
- **States:** On focus, transition the background to `surface-container-highest` or apply a subtle `primary` ghost border (20% opacity).

### Status Chips
- **Success:** Soft green background with deep green text.
- **Pending/Error:** Soft red/orange background (`error_container`) with high-contrast text.
- **Style:** Pill-shaped (`full` roundedness) with `label-md` typography.

---

## 6. Do's and Don'ts

### Do
- **DO** use generous whitespace. If in doubt, increase the spacing by one tier on the scale.
- **DO** use the `primary_container` (vibrant orange) to draw the eye to exactly one "Power Metric" per page.
- **DO** use asymmetry. Let sidebars and main content areas have different visual weights.

### Don't
- **DON'T** use 1px solid lines to separate list items or cards. Use background shifts.
- **DON'T** use standard grey shadows. Always tint shadows with the `on_surface` color.
- **DON'T** use sharp corners. Even the smallest tooltip should have a minimum of `sm` (`0.5rem`) roundedness.
- **DON'T** clutter the navigation. Use `label-md` and clear icons with ample breathing room.