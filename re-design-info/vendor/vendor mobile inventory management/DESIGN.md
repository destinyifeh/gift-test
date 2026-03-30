# Design System Specification: Editorial Warmth & Tonal Layering

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Warm Curator."** 

Moving away from the sterile, blue-tinted "SaaS default" look, this system embraces a sophisticated, editorial aesthetic that prioritizes human connection. We achieve this through a palette of sun-drenched terracottas and creams, paired with a bold typographic hierarchy. 

To break the "template" look, the design system utilizes **intentional asymmetry** and **tonal depth**. Instead of boxing content into rigid grids with harsh lines, we use generous white space and overlapping surface transitions to guide the eye. The interface should feel less like a software dashboard and more like a high-end digital lifestyle magazine—tactile, premium, and deeply intentional.

---

## 2. Colors
Our color strategy focuses on a "warm monochromatic" foundation, using the orange primary as a vibrant accent against a creamy, multi-layered background.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Traditional borders create visual noise and make an app feel "boxed in." Boundaries must be defined solely through background color shifts. For example, a card (using `surface_container_lowest`) should sit atop a background (using `surface`) to create definition.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to define depth:
*   **Base Layer:** `surface` (#fff4ef)
*   **Secondary Content Areas:** `surface_container_low` (#ffede2)
*   **Interactive Cards/Modules:** `surface_container_lowest` (#ffffff)
*   **Elevated Overlays:** `surface_bright` (#fff4ef)

### The "Glass & Gradient" Rule
To elevate the experience, floating elements (like top navigation or mobile headers) should utilize **Glassmorphism**. Use `surface` at 80% opacity with a `backdrop-blur` of 20px. 

### Signature Textures
CTAs and Hero states should not be flat. Use subtle linear gradients transitioning from `primary` (#964300) to `primary_container` (#f9873e) at a 135-degree angle. This adds a "soul" and professional polish that mimics high-end print production.

---

## 3. Typography
We use a dual-font system to balance authoritative headers with highly readable functional text.

*   **Display & Headlines (Plus Jakarta Sans):** A modern, geometric sans-serif with a touch of character. The `display-lg` (3.5rem) and `headline-md` (1.75rem) tokens should be used for editorial impact and page titles, creating a clear entry point for the user's eye.
*   **Titles & Body (Manrope):** Chosen for its exceptional legibility and warmth at smaller scales. Use `title-lg` (1.375rem) for gift amounts and transactional headings to ensure they feel "heavy" and important.
*   **Labels (Manrope):** `label-md` and `label-sm` are reserved for metadata (e.g., status badges, dates). These should often use the `on_surface_variant` (#7d522b) color to maintain a soft hierarchy.

---

## 4. Elevation & Depth
In this design system, shadows are a last resort, not a default. We convey importance through **Tonal Layering**.

*   **The Layering Principle:** Place `surface_container_highest` elements only inside `surface_container_low` environments. This "nesting" creates natural focus without the need for structural lines.
*   **Ambient Shadows:** If an element must float (e.g., a Bottom Sheet), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(73, 38, 4, 0.06);`. Note that the shadow is a tinted version of `on_surface`, never pure black or grey.
*   **The "Ghost Border":** For interactive inputs or accessibility needs, use a "Ghost Border": `outline_variant` (#d9a275) at 15% opacity. It should be felt, not seen.
*   **Glassmorphism:** For mobile-native feel, use semi-transparent `surface_container` colors on bottom sheets to allow the content behind to bleed through softly, grounding the overlay in the current context.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text, `xl` (1.5rem) rounded corners.
*   **Secondary:** `surface_container_high` fill, `primary` text. No border.
*   **Tertiary:** Transparent fill, `primary` text, with an underline appearing only on hover.

### Bottom Sheets (Mobile Native)
Instead of modals, all mobile actions use **Bottom Sheets**. 
*   **Radius:** `xl` (1.5rem) on top corners only.
*   **Handle:** A subtle `outline_variant` pill at the top center.
*   **Interaction:** Smooth spring physics (damping: 0.8) for a native feel.

### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal lines between list items. Use the **Spacing Scale** (token `4` or `1.4rem`) to create separation.
*   **Transactional Data:** Gift amounts should use `title-lg` in `on_surface`. Status badges (e.g., "Success") should use `secondary_container` with `on_secondary_container` text and `full` rounding.

### Input Fields
*   **Styling:** Use `surface_container_low` for the background. On focus, transition the background to `surface_container_lowest` and apply a 1px "Ghost Border."
*   **Labels:** Use `label-md` floating above the field to maximize vertical white space.

---

## 6. Do's and Don'ts

### Do
*   **Do** use the Spacing Scale religiously. If an element feels cramped, move from scale `4` to scale `6`.
*   **Do** use `full` roundedness for badges and chips to maintain a "friendly" and "approachable" UI.
*   **Do** group related information using background color blocks (e.g., a `surface_container_low` wrapper for "Recent Activity").

### Don't
*   **Don't** use 1px grey borders for cards or sections. It shatters the high-end editorial feel.
*   **Don't** use standard "Drop Shadows." Stick to Tonal Layering or Ambient Shadows.
*   **Don't** use pure black (#000000). Always use `on_surface` (#492604) for text to maintain the warm, premium tonal quality.
*   **Don't** use Modals on mobile. They feel like "web" artifacts; use Bottom Sheets for a native experience.