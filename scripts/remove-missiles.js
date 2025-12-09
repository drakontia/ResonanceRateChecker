const fs = require('fs');
const path = require('path');

const tradeDbPath = path.join(__dirname, '../public/db/trade_db.json');
const outputPath = path.join(__dirname, '../public/db/trade_db_no_missiles.json');

const data = JSON.parse(fs.readFileSync(tradeDbPath, 'utf8'));
const filtered = data.filter(item => item.goods_jp !== 'ミサイル');

fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));

console.log(`元のデータ: ${data.length}件`);
console.log(`ミサイル除外後: ${filtered.length}件`);
console.log(`削除されたミサイル: ${data.length - filtered.length}件`);
console.log(`\n保存先: ${outputPath}`);
