/**
 * Hook System - WordPress-like action and filter hooks
 * Allows plugins to hook into the application lifecycle
 */

export type HookCallback = (...args: any[]) => any;

interface HookEntry {
  callback: HookCallback;
  priority: number;
  pluginSlug?: string;
}

class HookSystem {
  private hooks: Map<string, HookEntry[]> = new Map();
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Add an action hook
   * @param hookName - The name of the hook
   * @param callback - The callback function
   * @param priority - Priority (lower numbers run first)
   * @param pluginSlug - Optional plugin identifier
   */
  addAction(
    hookName: string,
    callback: HookCallback,
    priority: number = 10,
    pluginSlug?: string
  ): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    this.hooks.get(hookName)!.push({ callback, priority, pluginSlug });
    this.sortHooks(hookName);
    
    if (this.debug) {
      console.log(`[HookSystem] Added action: ${hookName} (priority: ${priority})`);
    }
  }

  /**
   * Add a filter hook
   * @param hookName - The name of the hook
   * @param callback - The callback function
   * @param priority - Priority (lower numbers run first)
   * @param pluginSlug - Optional plugin identifier
   */
  addFilter(
    hookName: string,
    callback: HookCallback,
    priority: number = 10,
    pluginSlug?: string
  ): void {
    this.addAction(hookName, callback, priority, pluginSlug);
  }

  /**
   * Execute an action hook
   * @param hookName - The name of the hook
   * @param args - Arguments to pass to callbacks
   */
  doAction(hookName: string, ...args: any[]): void {
    const hooks = this.hooks.get(hookName) || [];
    
    if (this.debug && hooks.length > 0) {
      console.log(`[HookSystem] Executing action: ${hookName} (${hooks.length} callbacks)`);
    }
    
    for (const { callback, pluginSlug } of hooks) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`[HookSystem] Error in action ${hookName}${pluginSlug ? ` from plugin ${pluginSlug}` : ''}:`, error);
      }
    }
  }

  /**
   * Apply a filter hook
   * @param hookName - The name of the hook
   * @param value - The value to filter
   * @param args - Additional arguments to pass to callbacks
   * @returns The filtered value
   */
  applyFilters<T>(hookName: string, value: T, ...args: any[]): T {
    const hooks = this.hooks.get(hookName) || [];
    let result = value;
    
    if (this.debug && hooks.length > 0) {
      console.log(`[HookSystem] Applying filter: ${hookName} (${hooks.length} callbacks)`);
    }
    
    for (const { callback, pluginSlug } of hooks) {
      try {
        result = callback(result, ...args);
      } catch (error) {
        console.error(`[HookSystem] Error in filter ${hookName}${pluginSlug ? ` from plugin ${pluginSlug}` : ''}:`, error);
      }
    }
    
    return result;
  }

  /**
   * Remove a specific hook
   * @param hookName - The name of the hook
   * @param callback - The callback to remove
   * @param priority - Optional priority to match
   */
  removeHook(hookName: string, callback: HookCallback, priority?: number): void {
    const hooks = this.hooks.get(hookName);
    if (!hooks) return;
    
    const index = hooks.findIndex(
      (entry) => 
        entry.callback === callback && 
        (priority === undefined || entry.priority === priority)
    );
    
    if (index !== -1) {
      hooks.splice(index, 1);
      
      if (this.debug) {
        console.log(`[HookSystem] Removed hook: ${hookName}`);
      }
    }
  }

  /**
   * Remove all hooks for a specific plugin
   * @param pluginSlug - The plugin identifier
   */
  removePluginHooks(pluginSlug: string): void {
    for (const [hookName, hooks] of this.hooks.entries()) {
      const filtered = hooks.filter((entry) => entry.pluginSlug !== pluginSlug);
      
      if (filtered.length !== hooks.length) {
        this.hooks.set(hookName, filtered);
        
        if (this.debug) {
          console.log(`[HookSystem] Removed hooks for plugin ${pluginSlug} from ${hookName}`);
        }
      }
    }
  }

  /**
   * Check if a hook has any callbacks
   * @param hookName - The name of the hook
   * @returns True if the hook has callbacks
   */
  hasHook(hookName: string): boolean {
    const hooks = this.hooks.get(hookName);
    return hooks !== undefined && hooks.length > 0;
  }

  /**
   * Get all registered hook names
   * @returns Array of hook names
   */
  getHookNames(): string[] {
    return Array.from(this.hooks.keys());
  }

  /**
   * Clear all hooks
   */
  clearAll(): void {
    this.hooks.clear();
    
    if (this.debug) {
      console.log('[HookSystem] Cleared all hooks');
    }
  }

  /**
   * Sort hooks by priority
   * @param hookName - The name of the hook
   */
  private sortHooks(hookName: string): void {
    const hooks = this.hooks.get(hookName);
    if (hooks) {
      hooks.sort((a, b) => a.priority - b.priority);
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

export { HookSystem };

// Global hook system instance
export const hookSystem = new HookSystem(
  process.env.NODE_ENV === 'development'
);

export default HookSystem;
