/**
 * Portfolio Migration Script
 * Mevcut portfolio verilerini çoklu kategori yapısına dönüştürür
 * 
 * Kullanım:
 * node scripts/migrate-portfolio-categories.js
 */

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// .env dosyalarını yükle
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'personal-blog';

async function migratePortfolioCategories() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🚀 Starting portfolio categories migration...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const portfolioCollection = db.collection('portfolios');
    
    // Mevcut portfolio kayıtlarını al
    const portfolios = await portfolioCollection.find({}).toArray();
    console.log(`📊 Found ${portfolios.length} portfolio items to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const portfolio of portfolios) {
      try {
        const updates = {};
        let needsUpdate = false;
        
        // Eğer categoryId varsa ve categoryIds yoksa, migration yap
        if (portfolio.categoryId && !portfolio.categoryIds) {
          updates.categoryIds = [portfolio.categoryId];
          needsUpdate = true;
          console.log(`🔄 Migrating portfolio: ${portfolio.title}`);
          console.log(`   - Adding categoryIds: [${portfolio.categoryId}]`);
        }
        
        // Eğer categoryIds boşsa ve categoryId varsa, migration yap
        if (portfolio.categoryId && portfolio.categoryIds && portfolio.categoryIds.length === 0) {
          updates.categoryIds = [portfolio.categoryId];
          needsUpdate = true;
          console.log(`🔄 Updating empty categoryIds for: ${portfolio.title}`);
        }
        
        if (needsUpdate) {
          await portfolioCollection.updateOne(
            { _id: portfolio._id },
            { $set: updates }
          );
          migratedCount++;
          console.log(`✅ Migrated: ${portfolio.title}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped: ${portfolio.title} (already has categoryIds or no categoryId)`);
        }
      } catch (error) {
        console.error(`❌ Error migrating portfolio ${portfolio.title}:`, error);
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} items`);
    console.log(`⏭️  Skipped: ${skippedCount} items`);
    console.log(`📊 Total processed: ${portfolios.length} items`);
    
    // Verification - migrated verileri kontrol et
    console.log('\n🔍 Verification:');
    const verificationResults = await portfolioCollection.find({}).toArray();
    
    let withCategoryIds = 0;
    let withoutCategoryIds = 0;
    let withBothFields = 0;
    
    for (const item of verificationResults) {
      if (item.categoryIds && item.categoryIds.length > 0) {
        withCategoryIds++;
        if (item.categoryId) {
          withBothFields++;
        }
      } else {
        withoutCategoryIds++;
      }
    }
    
    console.log(`📊 Items with categoryIds: ${withCategoryIds}`);
    console.log(`📊 Items without categoryIds: ${withoutCategoryIds}`);
    console.log(`📊 Items with both categoryId and categoryIds: ${withBothFields}`);
    
    if (withoutCategoryIds > 0) {
      console.log('\n⚠️  Warning: Some items still don\'t have categoryIds');
      const itemsWithoutCategoryIds = await portfolioCollection.find({
        $or: [
          { categoryIds: { $exists: false } },
          { categoryIds: { $size: 0 } }
        ]
      }).toArray();
      
      console.log('Items without categoryIds:');
      itemsWithoutCategoryIds.forEach(item => {
        console.log(`  - ${item.title} (ID: ${item._id})`);
      });
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Dry run function - gerçek değişiklik yapmadan önce ne olacağını gösterir
async function dryRun() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🧪 Starting DRY RUN - no changes will be made...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const portfolioCollection = db.collection('portfolios');
    
    const portfolios = await portfolioCollection.find({}).toArray();
    console.log(`📊 Found ${portfolios.length} portfolio items`);
    
    let wouldMigrate = 0;
    let wouldSkip = 0;
    
    for (const portfolio of portfolios) {
      if (portfolio.categoryId && !portfolio.categoryIds) {
        console.log(`🔄 WOULD MIGRATE: ${portfolio.title}`);
        console.log(`   - Would add categoryIds: [${portfolio.categoryId}]`);
        wouldMigrate++;
      } else if (portfolio.categoryId && portfolio.categoryIds && portfolio.categoryIds.length === 0) {
        console.log(`🔄 WOULD UPDATE: ${portfolio.title}`);
        console.log(`   - Would add categoryIds: [${portfolio.categoryId}]`);
        wouldMigrate++;
      } else {
        console.log(`⏭️  WOULD SKIP: ${portfolio.title}`);
        wouldSkip++;
      }
    }
    
    console.log('\n📈 Dry Run Summary:');
    console.log(`🔄 Would migrate: ${wouldMigrate} items`);
    console.log(`⏭️  Would skip: ${wouldSkip} items`);
    console.log(`📊 Total: ${portfolios.length} items`);
    
  } catch (error) {
    console.error('❌ Dry run failed:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Command line argument handling
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');

if (isDryRun) {
  dryRun();
} else {
  migratePortfolioCategories();
} 