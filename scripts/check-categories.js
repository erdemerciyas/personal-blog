require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const ProductCategory = mongoose.model('ProductCategory', new mongoose.Schema({}, { strict: false }));
    const count = await ProductCategory.countDocuments({ isActive: true });
    const items = await ProductCategory.find({ isActive: true, parent: null }).limit(5);
    console.log(`Total Categories: ${count}`);
    console.log('Root Categories:', items.map(i => i.name));
    process.exit();
}
check();
