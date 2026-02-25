const plugins: Record<string, () => Promise<any>> = {
    'seo-plugin': () => import('./built-in/seo-plugin/index').then(mod => mod),
};

export class PluginRegistry {
    /**
     * Retrieve a plugin module dynamically.
     * Plugins export hook system initializers or non-React entities.
     */
    static async getPlugin(pluginId: string) {
        const pluginImporter = plugins[pluginId];
        return pluginImporter ? await pluginImporter() : null;
    }
}
