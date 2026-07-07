const fs = require('fs');

const assets = fs.readFileSync('js/assets.js', 'utf8');
const grid = fs.readFileSync('js/grid.js', 'utf8');
const ui = fs.readFileSync('js/ui.js', 'utf8');
const game = fs.readFileSync('js/game.js', 'utf8');

function stripModule(code) {
  return code
    .replace(/^import .+ from ['"].+['"];?$/gm, '')
    .replace(/^export (function|class|const|let|var) /gm, '$1 ')
    .replace(/^export \{/gm, '/* export */')
    .replace(/^export default /gm, '')
    .trim();
}

const bundled = [
  '// FarmVerse - Bundled Game Script',
  '// ============================================',
  '',
  stripModule(assets),
  '',
  stripModule(grid),
  '',
  stripModule(ui),
  '',
  stripModule(game),
  '',
  '// All modules loaded.',
].join('\n');

fs.writeFileSync('js/bundle.js', bundled, 'utf8');
console.log('Bundle created: ' + bundled.length + ' bytes');
