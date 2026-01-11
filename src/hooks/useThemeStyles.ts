'use client';

import { useActiveTheme } from '../providers/ActiveThemeProvider';

/**
 * Hook to access theme CSS variables and styles
 * Provides convenient methods to get theme values for use in components
 */
export function useThemeStyles() {
  const { theme, loading } = useActiveTheme();

  /**
   * Get a CSS variable value by name
   */
  const getVar = (name: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  /**
   * Get color values
   */
  const colors = {
    primary: getVar('--theme-primary'),
    secondary: getVar('--theme-secondary'),
    accent: getVar('--theme-accent'),
    background: getVar('--theme-background'),
    text: getVar('--theme-text'),
    textLight: getVar('--theme-text-light'),
    white: getVar('--theme-white'),
    black: getVar('--theme-black'),
    success: getVar('--theme-success'),
    warning: getVar('--theme-warning'),
    error: getVar('--theme-error'),
    info: getVar('--theme-info'),
  };

  /**
   * Get typography values
   */
  const typography = {
    fonts: {
      heading: getVar('--font-heading'),
      body: getVar('--font-body'),
      button: getVar('--font-button'),
      nav: getVar('--font-nav'),
    },
    sizes: {
      h1: getVar('--text-h1'),
      h2: getVar('--text-h2'),
      h3: getVar('--text-h3'),
      h4: getVar('--text-h4'),
      h5: getVar('--text-h5'),
      h6: getVar('--text-h6'),
      body: getVar('--text-body'),
      small: getVar('--text-small'),
      tiny: getVar('--text-tiny'),
    },
    weights: {
      light: getVar('--font-light'),
      normal: getVar('--font-normal'),
      medium: getVar('--font-medium'),
      semibold: getVar('--font-semibold'),
      bold: getVar('--font-bold'),
      extrabold: getVar('--font-extrabold'),
    },
    lineHeights: {
      tight: getVar('--leading-tight'),
      normal: getVar('--leading-normal'),
      relaxed: getVar('--leading-relaxed'),
      loose: getVar('--leading-loose'),
    },
  };

  /**
   * Get hero section values
   */
  const hero = {
    enabled: getVar('--hero-enabled') === '1',
    height: getVar('--hero-height'),
    minHeight: getVar('--hero-min-height'),
    background: getVar('--hero-background'),
    backgroundImage: getVar('--hero-background-image'),
    overlay: {
      enabled: getVar('--hero-overlay-enabled') === '1',
      color: getVar('--hero-overlay-color'),
      opacity: getVar('--hero-overlay-opacity'),
    },
    title: {
      text: getVar('--hero-title-text'),
      color: getVar('--hero-title-color'),
      fontSize: getVar('--hero-title-font-size'),
      fontWeight: getVar('--hero-title-font-weight'),
      lineHeight: getVar('--hero-title-line-height'),
      marginBottom: getVar('--hero-title-margin-bottom'),
      textShadow: getVar('--hero-title-text-shadow'),
    },
    subtitle: {
      text: getVar('--hero-subtitle-text'),
      color: getVar('--hero-subtitle-color'),
      fontSize: getVar('--hero-subtitle-font-size'),
      fontWeight: getVar('--hero-subtitle-font-weight'),
      lineHeight: getVar('--hero-subtitle-line-height'),
      marginBottom: getVar('--hero-subtitle-margin-bottom'),
    },
    buttons: {
      primary: {
        text: getVar('--hero-button-primary-text'),
        backgroundColor: getVar('--hero-button-primary-bg'),
        color: getVar('--hero-button-primary-color'),
        fontSize: getVar('--hero-button-primary-font-size'),
        fontWeight: getVar('--hero-button-primary-font-weight'),
        padding: getVar('--hero-button-primary-padding'),
        borderRadius: getVar('--hero-button-primary-radius'),
        hoverBackgroundColor: getVar('--hero-button-primary-hover-bg'),
        hoverColor: getVar('--hero-button-primary-hover-color'),
        boxShadow: getVar('--hero-button-primary-shadow'),
      },
      secondary: {
        text: getVar('--hero-button-secondary-text'),
        backgroundColor: getVar('--hero-button-secondary-bg'),
        color: getVar('--hero-button-secondary-color'),
        fontSize: getVar('--hero-button-secondary-font-size'),
        fontWeight: getVar('--hero-button-secondary-font-weight'),
        padding: getVar('--hero-button-secondary-padding'),
        borderRadius: getVar('--hero-button-secondary-radius'),
        borderColor: getVar('--hero-button-secondary-border'),
        borderWidth: getVar('--hero-button-secondary-border-width'),
        hoverBackgroundColor: getVar('--hero-button-secondary-hover-bg'),
        hoverColor: getVar('--hero-button-secondary-hover-color'),
      },
    },
    alignment: getVar('--hero-alignment') as 'left' | 'center' | 'right',
    animation: {
      enabled: getVar('--hero-animation-enabled') === '1',
      type: getVar('--hero-animation-type'),
      duration: getVar('--hero-animation-duration'),
    },
  };

  /**
   * Get button styles
   */
  const buttons = {
    primary: {
      backgroundColor: getVar('--btn-primary-bg'),
      color: getVar('--btn-primary-color'),
      fontSize: getVar('--btn-primary-font-size'),
      fontWeight: getVar('--btn-primary-font-weight'),
      padding: getVar('--btn-primary-padding'),
      borderRadius: getVar('--btn-primary-radius'),
      hoverBackgroundColor: getVar('--btn-primary-hover-bg'),
      hoverColor: getVar('--btn-primary-hover-color'),
      boxShadow: getVar('--btn-primary-shadow'),
      transition: getVar('--btn-primary-transition'),
    },
    secondary: {
      backgroundColor: getVar('--btn-secondary-bg'),
      color: getVar('--btn-secondary-color'),
      fontSize: getVar('--btn-secondary-font-size'),
      fontWeight: getVar('--btn-secondary-font-weight'),
      padding: getVar('--btn-secondary-padding'),
      borderRadius: getVar('--btn-secondary-radius'),
      borderColor: getVar('--btn-secondary-border'),
      borderWidth: getVar('--btn-secondary-border-width'),
      hoverBackgroundColor: getVar('--btn-secondary-hover-bg'),
      hoverColor: getVar('--btn-secondary-hover-color'),
      transition: getVar('--btn-secondary-transition'),
    },
    tertiary: {
      backgroundColor: getVar('--btn-tertiary-bg'),
      color: getVar('--btn-tertiary-color'),
      fontSize: getVar('--btn-tertiary-font-size'),
      fontWeight: getVar('--btn-tertiary-font-weight'),
      padding: getVar('--btn-tertiary-padding'),
      borderRadius: getVar('--btn-tertiary-radius'),
      hoverBackgroundColor: getVar('--btn-tertiary-hover-bg'),
      hoverColor: getVar('--btn-tertiary-hover-color'),
      transition: getVar('--btn-tertiary-transition'),
    },
  };

  /**
   * Get card styles
   */
  const cards = {
    backgroundColor: getVar('--card-bg'),
    padding: getVar('--card-padding'),
    borderRadius: getVar('--card-radius'),
    boxShadow: getVar('--card-shadow'),
    hoverShadow: getVar('--card-hover-shadow'),
    transition: getVar('--card-transition'),
    title: {
      fontSize: getVar('--card-title-font-size'),
      fontWeight: getVar('--card-title-font-weight'),
      color: getVar('--card-title-color'),
      marginBottom: getVar('--card-title-margin-bottom'),
    },
    description: {
      fontSize: getVar('--card-desc-font-size'),
      color: getVar('--card-desc-color'),
      lineHeight: getVar('--card-desc-line-height'),
    },
  };

  /**
   * Get navigation styles
   */
  const navigation = {
    backgroundColor: getVar('--nav-bg'),
    color: getVar('--nav-color'),
    hoverColor: getVar('--nav-hover-color'),
    activeColor: getVar('--nav-active-color'),
    fontSize: getVar('--nav-font-size'),
    fontWeight: getVar('--nav-font-weight'),
    padding: getVar('--nav-padding'),
    boxShadow: getVar('--nav-shadow'),
    height: getVar('--nav-height'),
    logo: {
      fontSize: getVar('--nav-logo-font-size'),
      fontWeight: getVar('--nav-logo-font-weight'),
      color: getVar('--nav-logo-color'),
    },
  };

  /**
   * Get spacing values
   */
  const spacing = {
    xs: getVar('--spacing-xs'),
    sm: getVar('--spacing-sm'),
    md: getVar('--spacing-md'),
    lg: getVar('--spacing-lg'),
    xl: getVar('--spacing-xl'),
    '2xl': getVar('--spacing-2xl'),
    '3xl': getVar('--spacing-3xl'),
  };

  /**
   * Get border radius values
   */
  const borderRadius = {
    none: getVar('--radius-none'),
    sm: getVar('--radius-sm'),
    md: getVar('--radius-md'),
    lg: getVar('--radius-lg'),
    xl: getVar('--radius-xl'),
    '2xl': getVar('--radius-2xl'),
    full: getVar('--radius-full'),
  };

  /**
   * Get shadow values
   */
  const shadows = {
    sm: getVar('--shadow-sm'),
    md: getVar('--shadow-md'),
    lg: getVar('--shadow-lg'),
    xl: getVar('--shadow-xl'),
  };

  /**
   * Get form styles
   */
  const forms = {
    input: {
      backgroundColor: getVar('--input-bg'),
      borderColor: getVar('--input-border'),
      borderWidth: getVar('--input-border-width'),
      borderRadius: getVar('--input-radius'),
      padding: getVar('--input-padding'),
      fontSize: getVar('--input-font-size'),
      color: getVar('--input-color'),
      focusBorderColor: getVar('--input-focus-border'),
      focusRingColor: getVar('--input-focus-ring'),
      placeholderColor: getVar('--input-placeholder'),
    },
    label: {
      fontSize: getVar('--label-font-size'),
      fontWeight: getVar('--label-font-weight'),
      color: getVar('--label-color'),
      marginBottom: getVar('--label-margin-bottom'),
    },
    button: {
      backgroundColor: getVar('--form-btn-bg'),
      color: getVar('--form-btn-color'),
      fontSize: getVar('--form-btn-font-size'),
      fontWeight: getVar('--form-btn-font-weight'),
      padding: getVar('--form-btn-padding'),
      borderRadius: getVar('--form-btn-radius'),
      hoverBackgroundColor: getVar('--form-btn-hover-bg'),
      transition: getVar('--form-btn-transition'),
    },
  };

  /**
   * Get layout values
   */
  const layout = {
    maxWidth: getVar('--layout-max-width'),
    containerPadding: getVar('--layout-container-padding'),
    sectionPadding: getVar('--layout-section-padding'),
  };

  /**
   * Get transition values
   */
  const transitions = {
    duration: {
      fast: getVar('--transition-fast'),
      normal: getVar('--transition-normal'),
      slow: getVar('--transition-slow'),
    },
    easing: {
      ease: getVar('--ease'),
      easeIn: getVar('--ease-in'),
      easeOut: getVar('--ease-out'),
      easeInOut: getVar('--ease-in-out'),
    },
  };

  /**
   * Generate inline styles for hero section
   */
  const getHeroStyles = () => ({
    height: hero.height,
    minHeight: hero.minHeight,
    background: hero.backgroundImage 
      ? `url(${hero.backgroundImage}), ${hero.background}` 
      : hero.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: hero.alignment === 'center' ? 'center' : hero.alignment === 'left' ? 'flex-start' : 'flex-end',
    position: 'relative' as const,
  });

  /**
   * Generate inline styles for hero overlay
   */
  const getHeroOverlayStyles = () => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: hero.overlay.color,
    opacity: parseFloat(hero.overlay.opacity) || 0,
    pointerEvents: 'none' as const,
  });

  /**
   * Generate inline styles for hero title
   */
  const getHeroTitleStyles = () => ({
    color: hero.title.color,
    fontSize: hero.title.fontSize,
    fontWeight: hero.title.fontWeight,
    lineHeight: hero.title.lineHeight,
    marginBottom: hero.title.marginBottom,
    textShadow: hero.title.textShadow,
  });

  /**
   * Generate inline styles for hero subtitle
   */
  const getHeroSubtitleStyles = () => ({
    color: hero.subtitle.color,
    fontSize: hero.subtitle.fontSize,
    fontWeight: hero.subtitle.fontWeight,
    lineHeight: hero.subtitle.lineHeight,
    marginBottom: hero.subtitle.marginBottom,
  });

  /**
   * Generate inline styles for primary button
   */
  const getPrimaryButtonStyles = () => ({
    backgroundColor: buttons.primary.backgroundColor,
    color: buttons.primary.color,
    fontSize: buttons.primary.fontSize,
    fontWeight: buttons.primary.fontWeight,
    padding: buttons.primary.padding,
    borderRadius: buttons.primary.borderRadius,
    boxShadow: buttons.primary.boxShadow,
    transition: buttons.primary.transition,
    border: 'none',
    cursor: 'pointer',
  });

  /**
   * Generate inline styles for secondary button
   */
  const getSecondaryButtonStyles = () => ({
    backgroundColor: buttons.secondary.backgroundColor,
    color: buttons.secondary.color,
    fontSize: buttons.secondary.fontSize,
    fontWeight: buttons.secondary.fontWeight,
    padding: buttons.secondary.padding,
    borderRadius: buttons.secondary.borderRadius,
    border: `${buttons.secondary.borderWidth} solid ${buttons.secondary.borderColor}`,
    transition: buttons.secondary.transition,
    cursor: 'pointer',
  });

  /**
   * Generate inline styles for card
   */
  const getCardStyles = () => ({
    backgroundColor: cards.backgroundColor,
    padding: cards.padding,
    borderRadius: cards.borderRadius,
    boxShadow: cards.boxShadow,
    transition: cards.transition,
  });

  /**
   * Generate inline styles for card title
   */
  const getCardTitleStyles = () => ({
    fontSize: cards.title.fontSize,
    fontWeight: cards.title.fontWeight,
    color: cards.title.color,
    marginBottom: cards.title.marginBottom,
  });

  /**
   * Generate inline styles for card description
   */
  const getCardDescriptionStyles = () => ({
    fontSize: cards.description.fontSize,
    color: cards.description.color,
    lineHeight: cards.description.lineHeight,
  });

  return {
    loading,
    theme,
    getVar,
    colors,
    typography,
    hero,
    buttons,
    cards,
    navigation,
    spacing,
    borderRadius,
    shadows,
    forms,
    layout,
    transitions,
    getHeroStyles,
    getHeroOverlayStyles,
    getHeroTitleStyles,
    getHeroSubtitleStyles,
    getPrimaryButtonStyles,
    getSecondaryButtonStyles,
    getCardStyles,
    getCardTitleStyles,
    getCardDescriptionStyles,
  };
}

export default useThemeStyles;
