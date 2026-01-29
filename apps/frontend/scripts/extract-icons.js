const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname, '../../../apps/n8n-master/packages/nodes-base/nodes');
const DEST_DIR = path.resolve(__dirname, '../public/icons/integrations');

console.log(`Source: ${SOURCE_DIR}`);
console.log(`Dest: ${DEST_DIR}`);

if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory does not exist!`);
    process.exit(1);
}

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

function copyIcons() {
    const nodes = fs.readdirSync(SOURCE_DIR);
    let count = 0;

    nodes.forEach(nodeDir => {
        const nodePath = path.join(SOURCE_DIR, nodeDir);
        if (!fs.statSync(nodePath).isDirectory()) return;

        // Look for SVG files
        const files = fs.readdirSync(nodePath);
        const svgFile = files.find(f => f.endsWith('.svg'));

        if (svgFile) {
            // Use the directory name as the integration name (e.g., Slack.svg)
            // Normalize: Slack -> Slack.svg
            const destPath = path.join(DEST_DIR, `${nodeDir}.svg`);
            fs.copyFileSync(path.join(nodePath, svgFile), destPath);
            console.log(`Copied ${nodeDir}.svg`);
            count++;
        }
    });

    console.log(`\n✅ Successfully copied ${count} icons to ${DEST_DIR}`);
}

copyIcons();
