import mongoose from 'mongoose';
import slugify from 'slugify';
import Portfolio from '@/models/Portfolio';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const migratePortfolioSlugs = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected');

    const portfolios = await Portfolio.find({});
    let updatedCount = 0;

    for (const portfolio of portfolios) {
      if (!portfolio.slug) {
        const newSlug = slugify(portfolio.title, { lower: true, strict: true });
        
        // Check for slug uniqueness before saving
        const existingPortfolio = await Portfolio.findOne({ slug: newSlug });
        if (existingPortfolio) {
          console.warn(`Slug "${newSlug}" already exists for portfolio "${existingPortfolio.title}". Skipping "${portfolio.title}".`);
          continue;
        }

        portfolio.slug = newSlug;
        await portfolio.save();
        updatedCount++;
        console.log(`Updated slug for portfolio: "${portfolio.title}" -> "${portfolio.slug}"`);
      }
    }

    console.log(`Migration complete. ${updatedCount} portfolios updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migratePortfolioSlugs();
