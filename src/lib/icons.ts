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
    ChartBarIcon,
    NewspaperIcon
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
        news: NewspaperIcon,
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
        ChartBarIcon,
        NewspaperIcon
    };

    return map[name] || undefined;
};

// Available icons list for icon picker UI
export const availableIcons = [
    { name: 'HomeIcon', label: 'Ev' },
    { name: 'UserIcon', label: 'Kullanıcı' },
    { name: 'WrenchScrewdriverIcon', label: 'Araçlar' },
    { name: 'FolderOpenIcon', label: 'Klasör' },
    { name: 'PhoneIcon', label: 'Telefon' },
    { name: 'FilmIcon', label: 'Video' },
    { name: 'SparklesIcon', label: 'Yıldız' },
    { name: 'RocketLaunchIcon', label: 'Roket' },
    { name: 'CodeBracketIcon', label: 'Kod' },
    { name: 'CpuChipIcon', label: 'Çip' },
    { name: 'GlobeAltIcon', label: 'Dünya' },
    { name: 'PaintBrushIcon', label: 'Fırça' },
    { name: 'MegaphoneIcon', label: 'Megafon' },
    { name: 'ChartBarIcon', label: 'Grafik' },
    { name: 'NewspaperIcon', label: 'Haber' },
];
