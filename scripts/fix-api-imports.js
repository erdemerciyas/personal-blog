const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/api/public/**/*.{ts,tsx,js,jsx}');

for (const f of files) {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Replace any number of ../ followed by a targetDir (e.g. lib, models, utils, core, types)
    const regex = new RegExp(`from\\s+['"](\\.\\.\\/)+(lib|models|utils|core|types|context|hooks|providers|components)(.*?)['"]`, 'g');
    c = c.replace(regex, (match, dotdots, targetDir, rest) => {
        changed = true;
        return `from '@/${targetDir}${rest}'`;
    });

    const requireRegex = new RegExp(`(?:import|require)\\s*\\(\\s*['"](\\.\\.\\/)+(lib|models|utils|core|types|context|hooks|providers|components)(.*?)['"]\\s*\\)`, 'g');
    c = c.replace(requireRegex, (match, dotdots, targetDir, rest) => {
        changed = true;
        const isRequire = match.includes('require');
        return isRequire ? `require('@/${targetDir}${rest}')` : `import('@/${targetDir}${rest}')`;
    });

    if (changed) {
        fs.writeFileSync(f, c);
        console.log('Fixed imports in:', f);
    }
}
