const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/[lang]/**/*.{ts,tsx,js,jsx}');

for (const f of files) {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    const regex1 = /from\s+['"](?:\.\.\/)+([^/]+)(.*)['"]/g;
    c = c.replace(regex1, (match, folder, rest) => {
        if (['components', 'lib', 'models', 'types', 'plugins', 'themes', 'core', 'context', 'hooks', 'providers'].includes(folder)) {
            changed = true;
            return `from '@/${folder}${rest}'`;
        }
        return match;
    });

    const regex2 = /(?:import|require)\s*\(\s*['"](?:\.\.\/)+([^/]+)(.*)['"]\s*\)/g;
    c = c.replace(regex2, (match, folder, rest) => {
        if (['components', 'lib', 'models', 'types', 'plugins', 'themes', 'core', 'context', 'hooks', 'providers'].includes(folder)) {
            changed = true;
            return match.includes('require') ? `require('@/${folder}${rest}')` : `import('@/${folder}${rest}')`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(f, c);
        console.log('Fixed:', f);
    }
}
