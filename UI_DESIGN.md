# UI Design System: Folio

## Design Direction

**Neobank native, not crypto.** Think Mercury, Ramp, or Robinhood. Dark mode, emerald accents, big numbers, zero clutter. Nothing should look, feel, or read like a crypto app. No hex addresses, no "on-chain", no token IDs in the UI. The collar math is invisible plumbing... the UI shows outcomes, not formulas. Desktop gets a sidebar nav, mobile gets a bottom tab bar. Responsive, one codebase.

## Color Palette

```css
:root {
  /* Backgrounds */
  --bg-base:      #0A0A0B;    /* App background */
  --bg-surface:   #141415;    /* Cards, panels */
  --bg-elevated:  #1C1C1E;    /* Modals, popovers, hover states */
  --bg-input:     #1C1C1E;    /* Input fields */
  
  /* Borders */
  --border:       #2A2A2E;    /* Default border */
  --border-focus: #10B981;    /* Focused input border */
  
  /* Text */
  --text-primary:   #E8E8ED;  /* Headings, primary content */
  --text-secondary: #8E8E93;  /* Labels, captions, muted */
  --text-tertiary:  #636366;  /* Disabled, placeholder */
  
  /* Accent: Emerald (money, growth, success) */
  --accent:       #10B981;    /* Primary accent */
  --accent-hover: #059669;    /* Hover state */
  --accent-muted: rgba(16, 185, 129, 0.12); /* Badge backgrounds, subtle highlights */
  
  /* Semantic */
  --positive:     #10B981;    /* Gains, success */
  --negative:     #EF4444;    /* Losses, errors */
  --warning:      #F59E0B;    /* Caution */
  --info:         #3B82F6;    /* Informational */
  
  /* Special */
  --collar-floor: #EF4444;    /* Put/floor line in collar viz */
  --collar-cap:   #10B981;    /* Call/cap line in collar viz */
  --collar-band:  rgba(16, 185, 129, 0.08); /* Collar band fill */
}
```

## Typography

Font: **Inter** (system fallback: -apple-system, BlinkMacSystemFont, sans-serif)

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display (portfolio value) | 48px | 700 | 1.0 | -0.02em |
| H1 (page title) | 28px | 600 | 1.2 | -0.02em |
| H2 (section title) | 20px | 600 | 1.3 | -0.01em |
| H3 (card title) | 16px | 600 | 1.4 | 0 |
| Body | 15px | 400 | 1.5 | 0 |
| Caption | 13px | 400 | 1.4 | 0 |
| Mono (amounts, prices) | 15px | 500 | 1.4 | 0.02em |

Mono amounts use `font-variant-numeric: tabular-nums` so dollar signs and digits align in columns.

## Spacing

8px base grid. Components use multiples: 4, 8, 12, 16, 24, 32, 48, 64.

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 4px | Inline gaps, icon margins |
| `--space-sm` | 8px | Compact padding |
| `--space-md` | 16px | Card padding, section gaps |
| `--space-lg` | 24px | Page margins, large gaps |
| `--space-xl` | 32px | Section separation |
| `--space-2xl` | 48px | Major sections |

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 8px | Buttons, badges, inputs |
| `--radius-md` | 12px | Cards |
| `--radius-lg` | 16px | Modals, large panels |
| `--radius-full` | 9999px | Pills, avatar circles |

## Component Patterns

### Cards
- Background: `var(--bg-surface)`
- Border: 1px solid `var(--border)`
- Radius: `var(--radius-md)`
- Padding: 20px
- No box-shadow (flat design, borders only)

### Buttons
- **Primary:** bg `var(--accent)`, text white, radius `var(--radius-sm)`, height 44px, font-weight 600
- **Secondary:** bg transparent, border 1px `var(--border)`, text `var(--text-primary)`, same dimensions
- **Ghost:** bg transparent, no border, text `var(--text-secondary)`, underline on hover
- All buttons: 15px font, 0 → 100ms transition on bg color

### Inputs
- Background: `var(--bg-input)`
- Border: 1px solid `var(--border)`, focus: `var(--border-focus)`
- Radius: `var(--radius-sm)`
- Height: 44px
- Padding: 0 12px
- Dollar amounts: left-aligned, large (28px), mono font

### Navigation
- Bottom tab bar on mobile (4 tabs: Portfolio, Spend, Notes, Settings)
- Top bar: logo left, wallet status right
- No hamburger menu, no sidebar

