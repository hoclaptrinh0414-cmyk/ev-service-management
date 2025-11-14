# Admin Portal Design System Guide

## 🎨 Color Palette

### Primary Colors
```
Blue-600:    #2563eb  ████████  (Primary actions, links, active states)
Slate-900:   #0f172a  ████████  (Sidebar background)
Slate-800:   #1e293b  ████████  (Sidebar gradient, secondary elements)
```

### Status Colors
```
Emerald-500: #10b981  ████████  (Success, positive trends, "Normal" status)
Emerald-600: #059669  ████████  (Darker success state)
Red-500:     #ef4444  ████████  (Danger, "Need Maintenance" status)
Red-600:     #dc2626  ████████  (Darker danger state)
Yellow-500:  #f59e0b  ████████  (Warning, "Pending" status)
Orange-500:  #f97316  ████████  (Alert, medium priority)
Purple-500:  #a855f7  ████████  (Accent color for gradients)
```

### Neutral Colors
```
Gray-50:     #f9fafb  ████████  (Background, card hover)
Gray-100:    #f3f4f6  ████████  (Borders, dividers)
Gray-200:    #e5e7eb  ████████  (Input borders, subtle borders)
Gray-300:    #d1d5db  ████████  (Disabled states)
Gray-600:    #4b5563  ████████  (Secondary text)
Gray-900:    #111827  ████████  (Primary text, headings)
White:       #ffffff  ████████  (Card backgrounds, inputs)
```

---

## 📏 Typography Scale

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Text Sizes
```
text-xs:   0.75rem   (12px)  - Small labels, badges
text-sm:   0.875rem  (14px)  - Body text, descriptions
text-base: 1rem      (16px)  - Default text
text-lg:   1.125rem  (18px)  - Card titles
text-xl:   1.25rem   (20px)  - Section headers
text-2xl:  1.5rem    (24px)  - Page titles
text-3xl:  1.875rem  (30px)  - Large statistics
text-4xl:  2.25rem   (36px)  - Hero numbers
```

### Font Weights
```
font-normal:    400  - Body text
font-medium:    500  - Emphasized text
font-semibold:  600  - Subheadings
font-bold:      700  - Headings, statistics
```

---

## 📦 Component Specifications

### Sidebar Navigation

#### Dimensions
```
Collapsed:  80px width (w-20)
Expanded:   256px width (w-64)
Height:     100vh (full screen)
```

#### Navigation Item
```css
Padding:     py-3 px-3       (12px vertical, 12px horizontal)
Rounded:     rounded-xl      (12px border radius)
Gap:         gap-3           (12px between icon and text)
Icon Size:   w-5 h-5         (20px × 20px)
```

#### Active State
```css
Background:  bg-blue-600
Text:        text-white
Shadow:      shadow-lg shadow-blue-600/50
Indicator:   1px wide white bar on left edge
```

#### Hover State
```css
Background:  bg-slate-800
Text:        text-white
Transform:   scale-110 on icon
```

---

### Header

#### Dimensions
```
Height:      64px (h-16)
Position:    fixed top-0
Background:  bg-white/70 backdrop-blur-md
Border:      border-b border-gray-200
```

#### User Avatar
```css
Size:        w-8 h-8          (32px × 32px)
Rounded:     rounded-full
Background:  bg-gradient-to-br from-blue-500 to-purple-500
```

#### Logout Button
```css
Background:  bg-red-50
Text:        text-red-600
Border:      border border-red-200
Hover:       bg-red-100
```

---

### Cards

#### Standard Card
```css
Border:      border border-gray-200
Rounded:     rounded-xl         (12px)
Shadow:      shadow-sm
Hover:       shadow-lg
Transition:  transition-all duration-300
```

#### Card Header
```css
Border:      border-b border-gray-100
Background:  bg-gray-50
Padding:     p-6
```

#### Card Content
```css
Padding:     p-6
```

---

### Stat Card (Dashboard)

#### Container
```css
Background:  bg-white
Border:      border border-gray-200
Rounded:     rounded-2xl        (16px)
Padding:     p-6
Hover:       shadow-xl
```

