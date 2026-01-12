import mongoose from 'mongoose';

export interface IThemeConfig {
  // Color Palette
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight?: string;
    white?: string;
    black?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };

  // Typography Settings
  typography?: {
    fonts?: {
      heading: string;
      body: string;
      button?: string;
      nav?: string;
    };
    sizes?: {
      h1?: string;
      h2?: string;
      h3?: string;
      h4?: string;
      h5?: string;
      h6?: string;
      body?: string;
      small?: string;
      tiny?: string;
    };
    weights?: {
      light?: string;
      normal?: string;
      medium?: string;
      semibold?: string;
      bold?: string;
      extrabold?: string;
    };
    lineHeights?: {
      tight?: string;
      normal?: string;
      relaxed?: string;
      loose?: string;
    };
    colors?: {
      heading?: string;
      body?: string;
    };
  };

  // Hero Section Customization
  hero?: {
    enabled?: boolean;
    height?: string;
    minHeight?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    overlay?: {
      enabled?: boolean;
      color?: string;
      opacity?: number;
    };
    title?: {
      text?: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      lineHeight?: string;
      marginBottom?: string;
      textShadow?: string;
    };
    subtitle?: {
      text?: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      lineHeight?: string;
      marginBottom?: string;
    };
    buttons?: {
      primary?: {
        text?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: string;
        fontWeight?: string;
        padding?: string;
        borderRadius?: string;
        hoverBackgroundColor?: string;
        hoverTextColor?: string;
        boxShadow?: string;
      };
      secondary?: {
        text?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: string;
        fontWeight?: string;
        padding?: string;
        borderRadius?: string;
        borderColor?: string;
        borderWidth?: string;
        hoverBackgroundColor?: string;
        hoverTextColor?: string;
      };
    };
    alignment?: 'left' | 'center' | 'right';
    animation?: {
      enabled?: boolean;
      type?: string;
      duration?: string;
    };
  };

  // Button Styles
  buttons?: {
    primary?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontWeight?: string;
      padding?: string;
      borderRadius?: string;
      hoverBackgroundColor?: string;
      hoverTextColor?: string;
      boxShadow?: string;
      transition?: string;
    };
    secondary?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontWeight?: string;
      padding?: string;
      borderRadius?: string;
      borderColor?: string;
      borderWidth?: string;
      hoverBackgroundColor?: string;
      hoverTextColor?: string;
      transition?: string;
    };
    tertiary?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontWeight?: string;
      padding?: string;
      borderRadius?: string;
      hoverBackgroundColor?: string;
      hoverTextColor?: string;
      transition?: string;
    };
  };

  // Card Styles
  cards?: {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    hoverShadow?: string;
    transition?: string;
    title?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      marginBottom?: string;
    };
    description?: {
      fontSize?: string;
      color?: string;
      lineHeight?: string;
    };
  };

  // Navigation Styles
  navigation?: {
    backgroundColor?: string;
    textColor?: string;
    hoverColor?: string;
    activeColor?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    boxShadow?: string;
    sticky?: boolean;
    height?: string;
    logo?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
    };
  };

  // Spacing System
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
  };

  // Border Radius
  borderRadius?: {
    none?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    full?: string;
  };

  // Shadows
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };

  // Form Styles
  forms?: {
    input?: {
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: string;
      borderRadius?: string;
      padding?: string;
      fontSize?: string;
      color?: string;
      focusBorderColor?: string;
      focusRingColor?: string;
      placeholderColor?: string;
    };
    label?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      marginBottom?: string;
    };
    button?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontWeight?: string;
      padding?: string;
      borderRadius?: string;
      hoverBackgroundColor?: string;
      transition?: string;
    };
  };

  // Footer Styles
  footer?: {
    backgroundColor?: string;
    descriptionColor?: string;
    textColor?: string;
    headingColor?: string;
    linkColor?: string;
    linkHoverColor?: string;
    accentColor?: string;
    borderColor?: string;
    bottomBackgroundColor?: string;
    bottomTextColor?: string;
  };

  // Layout Settings
  layout: {
    maxWidth: number | string;
    sidebar: boolean;
    headerStyle: 'fixed' | 'static' | 'transparent';
    footerStyle: 'simple' | 'complex';
    containerPadding?: string;
    sectionPadding?: string;
  };

  // Features Toggle
  features: {
    heroSlider: boolean;
    portfolioGrid: boolean;
    blogList: boolean;
    contactForm: boolean;
  };

  // Transitions & Animations
  transitions?: {
    duration?: {
      fast?: string;
      normal?: string;
      slow?: string;
    };
    easing?: {
      ease?: string;
      easeIn?: string;
      easeOut?: string;
      easeInOut?: string;
    };
  };

  // Legacy fonts support (deprecated, use typography.fonts instead)
  fonts?: {
    heading: string;
    body: string;
  };
}