### Status Badges
- Rounded pill shape (`var(--radius-full)`)
- Tiny: 10px font, 4px 8px padding
- Colors: active=emerald bg, repaid=blue bg, expired=gray bg

## Screen Layouts

### 1. Portfolio Screen (home)
```
[Top bar: "Folio" logo | wallet indicator]

[Display number: $9,900.00]
[Caption: Portfolio Value]
[Change badge: +$125.00 (+1.28%) today]

[Holdings card]
  [TSLA row: icon | Tesla | 44 shares | $225.00 | $9,900 | +1.3%]
  [AAPL row: icon | Apple  | 0 shares  | $189.50 | $0     | — ]

[Quick Actions card]
  [Big green button: "Spend from Portfolio"]
  [Text: "0% interest, no liquidation"]

[Recent Activity card]
  [Spend Note #003: -$50.00 | 2 min ago | active]
  [Spend Note #002: -$25.00 | 1 hr ago  | active]

[Bottom nav: Portfolio* | Spend | Notes | Settings]
```

### 2. Spend Flow Screen
Step 1: Amount entry
```
[Back arrow | "Spend"]

[Large input: $ ____]
[Caption: Available: up to $472.50 from TSLA]

[Asset selector: TSLA selected (only option in v1)]

[Collar Preview card (appears as you type)]
  [Shares collared: 0.234 TSLA ($52.63)]
  [Protected range: $213.75 - $258.75]
  [You receive: $50.00 USDC]
  [Platform fee: $2.63 (5%)]
  [Interest: 0%]
  
  [Expandable: "How does this work?"]
    [Simple explanation: collar diagram, floor/cap visual]

[Green button: "Spend $50.00"]
```

Step 2: Confirmation (brief, 1-2 seconds)
```
[Animated check mark]
[Large: "Spent $50.00"]
[Caption: "0.234 TSLA collared at $213.75-$258.75"]
[Button: "View Spend Note"]
[Button: "Done"]
```

### 3. Spend Note Detail Screen
```
[Back arrow | "Spend Note #003"]

[Status badge: Active]
[Large: $50.00]
[Caption: "Advance against TSLA"]
[Date: Apr 3, 2026 at 3:42pm]

[Collar Visualization]
  [Horizontal bar showing floor ($213.75) | current ($225) | cap ($258.75)]
  [Current price dot animated on the bar]
  [Green zone = safe, approach floor = yellow → red]

[Details card]
  [Shares locked:     0.234 TSLA]
  [Lock value:        $52.63]
  [Advance:           $50.00 USDC]
  [Platform spread:   $2.63]
  [Interest rate:     0%]
  [Expires:           May 3, 2026]

[On-chain card]
  [NFT Token ID:  0.0.xxxxx]
  [Transaction:   0.0.xxxxx (link to Hashscan)]
  [IPFS:          ipfs://Qm... (link)]

[Button: "Repay $50.00" (disabled for v1, shows "Coming soon")]
```

## Collar Visualization

The collar viz is the "wow" visual. A horizontal bar:

```
|----[FLOOR $213.75]=====[CURRENT $225.00]============[CAP $258.75]----|
     red marker         green dot (pulsing)           green marker
```

- Full width of card
- Floor marker: red, left side
- Cap marker: emerald, right side  
- Current price: animated dot, emerald with pulse glow
- Band between floor and cap: subtle emerald fill (8% opacity)
- Below the bar: min/max labels
- The dot moves in real-time as price updates (SWR, 60s refresh)

## Animations (Framer Motion)

- **Page transitions:** slide left/right, 200ms, ease-out
- **Card entrance:** fade up 12px, 300ms, staggered 50ms between cards
- **Spend confirmation:** check mark scales from 0 to 1 with spring physics
- **Price updates:** number counter animation (old → new), 400ms
- **Collar dot:** continuous subtle pulse (scale 1.0 → 1.15, 2s loop)
- **Button press:** scale 0.97, 100ms

## Mobile First

- All layouts designed for 375px width first
- Max content width: 480px (centered on desktop)
- Bottom nav: fixed, 64px height, safe area padding
- Touch targets: minimum 44x44px
- No hover-dependent interactions

## Demo Mode Considerations

- Pre-seeded account skips onboarding entirely
- Portfolio shows immediately (no empty state needed for demo)
- Prices update live during the 3-min pitch
- Spend flow is 2 taps: enter amount → confirm
- Spend Note appears instantly after confirmation

## Dark Mode Only

No light mode toggle. Dark mode is the brand. Matches the "premium fintech" positioning and every successful crypto app (Robinhood dark, Phantom, Rainbow).