#### Icon Container
```css
Size:        w-14 h-14          (56px × 56px)
Rounded:     rounded-2xl        (16px)
Background:  bg-gradient-to-br from-{color}-500 to-{color}-600
Shadow:      shadow-lg
Icon Size:   w-7 h-7            (28px × 28px)
```

#### Statistic Number
```css
Font Size:   text-4xl           (36px)
Weight:      font-bold
Color:       text-gray-900
```

#### Trend Badge
```css
Padding:     px-3 py-1
Rounded:     rounded-full
Font Size:   text-sm
Weight:      font-semibold
Positive:    bg-emerald-50 text-emerald-600
Negative:    bg-red-50 text-red-600
```

---

### Buttons

#### Primary Button
```css
Background:  bg-blue-600
Text:        text-white
Padding:     px-4 py-2.5
Rounded:     rounded-xl
Hover:       bg-blue-700
Shadow:      shadow-lg shadow-blue-600/30
Transition:  transition-colors
```

#### Secondary Button
```css
Border:      border border-gray-300
Text:        text-gray-700
Background:  bg-white
Padding:     px-4 py-2.5
Rounded:     rounded-xl
Hover:       bg-gray-50
```

#### Icon Button
```css
Padding:     p-2
Rounded:     rounded-lg
Hover:       bg-{color}-50
Icon Color:  text-{color}-600
```

---

### Form Inputs

#### Text Input
```css
Width:       w-full
Padding:     px-4 py-2.5
Border:      border border-gray-300
Rounded:     rounded-xl
Focus:       ring-2 ring-blue-500 border-blue-500
Outline:     outline-none
Transition:  transition-all
```

#### Select Dropdown
```css
Padding:     px-4 py-2.5
Border:      border border-gray-300
Rounded:     rounded-xl
Background:  bg-white
Focus:       ring-2 ring-blue-500 border-blue-500
```

#### Search Input
```css
Padding:     pl-10 pr-4 py-2.5   (left padding for icon)
Icon:        absolute left-3 top-1/2 -translate-y-1/2
Icon Size:   w-5 h-5
Icon Color:  text-gray-400
```

---

### Status Badges

#### Badge Structure
```css
Display:     inline-flex
Padding:     px-3 py-1
Rounded:     rounded-full
Font Size:   text-xs
Weight:      font-semibold
Border:      border
```

#### Status Variants
```css
Success:
  bg-emerald-50 text-emerald-700 border-emerald-200

Warning:
  bg-yellow-50 text-yellow-700 border-yellow-200

Danger:
  bg-red-50 text-red-700 border-red-200

Info:
  bg-blue-50 text-blue-700 border-blue-200
```

---

### Data Tables

#### Table Container
```css
Overflow:    overflow-x-auto
```

#### Table Header
```css
Background:  bg-gray-50
Border:      border-b border-gray-200
Padding:     py-4 px-6
Font Size:   text-xs
Weight:      font-semibold
Color:       text-gray-600
Transform:   uppercase
Tracking:    tracking-wider
```

#### Table Row
```css
Border:      border-b border-gray-100
Hover:       bg-gray-50
Transition:  transition-colors
```

#### Table Cell
```css
Padding:     py-4 px-6
Font Size:   text-sm
Color:       text-gray-900
```

---

### Progress Bars

#### Container
```css
Width:       w-24 or w-full
Height:      h-2
Background:  bg-gray-200
Rounded:     rounded-full
Overflow:    overflow-hidden
```

#### Fill Bar
```css
Height:      h-full
Rounded:     rounded-full
Transition:  transition-all duration-500
Colors:
  ≥80%:      bg-emerald-500
  50-79%:    bg-yellow-500
  <50%:      bg-red-500
```

---

### Modals/Dialogs

#### Overlay
```css
Background:  bg-black/50
Backdrop:    backdrop-blur-sm
Position:    fixed inset-0
Z-index:     z-50
```

