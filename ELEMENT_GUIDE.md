# Semantic HTML Element Guide

Bu rehber, projede hangi HTML elemanlarının nerede kullanılacağını tanımlar.

## Landmark Elemanları

| Eleman | Kullanım Yeri | Kural |
|--------|---------------|-------|
| `<main>` | Layout başına 1 tane | Sayfa ana içeriği. `id="main-content"` skip-link hedefi |
| `<header>` | Sayfa/bölüm başlığı | Topbar, hero alanları. `<hgroup>` ile title+description |
| `<footer>` | Sayfa/bölüm sonu | Site footer, card footer |
| `<nav>` | Navigasyon grupları | Her `<nav>`'a `aria-label` ekle: `"Ana menü"`, `"Breadcrumb"`, `"Sayfalama"` |
| `<aside>` | Yan içerik | Sidebar, ilgili içerik kutuları |
| `<section>` | Tematik bölümler | Her `<section>`'da heading (`h2`-`h6`) olmalı |
| `<article>` | Bağımsız içerik | Blog yazısı, haber kartı, ürün kartı |

## Component → Eleman Eşleştirmesi

| Component | Varsayılan | `as` Prop Seçenekleri | Ne Zaman Değiştirilir |
|-----------|------------|----------------------|----------------------|
| `Card` | `<div>` | `div`, `article`, `section`, `li` | Liste öğesi → `li`, bağımsız içerik → `article` |
| `PageHeader` | `<header>` | — | Her zaman `<header>` + `<hgroup>` |
| `DataTable` | `<table>` | — | Tablo verisi için daima `<table>` |
| `FormSection` | `<fieldset>` | — | Form bölümleri için `<fieldset>` + `<legend>` |
| `Alert` | `<div>` | — | `role="alert"` otomatik eklenir |

## Heading Hiyerarşisi

```
<h1>  → Sayfa başlığı (PageHeader) — sayfa başına 1 tane
<h2>  → Ana bölüm başlıkları (section)
<h3>  → Alt bölüm / Card başlıkları
<h4>  → Detay grupları
```

Heading seviyesi atlamayın (`h1` → `h3` yasak, `h1` → `h2` → `h3` doğru).

## Liste Kuralları

| Durum | Doğru Pattern |
|-------|--------------|
| Kart grid'i | `<ul>` + `<Card as="li">` |
| Nav linkleri | `<nav><ul><li><a>` |
| Adım listesi | `<ol><li>` |

## Z-Index Katmanları

Tailwind config'deki semantic isimler kullanılmalı:

| Katman | Token | Değer | Kullanım |
|--------|-------|-------|----------|
| Dropdown | `z-dropdown` | 10 | Açılır menüler |
| Sticky | `z-sticky` | 20 | Sticky header/toolbar |
| Fixed | `z-fixed` | 30 | Fixed navbar |
| Modal backdrop | `z-modal` | 40 | Modal arka planı |
| Popover | `z-popover` | 50 | Popover, tooltip |
| Tooltip | `z-tooltip` | 60 | En üst katman |

Asla hardcoded `z-[999]` veya inline `zIndex` kullanmayın.

## Erişilebilirlik Kuralları

1. **Skip-to-content**: Her layout'un ilk elemanı `<a href="#main-content" class="sr-only focus:not-sr-only">İçeriğe geç</a>`
2. **aria-label**: Birden fazla `<nav>` varsa her birine benzersiz `aria-label`
3. **role**: Semantic eleman varken `role` kullanmayın (`<nav>` varken `role="navigation"` gereksiz)
4. **img alt**: Tüm `<img>` elemanlarında `alt` zorunlu (dekoratif ise `alt=""`)
