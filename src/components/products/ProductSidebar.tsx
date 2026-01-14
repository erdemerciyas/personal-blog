'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    FunnelIcon,
    XMarkIcon,
    CubeIcon,
    SwatchIcon,
    WrenchScrewdriverIcon,
    QrCodeIcon,
    TagIcon,
    Square3Stack3DIcon,
    CpuChipIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';

interface CategoryNode {
    _id: string;
    name: string;
    children?: CategoryNode[];
}

interface ProductSidebarProps {
    categories: any[];
    currentCategory: string;
    currentCondition: string;
    priceMin: string;
    priceMax: string;
    baseUrl: string; // e.g. /products
    searchParams: Record<string, string>;
}

export default function ProductSidebar({
    categories,
    currentCategory,
    currentCondition,
    priceMin,
    priceMax,
    baseUrl,
    searchParams,
}: ProductSidebarProps) {
    // Collapsible sections state
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        categories: true,
        price: true,
        condition: true,
    });

    // Expanded category nodes state
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        if (currentCategory) {
            // Very simple auto-expand: Expand everything active or parent of active
            // Since we don't have easy parent lookup here without traversing,
            // we will let the user expand manually or rely on a "expand all parents" logic if we had the tree built.
            // Check if we can find the category and its parents easily.
            // For now, let's just default to collapsed unless we want to be fancy.
            // Optimization: We could traverse `categories` to find the path.
            let curr = categories.find(c => c._id === currentCategory);
            while (curr && curr.parent) {
                initial[curr.parent] = true;
                curr = categories.find(c => c._id === curr.parent);
            }
            initial[currentCategory] = true;
        }
        return initial;
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleCategory = (e: React.MouseEvent, categoryId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    // Helper to build URL
    const getUrl = (newParams: Record<string, string>) => {
        const sp = new URLSearchParams({ ...searchParams, ...newParams, page: '1' });
        return `${baseUrl}?${sp.toString()}`;
    };

    // Helper to get Icon
    const getCategoryIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('yazıcı') || n.includes('printer')) return CubeIcon;
        if (n.includes('filament')) return SwatchIcon;
        if (n.includes('reçine') || n.includes('resin')) return BeakerIcon;
        if (n.includes('parça') || n.includes('yedek')) return WrenchScrewdriverIcon;
        if (n.includes('aksesuar')) return CpuChipIcon;
        if (n.includes('tarayıcı') || n.includes('scanner')) return QrCodeIcon;
        return TagIcon;
    };

    // Recursive Category Item Component
    const CategoryItem = ({ node, depth = 0 }: { node: any, depth?: number }) => {
        const isSelected = currentCategory === String(node._id);
        const children = node.children || [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedCategories[node._id];

        // Dynamic Icon based on name for top level, specific icon for children if needed
        const Icon = depth === 0 ? getCategoryIcon(node.name) : (hasChildren ? Square3Stack3DIcon : TagIcon);

        return (
            <div className="select-none">
                <div
                    className={`relative flex items-center justify-between group rounded-lg my-0.5 transition-all duration-200 ${isSelected
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    {/* Left active indicator line */}
                    {isSelected && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-md" />}

                    <Link
                        href={getUrl({ category: node._id })}
                        className={`flex-1 flex items-center gap-3 py-2 ${depth === 0 ? 'px-3' : 'pr-3'}`}
                        style={{ paddingLeft: depth === 0 ? '12px' : `${(depth * 16) + 12}px` }}
                        title={node.name}
                    >
                        {/* Only show big icon for top level, small categorization for others */}
                        <Icon className={`flex-shrink-0 transition-colors ${depth === 0 ? 'w-5 h-5' : 'w-4 h-4 opacity-70'
                            } ${isSelected ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />

                        <span className={`truncate text-sm ${depth === 0 ? 'font-medium' : ''}`}>
                            {node.name}
                        </span>
                        {node.productCount > 0 && (
                            <span className={`ml-auto pl-2 text-xs opacity-60 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {node.productCount}
                            </span>
                        )}
                    </Link>

                    {hasChildren && (
                        <button
                            onClick={(e) => toggleCategory(e, node._id)}
                            className={`p-1.5 mr-1 rounded-md hover:bg-black/5 text-slate-400 transition-all ${isExpanded ? 'rotate-90 text-emerald-600' : ''}`}
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="relative">
                        {/* Vertical Guide Line */}
                        <div
                            className="absolute border-l border-slate-200"
                            style={{
                                left: `${(depth * 16) + 12 + 10}px`, // Icon centerish
                                top: '0',
                                bottom: '8px'
                            }}
                        />
                        <div>
                            {children.map((child: any) => (
                                <CategoryItem key={child._id} node={child} depth={depth + 1} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Prepare Tree Data structure
    const buildTree = (items: any[]) => {
        const roots = items.filter(i => !i.parent);
        const byParent: Record<string, any[]> = {};
        items.forEach(i => {
            if (i.parent) {
                if (!byParent[i.parent]) byParent[i.parent] = [];
                byParent[i.parent].push(i);
            }
        });

        const attachChildren = (nodes: any[]) => {
            nodes.forEach(node => {
                node.children = byParent[node._id] || [];
                attachChildren(node.children);
            });
        };

        const deepRoots = JSON.parse(JSON.stringify(roots));
        attachChildren(deepRoots);
        return deepRoots;
    };

    const treeData = buildTree(categories);

    return (
        <div className="space-y-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-sm">
            {/* Categories Section */}
            <div className="border-b border-slate-100/80 pb-6 last:border-0">
                <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full mb-4 group select-none"
                >
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-slate-800 text-sm tracking-wide">KATEGORİLER</h3>
                    </div>
                    {openSections.categories ? (
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                </button>

                {openSections.categories && (
                    <div className="space-y-1">
                        <Link
                            href={getUrl({ category: '' })}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-2 ${!currentCategory
                                ? 'bg-slate-800 text-white shadow-md shadow-slate-200'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200'
                                }`}
                        >
                            <Square3Stack3DIcon className="w-5 h-5" />
                            <span className="font-medium">Tüm Ürünler</span>
                        </Link>
                        {treeData.map((node: any) => (
                            <CategoryItem key={node._id} node={node} />
                        ))}
                    </div>
                )}
            </div>

            {/* Price Section */}
            <div className="border-b border-slate-100/80 pb-6 last:border-0">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full mb-4 group select-none"
                >
                    <h3 className="font-bold text-slate-800 text-sm tracking-wide">FİYAT ARALIĞI</h3>
                    {openSections.price ? (
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                </button>
                {openSections.price && (
                    <PriceRangeFilter />
                )}
            </div>

            {/* Condition Section */}
            <div className="border-b border-slate-100/80 pb-6 last:border-0">
                <button
                    onClick={() => toggleSection('condition')}
                    className="flex items-center justify-between w-full mb-4 group select-none"
                >
                    <h3 className="font-bold text-slate-800 text-sm tracking-wide">DURUM</h3>
                    {openSections.condition ? (
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                </button>
                {openSections.condition && (
                    <div className="space-y-2.5 mt-2">
                        {[
                            { val: '', label: 'Hepsi' },
                            { val: 'new', label: 'Sıfır' },
                            { val: 'used', label: 'İkinci El' }
                        ].map(opt => (
                            <Link
                                key={opt.val || 'all'}
                                href={getUrl({ condition: opt.val })}
                                className="flex items-center group cursor-pointer"
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${(currentCondition || '') === opt.val
                                    ? 'border-emerald-600 ring-2 ring-emerald-100'
                                    : 'border-slate-300 group-hover:border-emerald-400'
                                    }`}>
                                    {(currentCondition || '') === opt.val && (
                                        <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                                    )}
                                </div>
                                <span className={`ml-3 text-sm transition-colors ${(currentCondition || '') === opt.val ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                                    }`}>
                                    {opt.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
