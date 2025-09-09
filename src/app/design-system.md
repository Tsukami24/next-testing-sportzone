# E-Commerce Design System (Modern Minimalist)

## Color Palette

### Primary Colors
- **Primary**: `#3B82F6` (Blue-500) - For primary actions like "Add to Cart", "Checkout"
- **Primary Dark**: `#2563EB` (Blue-600) - For hover states of primary buttons
- **Secondary**: `#6B7280` (Gray-500) - For secondary actions and less important elements
- **Secondary Dark**: `#4B5563` (Gray-600) - For hover states of secondary buttons

### Background Colors
- **Page Background**: `#F9FAFB` (Gray-50) - Main page background
- **Card Background**: `#FFFFFF` (White) - Product cards, content sections
- **Header/Footer Background**: `#FFFFFF` (White) with subtle shadow
- **Input Background**: `#F9FAFB` (Gray-50) - Form fields, search boxes

### Text Colors
- **Heading Text**: `#111827` (Gray-900) - Main headings
- **Body Text**: `#374151` (Gray-700) - Paragraphs and general content
- **Muted Text**: `#9CA3AF` (Gray-400) - Secondary information, placeholders
- **Link Text**: `#3B82F6` (Blue-500) - Hyperlinks

### Status Colors
- **Success**: `#10B981` (Emerald-500) - For success messages, available products
- **Warning**: `#F59E0B` (Amber-500) - For warnings, low stock items
- **Error**: `#EF4444` (Red-500) - For errors, invalid inputs
- **Info**: `#6B7280` (Gray-500) - For informational messages

## Typography

### Font Family
- **Primary Font**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Secondary Font**: Monospace for technical information (IDs, codes, etc.)

### Heading Sizes
- **H1**: 32px, Semi-bold (600)
- **H2**: 24px, Semi-bold (600)
- **H3**: 20px, Semi-bold (600)
- **H4**: 18px, Medium (500)
- **H5**: 16px, Medium (500)

### Body Text Sizes
- **Body Large**: 16px, Regular (400)
- **Body Medium**: 14px, Regular (400)
- **Body Small**: 12px, Regular (400)

### Special Text Styles
- **Pricing**: 20px, Semi-bold (600), Success color
- **Button Text**: 14px, Medium (500)
- **Label Text**: 12px, Semi-bold (600), Muted color

## Spacing System

### Base Unit
- **Base Unit**: 4px
- All spacing should be multiples of the base unit

### Padding/Margin Scale
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **2XL**: 48px
- **3XL**: 64px

### Component Spacing
- **Card Padding**: 24px (LG)
- **Section Gaps**: 32px (XL)
- **Element Gaps**: 16px (MD)
- **Button Padding**: 12px 24px (Vertical: SM, Horizontal: LG)

## Component Styles

### Buttons
- **Border Radius**: 8px
- **Border**: None
- **Transition**: 0.2s ease all
- **Primary Button**:
  - Background: Primary color
  - Text: White
  - Hover: Primary Dark
- **Secondary Button**:
  - Background: Secondary color
  - Text: White
  - Hover: Secondary Dark
- **Outline Button**:
  - Background: Transparent
  - Border: 1px solid Secondary color
  - Text: Secondary color
  - Hover: Secondary color background with white text

### Cards
- **Border Radius**: 12px
- **Box Shadow**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **Border**: 1px solid `#E5E7EB` (Gray-200)
- **Padding**: 24px (LG)

### Input Fields
- **Border Radius**: 8px
- **Border**: 1px solid `#D1D5DB` (Gray-300)
- **Padding**: 12px 16px
- **Focus Border**: 2px solid Primary color
- **Background**: Input Background

### Navigation
- **Link Spacing**: 16px (MD) horizontal padding
- **Active Indicator**: 3px bottom border in Primary color
- **Hover Effect**: Background change to `#F3F4F6` (Gray-100)

## Responsive Breakpoints

- **Mobile**: 0px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

## Additional Design Principles

1. **Consistent White Space**: Use ample white space to create a clean, uncluttered look
2. **Visual Hierarchy**: Clear distinction between headings, subheadings, and body text
3. **Accessibility**: Ensure sufficient color contrast and focus states
4. **Consistent Corners**: Use consistent border-radius across all components
5. **Subtle Shadows**: Use light shadows to create depth without overwhelming the design
6. **Limited Color Palette**: Stick to the defined colors to maintain visual consistency