export interface IThemeTemplate {
  id: string;
  name: string;
  type: 'page' | 'single' | 'archive' | 'home';
  component: string;
  screenshot: string;
  description?: string;
}

export interface ITheme {
  _id?: string;
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
  isActive: boolean;
  config: IThemeConfig;
  templates?: IThemeTemplate[];
  meta?: {
    createdAt?: Date;
    updatedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IThemeModel extends mongoose.Model<ITheme> {
  getActiveTheme(): Promise<ITheme | null>;
  activateTheme(slug: string): Promise<ITheme>;
  getThemeBySlug(slug: string): Promise<ITheme | null>;
  getAllThemes(): Promise<ITheme[]>;
}

const ThemeSchema = new mongoose.Schema<ITheme>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    author: {
      type: String,
      required: true,
      default: 'Fixral',
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
      default: '/themes/default/thumbnail.png',
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    config: {
      // Color Palette
      colors: {
        primary: {
          type: String,
          required: true,
          default: '#003450',
        },
        secondary: {
          type: String,
          required: true,
          default: '#3A506B',
        },
        accent: {
          type: String,
          required: true,
          default: '#003450',
        },
        background: {
          type: String,
          required: true,
          default: '#F8F9FA',
        },
        text: {
          type: String,
          required: true,
          default: '#3D3D3D',
        },
        textLight: {
          type: String,
          default: '#6B7280',
        },
        white: {
          type: String,
          default: '#FFFFFF',
        },
        black: {
          type: String,
          default: '#000000',
        },
        success: {
          type: String,
          default: '#10B981',
        },
        warning: {
          type: String,
          default: '#F59E0B',
        },
        error: {
          type: String,
          default: '#EF4444',
        },
        info: {
          type: String,
          default: '#3B82F6',
        },
      },

      // Typography Settings
      typography: {
        fonts: {
          heading: {
            type: String,
            default: 'Inter',
          },
          body: {
            type: String,
            default: 'Inter',
          },
          button: {
            type: String,
            default: 'Inter',
          },
          nav: {
            type: String,
            default: 'Inter',
          },
        },
        sizes: {
          h1: {
            type: String,
            default: '3rem',
          },
          h2: {
            type: String,
            default: '2.5rem',
          },
          h3: {
            type: String,
            default: '2rem',
          },
          h4: {
            type: String,
            default: '1.5rem',
          },
          h5: {
            type: String,
            default: '1.25rem',
          },
          h6: {
            type: String,
            default: '1rem',
          },
          body: {
            type: String,
            default: '1rem',
          },
          small: {
            type: String,
            default: '0.875rem',
          },
          tiny: {
            type: String,
            default: '0.75rem',
          },
        },
        weights: {
          light: {
            type: String,
            default: '300',
          },
          normal: {
            type: String,
            default: '400',
          },
          medium: {
            type: String,
            default: '500',
          },
          semibold: {
            type: String,
            default: '600',
          },
          bold: {
            type: String,
            default: '700',
          },
          extrabold: {
            type: String,
            default: '800',
          },
        },
        lineHeights: {
          tight: {
            type: String,
            default: '1.25',
          },
          normal: {
            type: String,
            default: '1.5',
          },
          relaxed: {
            type: String,
            default: '1.75',
          },
          loose: {
            type: String,
            default: '2',
          },
        },
        colors: {
          heading: {
            type: String,
            default: '', // Inherit by default
          },
          body: {
            type: String,
            default: '', // Inherit by default
          },
        },
      },

      // Hero Section Customization
      hero: {
        enabled: {
          type: Boolean,
          default: true,
        },
        height: {
          type: String,
          default: '80vh',
        },
        minHeight: {
          type: String,
          default: '600px',
        },
        backgroundColor: {
          type: String,
          default: 'linear-gradient(135deg, #003450 0%, #3A506B 100%)',
        },
        backgroundImage: {
          type: String,
          default: '',
        },
        overlay: {
          enabled: {
            type: Boolean,
            default: true,
          },
          color: {
            type: String,
            default: '#000000',
          },
          opacity: {
            type: Number,
            default: 0.4,
          },
        },
        title: {
          text: {
            type: String,
            default: 'Welcome to Fixral',
          },
          color: {
            type: String,
            default: '#FFFFFF',
          },
          fontSize: {
            type: String,
            default: '3.5rem',
          },
          fontWeight: {
            type: String,
            default: '700',
          },
          lineHeight: {
            type: String,
            default: '1.2',
          },
          marginBottom: {
            type: String,
            default: '1.5rem',
          },
          textShadow: {
            type: String,
            default: '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
        subtitle: {
          text: {
            type: String,
            default: 'Innovative solutions for your business',
          },
          color: {
            type: String,
            default: '#F3F4F6',
          },
          fontSize: {
            type: String,
            default: '1.25rem',
          },
          fontWeight: {
            type: String,
            default: '400',
          },
          lineHeight: {
            type: String,
            default: '1.6',
          },
          marginBottom: {
            type: String,
            default: '2rem',
          },
        },
        buttons: {
          primary: {
            text: {
              type: String,
              default: 'Get Started',
            },
            backgroundColor: {
              type: String,
              default: '#FFFFFF',
            },
            textColor: {
              type: String,
              default: '#003450',
            },
            fontSize: {
              type: String,
              default: '1rem',
            },
            fontWeight: {
              type: String,
              default: '600',
            },
            padding: {
              type: String,
              default: '0.75rem 2rem',
            },
            borderRadius: {
              type: String,
              default: '0.5rem',
            },
            hoverBackgroundColor: {
              type: String,
              default: '#F3F4F6',
            },
            hoverTextColor: {
              type: String,
              default: '#003450',
            },
            boxShadow: {
              type: String,
              default: '0 4px 6px rgba(0,0,0,0.1)',
            },
          },
          secondary: {
            text: {
              type: String,
              default: 'Learn More',
            },
            backgroundColor: {
              type: String,
              default: 'transparent',
            },
            textColor: {
              type: String,
              default: '#FFFFFF',
            },
            fontSize: {
              type: String,
              default: '1rem',
            },
            fontWeight: {
              type: String,
              default: '600',
            },
            padding: {
              type: String,
              default: '0.75rem 2rem',
            },
            borderRadius: {
              type: String,
              default: '0.5rem',
            },
            borderColor: {
              type: String,
              default: '#FFFFFF',
            },
            borderWidth: {
              type: String,
              default: '2px',
            },
            hoverBackgroundColor: {
              type: String,
              default: 'rgba(255,255,255,0.1)',
            },
            hoverTextColor: {
              type: String,
              default: '#FFFFFF',
            },
          },
        },
        alignment: {
          type: String,
          enum: ['left', 'center', 'right'],
          default: 'center',
        },
        animation: {
          enabled: {
            type: Boolean,
            default: true,
          },
          type: {
            type: String,
            default: 'fade-up',
          },
          duration: {
            type: String,
            default: '0.8s',
          },
        },
      },

      // Footer Styles
      footer: {
        backgroundColor: {
          type: String,
          default: '#0f1b26',
        },
        descriptionColor: {
          type: String, // Added specifically for main description text
          default: '#cbd5e1', // slate-300
        },
        textColor: {
          type: String,
          default: '#94a3b8', // slate-400
        },
        headingColor: {
          type: String,
          default: '#FFFFFF',
        },
        linkColor: {
          type: String,
          default: '#cbd5e1', // slate-300
        },
        linkHoverColor: {
          type: String,
          default: '#FFFFFF',
        },
        accentColor: {
          type: String,
          default: '#3B82F6',
        },
        borderColor: {
          type: String,
          default: 'rgba(255,255,255,0.1)',
        },
        bottomBackgroundColor: {
          type: String,
          default: 'transparent',
        },
        bottomTextColor: {
          type: String,
          default: '#94a3b8', // slate-400
        },
      },

      // Button Styles
      buttons: {
        primary: {
          backgroundColor: {
            type: String,
            default: '#003450',
          },
          textColor: {
            type: String,
            default: '#FFFFFF',
          },
          fontSize: {
            type: String,
            default: '1rem',
          },
          fontWeight: {
            type: String,
            default: '600',
          },
          padding: {
            type: String,
            default: '0.75rem 1.5rem',
          },
          borderRadius: {
            type: String,
            default: '0.5rem',
          },
          hoverBackgroundColor: {
            type: String,
            default: '#002538',
          },
          hoverTextColor: {
            type: String,
            default: '#FFFFFF',
          },
          boxShadow: {
            type: String,
            default: '0 2px 4px rgba(0,0,0,0.1)',
          },
          transition: {
            type: String,
            default: 'all 0.3s ease',
          },
        },
        secondary: {
          backgroundColor: {
            type: String,
            default: 'transparent',
          },
          textColor: {
            type: String,
            default: '#003450',
          },
          fontSize: {
            type: String,
            default: '1rem',
          },
          fontWeight: {
            type: String,
            default: '600',
          },
          padding: {
            type: String,
            default: '0.75rem 1.5rem',
          },
          borderRadius: {
            type: String,
            default: '0.5rem',
          },
          borderColor: {
            type: String,
            default: '#003450',
          },
          borderWidth: {
            type: String,
            default: '2px',
          },
          hoverBackgroundColor: {
            type: String,
            default: '#003450',
          },
          hoverTextColor: {
            type: String,
            default: '#FFFFFF',
          },
          transition: {
            type: String,
            default: 'all 0.3s ease',
          },
        },
        tertiary: {
          backgroundColor: {
            type: String,
            default: '#3A506B',
          },
          textColor: {
            type: String,
            default: '#FFFFFF',
          },
          fontSize: {
            type: String,
            default: '0.875rem',
          },
          fontWeight: {
            type: String,
            default: '500',
          },
          padding: {
            type: String,
            default: '0.5rem 1rem',
          },
          borderRadius: {
            type: String,
            default: '0.375rem',
          },
          hoverBackgroundColor: {
            type: String,
            default: '#2D3F52',
          },
          hoverTextColor: {
            type: String,
            default: '#FFFFFF',
          },
          transition: {
            type: String,
            default: 'all 0.3s ease',
          },
        },
      },

      // Card Styles
      cards: {
        backgroundColor: {
          type: String,
          default: '#FFFFFF',
        },
        padding: {
          type: String,
          default: '1.5rem',
        },
        borderRadius: {
          type: String,
          default: '0.75rem',
        },
        boxShadow: {
          type: String,
          default: '0 1px 3px rgba(0,0,0,0.1)',
        },
        hoverShadow: {
          type: String,
          default: '0 10px 15px rgba(0,0,0,0.1)',
        },
        transition: {
          type: String,
          default: 'all 0.3s ease',
        },
        title: {
          fontSize: {
            type: String,
            default: '1.25rem',
          },
          fontWeight: {
            type: String,
            default: '600',
          },
          color: {
            type: String,
            default: '#003450',
          },
          marginBottom: {
            type: String,
            default: '0.75rem',
          },
        },
        description: {
          fontSize: {
            type: String,
            default: '0.875rem',
          },
          color: {
            type: String,
            default: '#6B7280',
          },
          lineHeight: {
            type: String,
            default: '1.6',
          },
        },
      },

      // Navigation Styles
      navigation: {
        backgroundColor: {
          type: String,
          default: '#FFFFFF',
        },
        textColor: {
          type: String,
          default: '#003450',
        },
        hoverColor: {
          type: String,
          default: '#3A506B',
        },
        activeColor: {
          type: String,
          default: '#003450',
        },
        fontSize: {
          type: String,
          default: '1rem',
        },
        fontWeight: {
          type: String,
          default: '500',
        },
        padding: {
          type: String,
          default: '1rem 1.5rem',
        },
        boxShadow: {
          type: String,
          default: '0 2px 4px rgba(0,0,0,0.05)',
        },
        sticky: {
          type: Boolean,
          default: true,
        },
        height: {
          type: String,
          default: '70px',
        },
        logo: {
          fontSize: {
            type: String,
            default: '1.5rem',
          },
          fontWeight: {
            type: String,
            default: '700',
          },
          color: {
            type: String,
            default: '#003450',
          },
        },
      },

      // Spacing System
      spacing: {
        xs: {
          type: String,
          default: '0.25rem',
        },
        sm: {
          type: String,
          default: '0.5rem',
        },
        md: {
          type: String,
          default: '1rem',
        },
        lg: {
          type: String,
          default: '1.5rem',
        },
        xl: {
          type: String,
          default: '2rem',
        },
        '2xl': {
          type: String,
          default: '3rem',
        },
        '3xl': {
          type: String,
          default: '4rem',
        },
      },

      // Border Radius
      borderRadius: {
        none: {
          type: String,
          default: '0',
        },
        sm: {
          type: String,
          default: '0.125rem',
        },
        md: {
          type: String,
          default: '0.375rem',
        },
        lg: {
          type: String,
          default: '0.5rem',
        },
        xl: {
          type: String,
          default: '0.75rem',
        },
        '2xl': {
          type: String,
          default: '1rem',
        },
        full: {
          type: String,
          default: '9999px',
        },
      },

      // Shadows
      shadows: {
        sm: {
          type: String,
          default: '0 1px 2px rgba(0,0,0,0.05)',
        },
        md: {
          type: String,
          default: '0 4px 6px rgba(0,0,0,0.1)',
        },
        lg: {
          type: String,
          default: '0 10px 15px rgba(0,0,0,0.1)',
        },
        xl: {
          type: String,
          default: '0 20px 25px rgba(0,0,0,0.15)',
        },
      },

      // Form Styles
      forms: {
        input: {
          backgroundColor: {
            type: String,
            default: '#FFFFFF',
          },
          borderColor: {
            type: String,
            default: '#D1D5DB',
          },
          borderWidth: {
            type: String,
            default: '1px',
          },
          borderRadius: {
            type: String,
            default: '0.375rem',
          },
          padding: {
            type: String,
            default: '0.75rem 1rem',
          },
          fontSize: {
            type: String,
            default: '1rem',
          },
          color: {
            type: String,
            default: '#3D3D3D',
          },
          focusBorderColor: {
            type: String,
            default: '#003450',
          },
          focusRingColor: {
            type: String,
            default: 'rgba(0,52,80,0.2)',
          },
          placeholderColor: {
            type: String,
            default: '#9CA3AF',
          },
        },
        label: {
          fontSize: {
            type: String,
            default: '0.875rem',
          },
          fontWeight: {
            type: String,
            default: '500',
          },
          color: {
            type: String,
            default: '#3D3D3D',
          },
          marginBottom: {
            type: String,
            default: '0.5rem',
          },
        },
        button: {
          backgroundColor: {
            type: String,
            default: '#003450',
          },
          textColor: {
            type: String,
            default: '#FFFFFF',
          },
          fontSize: {
            type: String,
            default: '1rem',
          },
          fontWeight: {
            type: String,
            default: '600',
          },
          padding: {
            type: String,
            default: '0.75rem 2rem',
          },
          borderRadius: {
            type: String,
            default: '0.5rem',
          },
          hoverBackgroundColor: {
            type: String,
            default: '#002538',
          },
          transition: {
            type: String,
            default: 'all 0.3s ease',
          },
        },
      },

      // Layout Settings
      layout: {
        maxWidth: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
          default: 1280,
        },
        sidebar: {
          type: Boolean,
          required: true,
          default: false,
        },
        headerStyle: {
          type: String,
          required: true,
          enum: ['fixed', 'static', 'transparent'],
          default: 'fixed',
        },
        footerStyle: {
          type: String,
          required: true,
          enum: ['simple', 'complex'],
          default: 'simple',
        },
        containerPadding: {
          type: String,
          default: '1.5rem',
        },
        sectionPadding: {
          type: String,
          default: '5rem 0',
        },
      },

      // Features Toggle
      features: {
        heroSlider: {
          type: Boolean,
          required: true,
          default: true,
        },
        portfolioGrid: {
          type: Boolean,
          required: true,
          default: true,
        },
        blogList: {
          type: Boolean,
          required: true,
          default: true,
        },
        contactForm: {
          type: Boolean,
          required: true,
          default: true,
        },
      },

      // Transitions & Animations
      transitions: {
        duration: {
          fast: {
            type: String,
            default: '150ms',
          },
          normal: {
            type: String,
            default: '300ms',
          },
          slow: {
            type: String,
            default: '500ms',
          },
        },
        easing: {
          ease: {
            type: String,
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
          easeIn: {
            type: String,
            default: 'cubic-bezier(0.4, 0, 1, 1)',
          },
          easeOut: {
            type: String,
            default: 'cubic-bezier(0, 0, 0.2, 1)',
          },
          easeInOut: {
            type: String,
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },

      // Legacy fonts support
      fonts: {
        heading: {
          type: String,
          default: 'Inter',
        },
        body: {
          type: String,
          default: 'Inter',
        },
      },
    },
    templates: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['page', 'single', 'archive', 'home'],
        },
        component: {
          type: String,
          required: true,
        },
        screenshot: {
          type: String,
          required: false,
        },
        description: {
          type: String,
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
ThemeSchema.index({ slug: 1 });
ThemeSchema.index({ isActive: 1 });

// Static methods
ThemeSchema.statics.getActiveTheme = async function (): Promise<ITheme | null> {
  return this.findOne({ isActive: true });
};

ThemeSchema.statics.activateTheme = async function (slug: string): Promise<ITheme> {
  // Deactivate all themes
  await this.updateMany({}, { isActive: false });
  // Activate the specified theme
  const theme = await this.findOneAndUpdate(
    { slug },
    { isActive: true },
    { new: true, upsert: false }
  );
  if (!theme) {
    throw new Error('Theme not found');
  }
  return theme;
};

ThemeSchema.statics.getThemeBySlug = async function (slug: string): Promise<ITheme | null> {
  return this.findOne({ slug });
};

ThemeSchema.statics.getAllThemes = async function (): Promise<ITheme[]> {
  return this.find({}).sort({ name: 1 });
};

const Theme = (mongoose.models.Theme as unknown as IThemeModel) || mongoose.model<ITheme, IThemeModel>('Theme', ThemeSchema);

export default Theme;
