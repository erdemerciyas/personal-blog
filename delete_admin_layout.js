const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'layout.tsx');

try {
  fs.unlinkSync(filePath);
  console.log(`Deleted: ${filePath}`);
} catch (error) {
  console.error(`Error deleting ${filePath}:`, error);
}