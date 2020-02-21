function findSession(sessionKey) {
  return larkcloud.redis.get(sessionKey);
}

module.exports = async function(params) {
  const { sessionKey } = params;
  const objectId = await findSession(sessionKey);

  if (!objectId) {
    console.log('error');
  }

  const user = await larkcloud.db.table('user').where({
    _id: new (larkcloud.db.ObjectId)(objectId)
  }).findOne()

  if (!user) {
    throw new Error('未找到用户');
  }
  return user;
}
