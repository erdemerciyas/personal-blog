/**
 * Theme Engine - Manages theme loading and template rendering
 */

import React from 'react';
import Theme, { ITheme, IThemeConfig, IThemeTemplate } from '../../models/Theme';
import { hookSystem } from '../../plugins/core/HookSystem';

interface ThemeEngineOptions {
  debug?: boolean;
}

class ThemeEngine {
  private activeTheme: ITheme | null = null;
  private templateRegistry: Map<string, React.ComponentType<any>> = new Map();
  private debug: boolean;

  constructor(options: ThemeEngineOptions = {}) {
    this.debug = options.debug || process.env.NODE_ENV === 'development';
  }

  /**
   * Load a theme by slug
   * @param themeSlug - The theme slug to load
   * @returns The loaded theme
   */
  async loadTheme(themeSlug: string): Promise<ITheme> {
    if (this.debug) {
      console.log(`[ThemeEngine] Loading theme: ${themeSlug}`);
    }

    const theme = await Theme.getThemeBySlug(themeSlug);
    if (!theme) {
      throw new Error(`Theme not found: ${themeSlug}`);
    }

    this.activeTheme = theme;
    await this.registerThemeComponents(theme);
    
    // Trigger theme loaded hook
    hookSystem.doAction('theme:loaded', theme);
    
    if (this.debug) {
      console.log(`[ThemeEngine] Theme loaded: ${theme.name} v${theme.version}`);
    }

    return theme;
  }

  /**
   * Load the active theme from database
   * @returns The active theme
   */
  async loadActiveTheme(): Promise<ITheme | null> {
    const theme = await Theme.getActiveTheme();
    if (theme) {
      await this.loadTheme(theme.slug);
    }
    return theme;
  }

  /**
   * Register theme components
   * @param theme - The theme to register components for
   */
  private async registerThemeComponents(theme: ITheme): Promise<void> {
    this.templateRegistry.clear();

    if (!theme.templates || theme.templates.length === 0) {
      if (this.debug) {
        console.log('[ThemeEngine] No templates to register');
      }
      return;
    }

    for (const template of theme.templates) {
      try {
        const component = await this.loadComponent(template.component);
        this.templateRegistry.set(template.id, component);
        
        if (this.debug) {
          console.log(`[ThemeEngine] Registered template: ${template.id} -> ${template.component}`);
        }
      } catch (error) {
        console.error(`[ThemeEngine] Failed to load template ${template.id}:`, error);
      }
    }
  }

  /**
   * Load a component dynamically
   * @param componentPath - The path to the component
   * @returns The loaded component
   */
  private async loadComponent(componentPath: string): Promise<React.ComponentType<any>> {
    try {
      const loadedModule = await import(`@/themes/${this.activeTheme?.slug}/${componentPath}`);
      return loadedModule.default;
    } catch (error) {
      console.error(`[ThemeEngine] Failed to load component: ${componentPath}`, error);
      throw error;
    }
  }

  /**
   * Render a template
   * @param templateId - The template ID to render
   * @param props - Props to pass to the template
   * @returns The rendered component or null
   */
  renderTemplate(templateId: string, props: any = {}): React.ReactNode {
    const component = this.templateRegistry.get(templateId);
    
    if (!component) {
      console.error(`[ThemeEngine] Template not found: ${templateId}`);
      return null;
    }

    // Apply template props filter
    const filteredProps = hookSystem.applyFilters('template:props', props, templateId);
    
    return React.createElement(component, filteredProps);
  }

  /**
   * Get the active theme
   * @returns The active theme or null
   */
  getActiveTheme(): ITheme | null {
    return this.activeTheme;
  }

  /**
   * Get theme configuration
   * @returns The theme config or null
   */
  getThemeConfig(): IThemeConfig | null {
    return this.activeTheme?.config || null;
  }

  /**
   * Get CSS variables from theme config
   * @returns CSS variables as a string
   */
  getThemeCSSVariables(): string {
    if (!this.activeTheme) {
      return '';
    }

    const { colors, layout } = this.activeTheme.config;
    const fonts = this.activeTheme.config.fonts || this.activeTheme.config.typography?.fonts || { heading: 'Inter', body: 'Inter' };
    
    const variables = {
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-accent': colors.accent,
      '--color-background': colors.background,
      '--color-text': colors.text,
      '--font-heading': fonts.heading,
      '--font-body': fonts.body,
      '--layout-max-width': `${layout.maxWidth}px`,
    };

    // Apply theme variables filter
    const filteredVariables = hookSystem.applyFilters('theme:variables', variables, this.activeTheme);

    return Object.entries(filteredVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  }

  /**
   * Get a template by ID
   * @param templateId - The template ID
   * @returns The template or null
   */
  getTemplate(templateId: string): IThemeTemplate | null {
    if (!this.activeTheme || !this.activeTheme.templates) {
      return null;
    }

    return this.activeTheme.templates.find((t) => t.id === templateId) || null;
  }

  /**
   * Get all templates for a specific type
   * @param type - The template type
   * @returns Array of templates
   */
  getTemplatesByType(type: IThemeTemplate['type']): IThemeTemplate[] {
    if (!this.activeTheme || !this.activeTheme.templates) {
      return [];
    }

    return this.activeTheme.templates.filter((t) => t.type === type);
  }

  /**
   * Check if a feature is enabled in the theme
   * @param feature - The feature name
   * @returns True if the feature is enabled
   */
  isFeatureEnabled(feature: keyof IThemeConfig['features']): boolean {
    return this.activeTheme?.config.features[feature] || false;
  }

  /**
   * Get the layout configuration
   * @returns The layout config or null
   */
  getLayoutConfig(): IThemeConfig['layout'] | null {
    return this.activeTheme?.config.layout || null;
  }

  /**
   * Clear the active theme
   */
  clearTheme(): void {
    this.activeTheme = null;
    this.templateRegistry.clear();
    
    if (this.debug) {
      console.log('[ThemeEngine] Theme cleared');
    }
  }

  /**
   * Enable or disable debug mode
   * @param enabled - Whether to enable debug mode
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }
}

// Global theme engine instance
export const themeEngine = new ThemeEngine();

export default ThemeEngine;
