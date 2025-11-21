import {
    HomeIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    FolderOpenIcon,
    PhoneIcon,
    FilmIcon,
    SparklesIcon,
    RocketLaunchIcon,
    CodeBracketIcon,
    CpuChipIcon,
    GlobeAltIcon,
    PaintBrushIcon,
    MegaphoneIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

// Icon mapping for dynamic navigation and services
export const getIconForPage = (pageId: string) => {
    const iconMap: Record<string, any> = {
        home: HomeIcon,
        about: UserIcon,
        services: WrenchScrewdriverIcon,
        portfolio: FolderOpenIcon,
        contact: PhoneIcon,
        videos: FilmIcon,
    };
    return iconMap[pageId] || HomeIcon;
};

// Resolve icon component by string name
export const resolveIcon = (name?: string) => {
    if (!name) return undefined;

    const map: Record<string, any> = {
        HomeIcon,
        UserIcon,
        WrenchScrewdriverIcon,
        FolderOpenIcon,
        PhoneIcon,
        SparklesIcon,
        FilmIcon,
        RocketLaunchIcon,
        CodeBracketIcon,
        CpuChipIcon,
        GlobeAltIcon,
        PaintBrushIcon,
        MegaphoneIcon,
        ChartBarIcon
    };

    return map[name] || undefined;
};
