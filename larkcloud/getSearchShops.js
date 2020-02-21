async function search(opts, page, pageSize) {
  const skip = (page - 1) * pageSize;
  let condition = {};
  let sort = { star: -1 };

  if (opts.type) {
    condition.type = new RegExp(`${opts.type}`);
  }

  if (opts.price) {
    condition.price = { [`$${opts.priceType || 'lte'}`]: opts.price }
    sort = { price: -1 , star: -1 }
  }

  if (opts.keywords) {
    condition = Object.assign({}, {
      $or: [{
        type: new RegExp(`${opts.keywords}`),
      }, {
        name: new RegExp(`${opts.keywords}`),
      }, {
        food_type: new RegExp(`${opts.keywords}`),
      }, {
        detail_address: new RegExp(`${opts.keywords}`)
      }]
    });
  }

  const shops = await larkcloud.db.table('shops').where({ $and: [ condition, { price: { $ne: '' } } ]}).limit(+pageSize || 10).skip(skip).sort(sort).find();
  return shops;
}

module.exports = async function(params) {
  const { keywords, page = 1, pageSize = 20, price, type, priceType } = params;

  const shops = await search({
      keywords,
      price,
      type,
      priceType
    }, page, pageSize);
  return _.filter(shops, (v) => {
      return !!v.price
  });
}
