import dynamic from 'next/dynamic';

const themes: Record<string, any> = {
    default: {
        HomeTemplate: dynamic(() => import('./default/templates/HomeTemplate')),
        PageTemplate: dynamic(() => import('./default/templates/PageTemplate')),
        BlogTemplate: dynamic(() => import('./default/templates/BlogTemplate')),
        PortfolioTemplate: dynamic(() => import('./default/templates/PortfolioTemplate')),
        SingleTemplate: dynamic(() => import('./default/templates/SingleTemplate')),
    },
    fixral: {
        HomeTemplate: dynamic(() => import('./fixral/templates/HomeTemplate')),
        PageTemplate: dynamic(() => import('./fixral/templates/PageTemplate')),
        BlogTemplate: dynamic(() => import('./fixral/templates/BlogTemplate')),
        PortfolioTemplate: dynamic(() => import('./fixral/templates/PortfolioTemplate')),
        SingleTemplate: dynamic(() => import('./fixral/templates/SingleTemplate')),
    }
};

export class ThemeRegistry {
    /**
     * Get a specific template from the active theme.
     * If the template or theme does not exist, defaults to 'default' theme components.
     * Note: With Next.js app router, the layout logic takes care of CSS vars, 
     * this registry handles React component variance.
     */
    static getTemplate(themeName: string, templateName: string) {
        const theme = themes[themeName] || themes.default;
        return theme[templateName] || themes.default[templateName];
    }
}
