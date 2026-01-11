# Theme Customization Guide

This guide explains how to customize all UI elements in your theme, including colors, typography, hero section, buttons, cards, navigation, forms, spacing, and more.

## Overview

The theme system provides comprehensive customization options for every aspect of your site's UI. All customizations are managed through the theme configuration and applied automatically via CSS variables.

## Theme Configuration Structure

The theme configuration is defined in the `IThemeConfig` interface and includes the following sections:

### 1. Color Palette

Customize the color scheme of your entire site.

```typescript
colors: {
  primary: '#003450',        // Main brand color
  secondary: '#3A506B',      // Secondary brand color
  accent: '#003450',         // Accent color for highlights
  background: '#F8F9FA',     // Page background
  text: '#3D3D3D',           // Main text color
  textLight: '#6B7280',      // Secondary text color
  white: '#FFFFFF',           // White color
  black: '#000000',           // Black color
  success: '#10B981',         // Success state color
  warning: '#F59E0B',         // Warning state color
  error: '#EF4444',          // Error state color
  info: '#3B82F6',           // Info state color
}
```

**Usage in components:**
```css
color: var(--theme-primary);
background: var(--theme-background);
```

### 2. Typography

Control fonts, sizes, weights, and line heights.

#### Fonts
```typescript
typography: {
  fonts: {
    heading: 'Inter',     // Font for headings
    body: 'Inter',        // Font for body text
    button: 'Inter',      // Font for buttons
    nav: 'Inter',         // Font for navigation
  }
}
```

#### Font Sizes
```typescript
typography: {
  sizes: {
    h1: '3rem',        // Heading 1
    h2: '2.5rem',      // Heading 2
    h3: '2rem',        // Heading 3
    h4: '1.5rem',      // Heading 4
    h5: '1.25rem',     // Heading 5
    h6: '1rem',        // Heading 6
    body: '1rem',      // Body text
    small: '0.875rem',  // Small text
    tiny: '0.75rem',    // Tiny text
  }
}
```

#### Font Weights
```typescript
typography: {
  weights: {
    light: '300',      // Light weight
    normal: '400',     // Normal weight
    medium: '500',     // Medium weight
    semibold: '600',   // Semibold weight
    bold: '700',       // Bold weight
    extrabold: '800',  // Extra bold weight
  }
}
```

#### Line Heights
```typescript
typography: {
  lineHeights: {
    tight: '1.25',     // Tight line height
    normal: '1.5',     // Normal line height
    relaxed: '1.75',   // Relaxed line height
    loose: '2',        // Loose line height
  }
}
```

**Usage in components:**
```css
font-family: var(--font-heading);
font-size: var(--text-h1);
font-weight: var(--font-bold);
line-height: var(--leading-normal);
```

### 3. Hero Section

Customize the hero section with full control over appearance and content.

```typescript
hero: {
  enabled: true,                    // Enable/disable hero
  height: '80vh',                  // Hero height
  minHeight: '600px',              // Minimum height
  backgroundColor: 'linear-gradient(135deg, #003450 0%, #3A506B 100%)',
  backgroundImage: '',             // Background image URL
  overlay: {
    enabled: true,
    color: '#000000',
    opacity: 0.4,
  },
  title: {
    text: 'Welcome to Fixral',
    color: '#FFFFFF',
    fontSize: '3.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '1.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    text: 'Innovative solutions for your business',
    color: '#F3F4F6',
    fontSize: '1.25rem',
    fontWeight: '400',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  buttons: {
    primary: {
      text: 'Get Started',
      backgroundColor: '#FFFFFF',
      textColor: '#003450',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      hoverBackgroundColor: '#F3F4F6',
      hoverTextColor: '#003450',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    secondary: {
      text: 'Learn More',
      backgroundColor: 'transparent',
      textColor: '#FFFFFF',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      borderColor: '#FFFFFF',
      borderWidth: '2px',
      hoverBackgroundColor: 'rgba(255,255,255,0.1)',
      hoverTextColor: '#FFFFFF',
    },
  },
  alignment: 'center',              // 'left' | 'center' | 'right'
  animation: {
    enabled: true,
    type: 'fade-up',
    duration: '0.8s',
  },
}
```

**Using the `useThemeStyles` hook:**
```tsx
import { useThemeStyles } from '@/hooks/useThemeStyles';

function HeroSection() {
  const { getHeroStyles, getHeroTitleStyles, getHeroSubtitleStyles } = useThemeStyles();
  
  return (
    <section style={getHeroStyles()}>
      <h1 style={getHeroTitleStyles()}>Welcome</h1>
      <p style={getHeroSubtitleStyles()}>Subtitle</p>
    </section>
  );
}
```

### 4. Button Styles

Customize three button variants: primary, secondary, and tertiary.

