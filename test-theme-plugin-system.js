/**
 * Test script to verify theme and plugin system
 * Run this script to check if the system is working correctly
 */

const fetch = require('node-fetch');

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`\n🔍 Testing ${endpoint}...`);
    const response = await fetch(`http://localhost:3000${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Theme and Plugin System\n');
  console.log('=====================================\n');

  // Test 1: Check if server is running
  console.log('1️⃣  Checking server status...');
  const serverCheck = await testAPI('/');
  if (!serverCheck.success) {
    console.log('❌ Server is not running. Please start the server with: npm run dev');
    process.exit(1);
  }
  console.log('✅ Server is running\n');

  // Test 2: Fetch themes
  console.log('\n2️⃣  Testing themes API...');
  const themesResult = await testAPI('/api/admin/themes');
  
  if (themesResult.success) {
    const themes = themesResult.data || [];
    console.log(`✅ Found ${themes.length} theme(s)`);
    themes.forEach(theme => {
      console.log(`   - ${theme.name} (${theme.slug}) - Active: ${theme.isActive}`);
    });
    
    if (themes.length === 0) {
      console.log('⚠️  No themes found. Run seed script first:');
      console.log('   curl -X POST http://localhost:3000/api/admin/seed-plugins-themes');
    }
  } else {
    console.log(`❌ Failed to fetch themes: ${themesResult.error}`);
  }

  // Test 3: Fetch plugins
  console.log('\n3️⃣  Testing plugins API...');
  const pluginsResult = await testAPI('/api/admin/plugins');
  
  if (pluginsResult.success) {
    const plugins = pluginsResult.data || [];
    console.log(`✅ Found ${plugins.length} plugin(s)`);
    plugins.forEach(plugin => {
      console.log(`   - ${plugin.name} (${plugin.slug}) - Active: ${plugin.isActive}`);
    });
    
    if (plugins.length === 0) {
      console.log('⚠️  No plugins found. Run seed script first:');
      console.log('   curl -X POST http://localhost:3000/api/admin/seed-plugins-themes');
    }
  } else {
    console.log(`❌ Failed to fetch plugins: ${pluginsResult.error}`);
  }

  // Test 4: Check seeding status
  console.log('\n4️⃣  Checking seeding status...');
  const seedStatus = await testAPI('/api/admin/seed-plugins-themes');
  
  if (seedStatus.success) {
    const { pluginCount, themeCount, needsSeeding } = seedStatus.data || {};
    console.log(`✅ Plugins: ${pluginCount}, Themes: ${themeCount}`);
    console.log(`   Needs seeding: ${needsSeeding ? 'YES' : 'NO'}`);
    
    if (needsSeeding) {
      console.log('\n💡 Running seed script...');
      const seedResult = await testAPI('/api/admin/seed-plugins-themes', 'POST');
      
      if (seedResult.success) {
        console.log('✅ Seed completed successfully!');
        
        // Fetch themes and plugins again to verify
        console.log('\n5️⃣  Verifying seeded data...');
        await testAPI('/api/admin/themes');
        await testAPI('/api/admin/plugins');
      } else {
        console.log(`❌ Seed failed: ${seedResult.error}`);
      }
    }
  } else {
    console.log(`❌ Failed to check seeding status: ${seedStatus.error}`);
  }

  // Test 5: Try to activate a theme (optional)
  console.log('\n5️⃣  Testing theme activation (optional)...');
  console.log('   Skipping theme activation test (requires admin authentication)');
  console.log('   To test manually: curl -X POST http://localhost:3000/api/admin/themes/activate -H "Content-Type: application/json" -d \'{"slug": "fixral"}\'');

  console.log('\n=====================================');
  console.log('✅ Test completed!\n');
  console.log('💡 Next steps:');
  console.log('   1. If no themes/plugins found, run the seed script');
  console.log('   2. Check the browser console for any errors');
  console.log('   3. Visit http://localhost:3000/admin/themes to manage themes');
  console.log('   4. Visit http://localhost:3000/admin/plugins to manage plugins');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
