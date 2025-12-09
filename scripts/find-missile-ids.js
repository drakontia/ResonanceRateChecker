const fs = require('fs');
const path = require('path');

const tradeDbPath = path.join(__dirname, '../public/db/trade_db.json');
const data = JSON.parse(fs.readFileSync(tradeDbPath, 'utf8'));

const missileIds = data
  .filter(item => item.goods_jp === 'タラ')
  .map(item => item.id);

console.log('ミサイルのID一覧:');
console.log(missileIds);
console.log(`\n合計: ${missileIds.length}件`);