#### Modal Content
```css
Background:  bg-white
Rounded:     rounded-2xl
Shadow:      shadow-2xl
Max Width:   max-w-2xl
Padding:     p-6
```

---

## 🎭 Animation Specifications

### Standard Transition
```css
transition: all 300ms ease-in-out;
```

### Hover Effects
```css
Transform:   hover:scale-110        (icon scale)
Transform:   hover:-translate-y-1   (card lift)
Shadow:      hover:shadow-xl        (card shadow)
Gap:         hover:gap-2            (arrow shift)
```

### Loading States
```css
Animation:   animate-pulse
Background:  bg-gray-200
```

### Fade In
```css
Animation:   animate-in fade-in duration-500
```

---

## 📐 Spacing System

### Container
```css
Max Width:   max-w-7xl             (1280px)
Margin:      mx-auto
Padding:     p-6 md:p-10
```

### Grid Gaps
```css
gap-4:       16px
gap-6:       24px
```

### Component Spacing
```css
space-y-4:   16px vertical gap
space-y-6:   24px vertical gap
space-y-8:   32px vertical gap
```

---

## 🎯 Responsive Breakpoints

```css
sm:  640px   (Mobile landscape)
md:  768px   (Tablet)
lg:  1024px  (Desktop)
xl:  1280px  (Large desktop)
```

### Common Responsive Patterns

#### Grid Columns
```css
grid-cols-1              (Mobile)
md:grid-cols-2           (Tablet)
lg:grid-cols-4           (Desktop)
```

#### Padding
```css
p-6                      (Mobile)
md:p-10                  (Desktop)
```

#### Hide/Show
```css
hidden                   (Hide on mobile)
md:block                 (Show on tablet+)
md:inline                (Inline on tablet+)
```

---

## ✨ Special Effects

### Glass Morphism
```css
background: bg-white/70
backdrop-filter: backdrop-blur-md
```

### Gradient Backgrounds
```css
bg-gradient-to-br from-blue-500 to-purple-500
bg-gradient-to-br from-emerald-500 to-emerald-600
bg-gradient-to-b from-slate-900 to-slate-800
```

### Shadows with Color
```css
shadow-lg shadow-blue-600/30      (30% opacity blue shadow)
shadow-xl shadow-blue-600/50      (50% opacity blue shadow)
```

---

## 📱 Mobile Optimization

### Sidebar Behavior
- Mobile: Hidden by default, toggle with hamburger menu
- Tablet: Visible, collapsible
- Desktop: Always visible, collapsible

### Touch Targets
- Minimum size: 44px × 44px
- Padding: at least 12px around clickable elements

### Typography Scaling
- Mobile: Slightly smaller (text-sm)
- Desktop: Standard size (text-base)

---

## 🔧 Utility Classes Reference

### Flexbox
```css
flex                     Display flex
items-center            Align items center
justify-between         Justify content space-between
gap-{n}                 Gap between items
```

### Grid
```css
grid                    Display grid
grid-cols-{n}          Number of columns
gap-{n}                Gap between items
```

### Positioning
```css
fixed                   Fixed position
absolute               Absolute position
relative               Relative position
inset-0                top/right/bottom/left: 0
```

### Z-Index
```css
z-30                   Header
z-40                   Sidebar
z-50                   Modal overlay
```

---

## 🎨 Example Component Code

### Stat Card
```jsx
<Card className="hover:shadow-xl transition-all duration-300 border-gray-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
        <TrendingUp className="w-4 h-4" />
        +15.3%
      </div>
    </div>
    <h3 className="text-4xl font-bold text-gray-900 mb-1">1,247</h3>
    <p className="text-sm text-gray-600 font-medium">Total Vehicles</p>
  </CardContent>
</Card>
```

### Status Badge
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
  Completed
</span>
```

### Primary Button
```jsx
<button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30">
  <Plus className="w-5 h-5" />
  Add New
</button>
```

---

**Design System Version**: 2.0.0  
**Last Updated**: November 11, 2025  
**Maintained by**: EV Service Center Development Team
