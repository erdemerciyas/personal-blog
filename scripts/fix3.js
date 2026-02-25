const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/[lang]/**/*.{ts,tsx,js,jsx}');
const targetDirs = ['components', 'lib', 'models', 'types', 'plugins', 'themes', 'core', 'context', 'hooks', 'providers'];

for (const f of files) {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    const regex = new RegExp(`from\\s+['"](\\.\\.\\/)+(${targetDirs.join('|')})(.*?)['"]`, 'g');
    c = c.replace(regex, (match, dotdots, targetDir, rest) => {
        changed = true;
        return `from '@/${targetDir}${rest}'`;
    });

    const requireRegex = new RegExp(`(?:import|require)\\s*\\(\\s*['"](\\.\\.\\/)+(${targetDirs.join('|')})(.*?)['"]\\s*\\)`, 'g');
    c = c.replace(requireRegex, (match, dotdots, targetDir, rest) => {
        changed = true;
        const isRequire = match.includes('require');
        return isRequire ? `require('@/${targetDir}${rest}')` : `import('@/${targetDir}${rest}')`;
    });

    if (changed) {
        fs.writeFileSync(f, c);
        console.log('Fixed:', f);
    }
}
