/**
 * Plugin Manager - Manages plugin loading, activation, and component injection
 */

import Plugin, { IPlugin, IPluginComponent } from '../../models/Plugin';
import { hookSystem } from './HookSystem';

interface PluginManagerOptions {
  debug?: boolean;
}

class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private loadedModules: Map<string, any> = new Map();
  private debug: boolean;

  constructor(options: PluginManagerOptions = {}) {
    this.debug = options.debug || process.env.NODE_ENV === 'development';
  }

  /**
   * Load a single plugin by slug
   * @param pluginSlug - The plugin slug to load
   * @returns The loaded plugin
   */
  async loadPlugin(pluginSlug: string): Promise<IPlugin> {
    if (this.debug) {
      console.log(`[PluginManager] Loading plugin: ${pluginSlug}`);
    }

    const plugin = await Plugin.getPluginBySlug(pluginSlug);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginSlug}`);
    }

    if (!plugin.isActive) {
      throw new Error(`Plugin is not active: ${pluginSlug}`);
    }

    // Check dependencies
    await this.checkDependencies(plugin);

    // Load plugin module
    const pluginModule = await this.loadPluginModule(plugin);
    
    // Initialize plugin
    if (pluginModule.init) {
      try {
        console.log(`[PluginManager] Initializing plugin: ${plugin.name}`);
        await pluginModule.init(hookSystem);
        
        if (this.debug) {
          console.log(`[PluginManager] Plugin initialized: ${plugin.name}`);
        }
      } catch (error) {
        console.error(`[PluginManager] Failed to initialize plugin ${plugin.name}:`, error);
        throw error;
      }
    }

    // Register hooks
    for (const hook of plugin.hooks) {
      try {
        const callback = pluginModule[hook.callback];
        if (typeof callback === 'function') {
          hookSystem.addAction(hook.name, callback, hook.priority, pluginSlug);
          
          if (this.debug) {
            console.log(`[PluginManager] Registered hook: ${hook.name} for ${pluginSlug}`);
          }
        } else {
          console.warn(`[PluginManager] Hook callback not found: ${hook.callback} in ${pluginSlug}`);
        }
      } catch (error) {
        console.error(`[PluginManager] Failed to register hook ${hook.name}:`, error);
      }
    }

    this.plugins.set(pluginSlug, plugin);
    this.loadedModules.set(pluginSlug, pluginModule);

    // Trigger plugin loaded hook
    hookSystem.doAction('plugin:loaded', plugin);

    return plugin;
  }

  /**
   * Load all active plugins from database
   */
  async loadAllPlugins(): Promise<void> {
    if (this.debug) {
      console.log('[PluginManager] Loading all active plugins...');
    }

    const activePlugins = await Plugin.getActivePlugins();
    
    for (const plugin of activePlugins) {
      try {
        await this.loadPlugin(plugin.slug);
      } catch (error) {
        console.error(`[PluginManager] Failed to load plugin ${plugin.slug}:`, error);
      }
    }

    if (this.debug) {
      console.log(`[PluginManager] Loaded ${this.plugins.size} plugins`);
    }
  }

  /**
   * Unload a plugin
   * @param pluginSlug - The plugin slug to unload
   */
  async unloadPlugin(pluginSlug: string): Promise<void> {
    if (this.debug) {
      console.log(`[PluginManager] Unloading plugin: ${pluginSlug}`);
    }

    const plugin = this.plugins.get(pluginSlug);
    if (!plugin) {
      return;
    }

    // Remove all hooks for this plugin
    hookSystem.removePluginHooks(pluginSlug);

    // Remove from registry
    this.plugins.delete(pluginSlug);
    this.loadedModules.delete(pluginSlug);

    // Trigger plugin unloaded hook
    hookSystem.doAction('plugin:unloaded', plugin);

    if (this.debug) {
      console.log(`[PluginManager] Plugin unloaded: ${plugin.name}`);
    }
  }

  /**
   * Reload a plugin
   * @param pluginSlug - The plugin slug to reload
   */
  async reloadPlugin(pluginSlug: string): Promise<void> {
    await this.unloadPlugin(pluginSlug);
    await this.loadPlugin(pluginSlug);
  }

  /**
   * Get a plugin component by ID
   * @param componentId - The component ID
   * @returns The component module or null
   */
  async getComponent(componentId: string): Promise<React.ComponentType<any> | null> {
    for (const [pluginSlug, plugin] of this.plugins.entries()) {
      const component = plugin.components.find((c) => c.id === componentId);
      
      if (component) {
        try {
          const pluginModule = this.loadedModules.get(pluginSlug);
          
          if (pluginModule && pluginModule.components) {
            const componentModule = await import(
              `@/plugins/${plugin.type}/${plugin.slug}/components/${component.component}`
            );
            
            if (this.debug) {
              console.log(`[PluginManager] Loaded component: ${componentId} from ${pluginSlug}`);
            }
            
            return componentModule.default;
          }
        } catch (error) {
          console.error(`[PluginManager] Failed to load component ${componentId}:`, error);
        }
      }
    }

    return null;
  }

  /**
   * Get a plugin by slug
   * @param pluginSlug - The plugin slug
   * @returns The plugin or null
   */
  getPlugin(pluginSlug: string): IPlugin | null {
    return this.plugins.get(pluginSlug) || null;
  }

  /**
   * Get all loaded plugins
   * @returns Array of loaded plugins
   */
  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a plugin is loaded
   * @param pluginSlug - The plugin slug
   * @returns True if plugin is loaded
   */
  isPluginLoaded(pluginSlug: string): boolean {
    return this.plugins.has(pluginSlug);
  }

  /**
   * Load plugin module dynamically
   * @param plugin - The plugin to load module for
   * @returns The plugin module
   */
  private async loadPluginModule(plugin: IPlugin): Promise<any> {
    try {
      const modulePath = `@/plugins/${plugin.type}/${plugin.slug}`;
      console.log(`[PluginManager] Attempting to load module from: ${modulePath}`);
      const loadedModule = await import(modulePath);
      console.log(`[PluginManager] Module loaded successfully from: ${modulePath}`);
      console.log(`[PluginManager] Available exports:`, Object.keys(loadedModule));
      
      // Check if init function exists
      if (typeof loadedModule.init === 'function') {
        console.log(`[PluginManager] Found init function: ${loadedModule.init.name}`);
      } else {
        console.warn(`[PluginManager] No init function found in module. Available exports:`, Object.keys(loadedModule));
        console.warn(`[PluginManager] Plugin may not be properly configured`);
      }
      
      return loadedModule;
    } catch (error) {
      console.error(`[PluginManager] Failed to load plugin module: ${plugin.slug}`, error);
      throw new Error(`Failed to load plugin module: ${plugin.slug}`);
    }
  }

  /**
   * Check plugin dependencies
   * @param plugin - The plugin to check dependencies for
   */
  private async checkDependencies(plugin: IPlugin): Promise<void> {
    for (const dep of plugin.dependencies) {
      if (!this.isPluginLoaded(dep)) {
        // Try to load the dependency
        try {
          await this.loadPlugin(dep);
        } catch (_error) {
          throw new Error(
            `Plugin ${plugin.name} requires ${dep} but it could not be loaded`
          );
        }
      }
    }

    if (this.debug && plugin.dependencies.length > 0) {
      console.log(`[PluginManager] Dependencies checked for ${plugin.name}: ${plugin.dependencies.join(', ')}`);
    }
  }

  /**
   * Get all available components from loaded plugins
   * @returns Array of component definitions
   */
  getAvailableComponents(): IPluginComponent[] {
    const components: IPluginComponent[] = [];
    
    for (const plugin of this.plugins.values()) {
      components.push(...plugin.components);
    }
    
    return components;
  }

  /**
   * Clear all loaded plugins
   */
  clearAll(): void {
    const pluginSlugs = Array.from(this.plugins.keys());
    
    for (const slug of pluginSlugs) {
      this.unloadPlugin(slug);
    }

    if (this.debug) {
      console.log('[PluginManager] All plugins cleared');
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

export { PluginManager };

// Global plugin manager instance
export const pluginManager = new PluginManager();

export default PluginManager;
