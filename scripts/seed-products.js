require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const slugify = require('slugify');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI tanımlı değil.');
    process.exit(1);
}

// --- Schemas ---
// Define schemas explicitly to avoid compilation errors in script context
let ProductCategory;
try {
    ProductCategory = mongoose.model('ProductCategory');
} catch {
    const productCategorySchema = new mongoose.Schema({
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: String,
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    }, { timestamps: true });
    ProductCategory = mongoose.model('ProductCategory', productCategorySchema);
}

let Product;
try {
    Product = mongoose.model('Product');
} catch {
    const productSchema = new mongoose.Schema({
        title: String,
        slug: { type: String, unique: true },
        description: String,
        price: Number,
        currency: { type: String, default: 'TRY' },
        stock: Number,
        categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' }],
        images: [String],
        coverImage: String,
        condition: { type: String, enum: ['new', 'used'], default: 'new' },
        status: { type: String, default: 'published' },
        ratingAverage: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }, { timestamps: true });
    Product = mongoose.model('Product', productSchema);
}

// --- Data Structure (Deep Nested Categories) ---
const categoryTree = [
    {
        name: '3D Yazıcılar',
        children: [
            {
                name: 'FDM Yazıcılar',
                children: [
                    {
                        name: 'Profesyonel Seri',
                        children: [
                            { name: 'Bambu Lab', children: [{ name: 'X1 Carbon Serisi' }, { name: 'P1P Serisi' }] },
                            { name: 'Creality K1', children: [{ name: 'K1 Max' }, { name: 'K1 Speed' }] }
                        ]
                    },
                    {
                        name: 'Giriş Seviyesi',
                        children: [
                            { name: 'Ender 3 Serisi', children: [{ name: 'Ender 3 V3 KE' }, { name: 'Ender 3 S1 Pro' }] },
                            { name: 'Anycubic Kobra', children: [{ name: 'Kobra 2 Neo' }, { name: 'Kobra 2 Max' }] }
                        ]
                    }
                ]
            },
            {
                name: 'Reçine (SLA) Yazıcılar',
                children: [
                    {
                        name: '12K Çözünürlük',
                        children: [
                            { name: 'Anycubic Photon M5s' },
                            { name: 'Elegoo Saturn 3 Ultra' }
                        ]
                    },
                    {
                        name: '8K ve Altı',
                        children: [
                            { name: 'Phrozen Sonic Mini' },
                            { name: 'Creality Halot Mage' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Filamentler',
        children: [
            {
                name: 'PLA Filamentler',
                children: [
                    {
                        name: 'Standart PLA',
                        children: [{ name: '1.75mm Beyaz' }, { name: '1.75mm Siyah' }, { name: '1.75mm Gri' }]
                    },
                    {
                        name: 'Silk (İpek) PLA',
                        children: [{ name: 'Altın Rengi' }, { name: 'Gümüş Rengi' }, { name: 'Bakır Rengi' }]
                    },
                    {
                        name: 'Matte PLA',
                        children: [{ name: 'Pastel Renkler' }, { name: 'Toprak Tonları' }]
                    }
                ]
            },
            {
                name: 'Mühendislik',
                children: [
                    { name: 'ABS / ASA', children: [{ name: 'Yüksek Isıya Dayanıklı' }] },
                    { name: 'PETG', children: [{ name: 'Şeffaf Renkler' }, { name: 'Solid Renkler' }] },
                    { name: 'Karbon Fiber', children: [{ name: 'PLA-CF' }, { name: 'PETG-CF' }, { name: 'PA-CF (Naylon)' }] }
                ]
            }
        ]
    },
    {
        name: 'Yedek Parça & Aksesuar',
        children: [
            {
                name: 'Hotend Sistemleri',
                children: [
                    { name: 'Nozzle (Meme)', children: [{ name: 'Hardened Steel' }, { name: 'Brass (Pirinç)' }, { name: 'CHT High Flow' }] },
                    { name: 'Isıtıcı Bloklar', children: [{ name: 'Seramik Isıtıcılar' }, { name: 'Kartuş Fişekler' }] }
                ]
            },
            {
                name: 'Baskı Yüzeyleri',
                children: [
                    { name: 'PEI Tablalar', children: [{ name: 'Dokulu PEI' }, { name: 'Pürüzsüz PEI' }] },
                    { name: 'Cam Tablalar' }
                ]
            }
        ]
    }
];

const SAMPLE_IMAGES = [
    'https://placehold.co/600x400/2563eb/white.png?text=3D+Printer',
    'https://placehold.co/600x400/16a34a/white.png?text=Filament',
    'https://placehold.co/600x400/dc2626/white.png?text=Spare+Part',
    'https://placehold.co/600x400/d97706/white.png?text=Resin',
    'https://placehold.co/600x400/7c3aed/white.png?text=Upgrade',
    'https://placehold.co/600x400/db2777/white.png?text=Accessory'
];

// --- Helpers ---
function makeSlug(text) {
    return slugify(text + '-' + Math.random().toString(36).substring(2, 7), { lower: true, strict: true, locale: 'tr' });
}

async function createCategoryTree(nodes, parentId = null) {
    let leafIds = [];
    for (const node of nodes) {
        let cat = await ProductCategory.create({
            name: node.name,
            slug: makeSlug(node.name),
            description: `${node.name} kategorisi için ürünler.`,
            parent: parentId,
            isActive: true
        });
        console.log(`📁 Kategori: ${node.name} (Parent: ${parentId ? 'Var' : 'Yok'})`);

        if (node.children && node.children.length > 0) {
            const childrenLeaves = await createCategoryTree(node.children, cat._id);
            leafIds = [...leafIds, ...childrenLeaves];
        } else {
            // This is a leaf node
            leafIds.push({ id: cat._id, name: node.name });
        }
    }
    return leafIds;
}

// --- Main Seed Function ---
async function seed() {
    try {
        console.log('🔄 Bağlanılıyor...');
        await mongoose.connect(MONGODB_URI);

        console.log('🔥 Eski veriler siliniyor...');
        await Product.deleteMany({});
        await ProductCategory.deleteMany({});

        console.log('🌳 Kategori ağacı oluşturuluyor...');
        // Create categories and get leaf nodes for product assignment
        const leafCategories = await createCategoryTree(categoryTree);
        console.log(`✅ Toplam ${leafCategories.length} adet en alt (yaprak) kategori oluşturuldu.`);

        console.log('📦 Ürünler üretiliyor...');
        const products = [];
        const TOTAL_PRODUCTS = 150; // Realistic number

        const adjectives = ['Profesyonel', 'Yüksek Performanslı', 'Ekonomik', 'Hızlı', 'Sessiz', 'Dayanıklı', 'Hassas', 'Gelişmiş'];
        const conditions = ['new', 'used'];

        for (let i = 0; i < TOTAL_PRODUCTS; i++) {
            // Pick a random leaf category
            const leaf = leafCategories[Math.floor(Math.random() * leafCategories.length)];

            // Contextual Title
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const title = `${leaf.name} - ${adj} Model ${Math.floor(Math.random() * 100) + 1}`;

            const price = (Math.random() * 20000 + 500).toFixed(2);
            const isNew = Math.random() > 0.2; // 80% new

            products.push({
                title: title,
                slug: makeSlug(title),
                description: `Bu ${title}, ${leaf.name} kategorisindeki en iyi ürünlerden biridir. Yüksek baskı kalitesi ve uzun ömürlü kullanım sunar. Şimdi sipariş verin!`,
                price: Number(price),
                currency: 'TRY',
                stock: Math.floor(Math.random() * 50),
                categoryIds: [leaf.id], // Assign to ONLY the leaf category
                condition: isNew ? 'new' : 'used',
                coverImage: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
                images: [
                    SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
                    SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]
                ],
                ratingAverage: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                ratingCount: Math.floor(Math.random() * 120),
                status: 'published',
                isActive: true
            });
        }

        await Product.insertMany(products);
        console.log(`✅ ${products.length} adet ürün başarıyla eklendi.`);

        console.log('🎉 İşlem tamamlandı!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

seed();
