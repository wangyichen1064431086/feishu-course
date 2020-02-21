const randomBytes = require('randombytes');
const getAccessToken = require('./getAccessToken');
const constants = require('./constants');

const {
  CUSTOM_SESSION_EXPIRE
} = constants;

const LOGIN_URL = 'https://open.feishu.cn/open-apis/mina/v2/tokenLoginValidate';

async function userUpsert(user) {
  await larkcloud.db.table('user').where({ unionId: user.unionId }).upsert().set(user)
    .save();
  return larkcloud.db.table('user').where({ unionId: user.unionId }).findOne();
}

async function saveSession(objectId) {
  const sessionKey = createSessionKey();
  await larkcloud.redis.setex(sessionKey, CUSTOM_SESSION_EXPIRE, objectId);
  return sessionKey;
}

function createSessionKey() {
  return randomBytes(8).toString('hex');
}

module.exports = async function(params) {

  const { code } = params;
  const accessToken = await getAccessToken();

  const { data } = await axios({
    url: LOGIN_URL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      code,
    },
  });

  const user = {
    uid: data.data.uid,
    openId: data.data.open_id,
    unionId: data.data.union_id,
    sessionKey: data.data.session_key,
    tenantKey: data.data.tenant_key,
    employeeId: data.data.employee_id,
    tokenType: data.data.token_type,
    expiresIn: data.data.expires_in,
  };

  const userData = await userUpsert({
    ...user,
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
  });

  const customSession = await saveSession(userData._id.toString());
  return customSession;
}
