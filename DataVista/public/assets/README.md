# DataVista Asset Library (`/public/assets`)

Welcome to the official static asset repository for **DataVista**. All visual resources used across the web platform are organized, standardized, and maintained in this directory.

---

## 1. Directory Structure

```text
public/assets/
├── branding/
│   ├── logos/
│   │   ├── logo-mark.svg                 # Standalone DV + 3 rising bars emblem
│   │   ├── logo-primary.svg              # Mark + "DataVista" wordmark (light theme)
│   │   ├── logo-dark.svg                 # Mark + "DataVista" wordmark (dark themes)
│   │   ├── logo-white.svg                # Solid white monochrome logo
│   │   └── logo-monochrome.svg           # Single-color dark (#0F172A) logo
│   ├── favicons/
│   │   ├── favicon.svg                   # Vector favicon (squircle container)
│   │   ├── favicon.ico                   # Multi-resolution ICO (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
│   │   └── apple-touch-icon.png          # 180x180 iOS home screen icon
│   └── app-icons/
│       ├── icon-192.png                  # 192x192 PWA install icon
│       └── icon-512.png                  # 512x512 PWA splash / store icon
│
├── icons/
│   ├── custom/
│   │   ├── icon-google.svg               # Google 4-color OAuth emblem
│   │   └── icon-github.svg               # GitHub vector mark
│   └── social/
│       ├── icon-discord.svg              # Discord community mark
│       ├── icon-x.svg                    # X / Twitter vector mark
│       ├── icon-bluesky.svg              # Bluesky vector mark
│       └── icons-sprite.svg              # Social icons SVG sprite
│
├── illustrations/
│   ├── empty-states/
│   │   ├── illustration-empty-dashboard.svg  # Empty chart and dashboard state
│   │   ├── illustration-empty-data.svg       # Empty data table / records state
│   │   └── illustration-empty-chart.svg      # Visual builder unconfigured state
│   └── system/
│       ├── illustration-upload-success.svg   # Dataset ingestion confirmed graphic
│       └── illustration-error-404.svg        # Route not found 404 graphic
│
├── images/
│   ├── avatars/
│   │   └── avatar-default.svg            # Fallback user profile avatar
│   └── backgrounds/
│       ├── bg-grid-pattern.svg           # Tech grid pattern for panels and dropzones
│       └── hero-isometric.png            # 3D isometric platform graphic
│
└── README.md                             # This documentation
```

---

## 2. Naming Conventions

All assets follow strict naming conventions to maintain predictability and case safety across Unix/Linux hosting environments (e.g. Vercel, Docker):

- **Kebab-case only**: Lowercase letters, hyphens, no underscores or spaces (e.g., `illustration-empty-dashboard.svg`).
- **Category Prefixing**:
  - Logos: `logo-[variant].[ext]`
  - Icons: `icon-[name].[ext]`
  - Illustrations: `illustration-[type]-[context].[ext]`
  - Backgrounds: `bg-[name].[ext]` or `hero-[name].[ext]`
  - Avatars: `avatar-[name].[ext]`
- **No Temporary Suffixes**: Never commit files named `logo-final-v2.svg`, `test.png`, or `image1.png`.

---

## 3. Asset Categories & Rules

### 3.1 Branding
- **Logo Mark**: Scalable vector with three bar chart peaks: Cyan (`#0EA5E9`), Blue (`#2563EB`), Violet (`#7C3AED`).
- **Logos with Typography**: Set in `'Inter'` sans-serif with tracking `-0.03em`. "Data" is set to dark slate or white; "Vista" is set to electric blue.

### 3.2 Icons
- **UI Icons**: Consume the existing `lucide-react` library. Do not create redundant SVG files for icons that Lucide already supplies (e.g., `Search`, `Settings`, `Upload`, `Database`).
- **Custom / Brand Icons**: Located in `assets/icons/custom/` for third-party identity icons (Google, GitHub).

### 3.3 Illustrations
- All illustrations are vector SVGs with clean semantic layers, subtle drop shadows, and responsive `viewBox` coordinates.
- Empty states must clearly indicate what action the user should take to populate the view.

### 3.4 Fonts
- The application uses `Inter` loaded through system font stacks and CSS imports (`font-sans: 'Inter', sans-serif`).
- No commercial binary fonts are bundled.

### 3.5 Avatars
- Fallback avatar: `avatar-default.svg`.
- Runtime user avatars are loaded dynamically via authenticated Supabase metadata or fallback services (e.g., `unavatar.io`).

---

## 4. Usage & Import Rules in Next.js

Since these assets reside in Next.js's `/public` folder, reference them using root-relative paths in components and styles:

```tsx
// Example 1: HTML img tag
<img
  src="/assets/illustrations/empty-states/illustration-empty-dashboard.svg"
  alt="No Data"
  className="w-36 h-auto"
/>

// Example 2: Next.js Metadata (layout.tsx)
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

// Example 3: CSS Background Image
background-image: url('/assets/images/backgrounds/bg-grid-pattern.svg');
```

---

## 5. Dynamic and External Assets

- **User Uploads**: Datasets (.csv, .xlsx, .json) are parsed client-side using `xlsx` into `DatasetContext`.
- **User Avatars**: OAuth profile pictures are loaded directly from Google/GitHub CDNs.
- **Interactive Canvases**: 3D orb animations are drawn live via HTML5 Canvas in `<ThreeDAbstractBackground />`.
