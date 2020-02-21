const _  = require('lodash');

module.exports = async function() {
  const totalResult = await larkcloud.db.table('shops').where().find();
  const typeArr = Object.keys(totalResult.reduce((acc, cur) => {
      const type = cur.type;
      acc[type] = true;
      return acc;
    }, {}));
  
  const randomType = ['', '', ''].map(item => typeArr[Math.floor(Math.random() * 3)]);
  const randomSkip = Math.floor(Math.random() * 200);
  const result = await Promise.all(randomType.map(type => {
      return larkcloud.db.table('shops').where({ type }).sort({ star: -1 }).skip(randomSkip).limit(30).find();
    }));

  
  const recommandList = _.range(10).map(i => {
    const res = result[i % 3 ];
    const length = res.length;
    const index = Math.floor(Math.random() * length);
    return res[index];
  });
  
  return _.filter(recommandList, (v) => {
      return !!v.price;
  });
}