```typescript
buttons: {
  primary: {
    backgroundColor: '#003450',
    textColor: '#FFFFFF',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    hoverBackgroundColor: '#002538',
    hoverTextColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  secondary: {
    backgroundColor: 'transparent',
    textColor: '#003450',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    borderColor: '#003450',
    borderWidth: '2px',
    hoverBackgroundColor: '#003450',
    hoverTextColor: '#FFFFFF',
    transition: 'all 0.3s ease',
  },
  tertiary: {
    backgroundColor: '#3A506B',
    textColor: '#FFFFFF',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    hoverBackgroundColor: '#2D3F52',
    hoverTextColor: '#FFFFFF',
    transition: 'all 0.3s ease',
  },
}
```

**Usage in components:**
```css
.btn-primary {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-color);
  font-size: var(--btn-primary-font-size);
  font-weight: var(--btn-primary-font-weight);
  padding: var(--btn-primary-padding);
  border-radius: var(--btn-primary-radius);
  box-shadow: var(--btn-primary-shadow);
  transition: var(--btn-primary-transition);
}

.btn-primary:hover {
  background-color: var(--btn-primary-hover-bg);
  color: var(--btn-primary-hover-color);
}
```

### 5. Card Styles

Customize card appearance for content sections.

```typescript
cards: {
  backgroundColor: '#FFFFFF',
  padding: '1.5rem',
  borderRadius: '0.75rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  hoverShadow: '0 10px 15px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#003450',
    marginBottom: '0.75rem',
  },
  description: {
    fontSize: '0.875rem',
    color: '#6B7280',
    lineHeight: '1.6',
  },
}
```

**Usage in components:**
```css
.card {
  background-color: var(--card-bg);
  padding: var(--card-padding);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition: var(--card-transition);
}

.card:hover {
  box-shadow: var(--card-hover-shadow);
}

.card-title {
  font-size: var(--card-title-font-size);
  font-weight: var(--card-title-font-weight);
  color: var(--card-title-color);
  margin-bottom: var(--card-title-margin-bottom);
}

.card-description {
  font-size: var(--card-desc-font-size);
  color: var(--card-desc-color);
  line-height: var(--card-desc-line-height);
}
```

### 6. Navigation Styles

Customize the navigation bar appearance.

```typescript
navigation: {
  backgroundColor: '#FFFFFF',
  textColor: '#003450',
  hoverColor: '#3A506B',
  activeColor: '#003450',
  fontSize: '1rem',
  fontWeight: '500',
  padding: '1rem 1.5rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  sticky: true,
  height: '70px',
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#003450',
  },
}
```

**Usage in components:**
```css
.nav {
  background-color: var(--nav-bg);
  color: var(--nav-color);
  font-size: var(--nav-font-size);
  font-weight: var(--nav-font-weight);
  padding: var(--nav-padding);
  box-shadow: var(--nav-shadow);
  height: var(--nav-height);
}

.nav-link:hover {
  color: var(--nav-hover-color);
}

.nav-link.active {
  color: var(--nav-active-color);
}

.nav-logo {
  font-size: var(--nav-logo-font-size);
  font-weight: var(--nav-logo-font-weight);
  color: var(--nav-logo-color);
}
```

### 7. Spacing System

Define a consistent spacing scale.

```typescript
spacing: {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}
```

**Usage in components:**
```css
.margin-sm { margin: var(--spacing-sm); }
.padding-lg { padding: var(--spacing-lg); }
.gap-xl { gap: var(--spacing-xl); }
```

### 8. Border Radius

Define border radius values for rounded corners.

```typescript
borderRadius: {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
}
```

**Usage in components:**
```css
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }
```

### 9. Shadows

Define shadow values for depth effects.

```typescript
shadows: {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
}
```

**Usage in components:**
```css
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
```

### 10. Form Styles

Customize form inputs, labels, and buttons.

```typescript
forms: {
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: '1px',
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    color: '#3D3D3D',
    focusBorderColor: '#003450',
    focusRingColor: 'rgba(0,52,80,0.2)',
    placeholderColor: '#9CA3AF',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#3D3D3D',
    marginBottom: '0.5rem',
  },
  button: {
    backgroundColor: '#003450',
    textColor: '#FFFFFF',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    hoverBackgroundColor: '#002538',
    transition: 'all 0.3s ease',
  },
}
```

**Usage in components:**
```css
.form-input {
  background-color: var(--input-bg);
  border: var(--input-border-width) solid var(--input-border);
  border-radius: var(--input-radius);
  padding: var(--input-padding);
  font-size: var(--input-font-size);
  color: var(--input-color);
}

.form-input:focus {
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.form-input::placeholder {
  color: var(--input-placeholder);
}

.form-label {
  font-size: var(--label-font-size);
  font-weight: var(--label-font-weight);
  color: var(--label-color);
  margin-bottom: var(--label-margin-bottom);
}
```

