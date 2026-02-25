const fs = require('fs');
const path = require('path');
const glob = require('glob');

const appDir = path.join(__dirname, '../src/app');
const langDir = path.join(appDir, '[lang]');

const foldersToMove = [
    'account', 'cart', 'checkout', 'contact', 'haberler',
    'login', 'offline', 'portfolio', 'products', 'register',
    'services', 'videos'
];

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    const coreFolders = ['components', 'lib', 'models', 'types', 'plugins', 'themes', 'core', 'context', 'hooks', 'providers'];

    const regex = /from\s+['"]((?:\.\.\/)+)([^/'"]+)([^'"]*)['"]/g;
    content = content.replace(regex, (match, upDirs, firstFolder, restOfPath) => {
        if (coreFolders.includes(firstFolder)) {
            changed = true;
            return `from '@/${firstFolder}${restOfPath}'`;
        }
        changed = true;
        return `from '../${upDirs}${firstFolder}${restOfPath}'`;
    });

    const requireRegex = /(?:import|require)\s*\(\s*['"]((?:\.\.\/)+)([^/'"]+)([^'"]*)['"]\s*\)/g;
    content = content.replace(requireRegex, (match, upDirs, firstFolder, restOfPath) => {
        if (coreFolders.includes(firstFolder)) {
            changed = true;
            return match.includes('require') ? `require('@/${firstFolder}${restOfPath}')` : `import('@/${firstFolder}${restOfPath}')`;
        }
        changed = true;
        return match.includes('require') ? `require('../${upDirs}${firstFolder}${restOfPath}')` : `import('../${upDirs}${firstFolder}${restOfPath}')`;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed imports in: ${filePath}`);
    }
}

async function run() {
    if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
    }

    for (const folder of foldersToMove) {
        const srcPath = path.join(appDir, folder);
        const destPath = path.join(langDir, folder);

        if (fs.existsSync(srcPath)) {
            console.log(`Moving ${folder} to [lang] directory using copy and remove...`);
            try {
                fs.cpSync(srcPath, destPath, { recursive: true });
                fs.rmSync(srcPath, { recursive: true, force: true });
            } catch (err) {
                console.error(`Failed to move ${folder}:`, err.message);
            }
        }
    }

    console.log('Folders moved. Fixing imports...');
    const files = glob.sync(`${langDir}/**/*.{js,jsx,ts,tsx}`.replace(/\\/g, '/'));
    for (const file of files) {
        fixImports(file);
    }
    console.log('Done!');
}

run().catch(console.error);
