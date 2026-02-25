const fs = require('fs');
const path = require('path');
const glob = require('glob');

const apiDir = path.join(process.cwd(), 'src/app/api');
const publicApiDir = path.join(apiDir, 'public');

if (!fs.existsSync(publicApiDir)) {
    fs.mkdirSync(publicApiDir, { recursive: true });
}

// Folders to keep in root /api/
const keepInRoot = ['admin', 'auth', 'public', 'swagger', 'docs', 'robots.ts', 'sitemap.ts', 'cron', 'health', 'upload', 'test-db'];

// Move folders
const items = fs.readdirSync(apiDir);
const movedModules = [];

for (const item of items) {
    if (keepInRoot.includes(item)) continue;

    const fromPath = path.join(apiDir, item);
    const toPath = path.join(publicApiDir, item);

    if (fs.existsSync(fromPath)) {
        try {
            fs.cpSync(fromPath, toPath, { recursive: true });
            fs.rmSync(fromPath, { recursive: true, force: true });
            movedModules.push(item);
            console.log(`Moved ${item} to public/`);
        } catch (err) {
            console.log(`Failed to move ${item}:`, err.message);
        }
    }
}

console.log('Moved modules:', movedModules);

// Now update all fetch requests and imports in the project
// We look for fetch('/api/XYZ') or any string containing '/api/XYZ'
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');

for (const f of files) {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    for (const mod of movedModules) {
        // Escape module name
        const modRegex = mod.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // Replace exact paths like: '/api/products' -> '/api/public/products'
        const strRegex = new RegExp(`(['"\`])/api/${modRegex}([/\\?'"\`])`, 'g');
        c = c.replace(strRegex, (match, quote1, rest) => {
            changed = true;
            return `${quote1}/api/public/${mod}${rest}`;
        });

        const endStrRegex = new RegExp(`(['"\`])/api/${modRegex}$`, 'gm');
        c = c.replace(endStrRegex, (match, quote1) => {
            changed = true;
            return `${quote1}/api/public/${mod}`;
        });
    }

    if (changed) {
        fs.writeFileSync(f, c);
        console.log('Updated references in', f);
    }
}