### 11. Layout Settings

Configure layout dimensions and padding.

```typescript
layout: {
  maxWidth: 1280,                    // or '1280px'
  sidebar: false,
  headerStyle: 'fixed',              // 'fixed' | 'static' | 'transparent'
  footerStyle: 'simple',             // 'simple' | 'complex'
  containerPadding: '1.5rem',
  sectionPadding: '5rem 0',
}
```

**Usage in components:**
```css
.container {
  max-width: var(--layout-max-width);
  padding: var(--layout-container-padding);
  margin: 0 auto;
}

.section {
  padding: var(--layout-section-padding);
}
```

### 12. Transitions & Animations

Define transition durations and easing functions.

```typescript
transitions: {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}
```

**Usage in components:**
```css
.transition-smooth {
  transition-duration: var(--transition-normal);
  transition-timing-function: var(--ease);
}
```

## Using the `useThemeStyles` Hook

The `useThemeStyles` hook provides convenient access to all theme values and helper functions.

```tsx
import { useThemeStyles } from '@/hooks/useThemeStyles';

function MyComponent() {
  const { 
    colors, 
    typography, 
    hero, 
    buttons,
    getPrimaryButtonStyles,
    getHeroStyles 
  } = useThemeStyles();

  return (
    <div>
      <h1 style={{ color: colors.primary }}>
        {hero.title.text}
      </h1>
      <button style={getPrimaryButtonStyles()}>
        Click me
      </button>
    </div>
  );
}
```

### Available Helper Functions

- `getHeroStyles()` - Returns inline styles for hero section
- `getHeroOverlayStyles()` - Returns inline styles for hero overlay
- `getHeroTitleStyles()` - Returns inline styles for hero title
- `getHeroSubtitleStyles()` - Returns inline styles for hero subtitle
- `getPrimaryButtonStyles()` - Returns inline styles for primary button
- `getSecondaryButtonStyles()` - Returns inline styles for secondary button
- `getCardStyles()` - Returns inline styles for card
- `getCardTitleStyles()` - Returns inline styles for card title
- `getCardDescriptionStyles()` - Returns inline styles for card description

## Customizing Themes via Admin Panel

1. Navigate to `/admin/themes`
2. Select the theme you want to customize
3. Click on "Customize"
4. Modify any of the configuration options
5. Save your changes
6. The theme will automatically update with your customizations

## Example: Creating a Custom Theme

```typescript
// src/themes/my-custom/theme.config.ts
import { ITheme } from '../../models/Theme';

export const myCustomThemeConfig: Partial<ITheme> = {
  name: 'My Custom Theme',
  slug: 'my-custom',
  version: '1.0.0',
  author: 'Your Name',
  description: 'A custom theme with unique styling',
  thumbnail: '/themes/my-custom/thumbnail.png',
  isActive: false,
  config: {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFE66D',
      background: '#F7F7F7',
      text: '#2D3436',
    },
    typography: {
      fonts: {
        heading: 'Poppins',
        body: 'Open Sans',
      },
      sizes: {
        h1: '4rem',
        h2: '3rem',
        h3: '2.5rem',
      },
    },
    hero: {
      title: {
        text: 'Welcome to My Site',
        color: '#FFFFFF',
        fontSize: '4rem',
        fontWeight: '800',
      },
      buttons: {
        primary: {
          backgroundColor: '#FF6B6B',
          textColor: '#FFFFFF',
        },
      },
    },
    // ... more customizations
  },
};

export default myCustomThemeConfig;
```

## Best Practices

1. **Use CSS Variables**: Always use the CSS variables provided by the theme system for consistency
2. **Responsive Design**: Use relative units (rem, em, %) for better responsiveness
3. **Accessibility**: Ensure sufficient color contrast for text and backgrounds
4. **Performance**: Minimize the number of custom properties you override
5. **Consistency**: Stick to the defined spacing and typography scales
6. **Testing**: Test your theme across different browsers and devices

## Troubleshooting

### Theme not updating
- Clear your browser cache
- Check that the theme is set as active
- Verify the API endpoint is returning the correct configuration

### CSS variables not working
- Ensure you're using the `ActiveThemeProvider` in your app
- Check that the component is rendered client-side (use 'use client')
- Verify the variable names match the theme configuration

### Styles not applying
- Check for CSS specificity issues
- Ensure you're not using inline styles that override CSS variables
- Verify the theme configuration is valid

## Additional Resources

- [Theme Plugin System Documentation](./THEME_PLUGIN_SYSTEM.md)
- [Theme Usage Guide](../PLUGIN_THEME_USAGE.md)
- [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
