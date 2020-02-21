const constants = require('./constants');

const {
  APP_ID,
  APP_SECRET,
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRE,
} = constants;

const ACCESS_URL = 'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/';

async function getAccessTokenFromLark() {
  const { data } = await axios({
    url: ACCESS_URL,
    method: 'POST',
    data: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    },
  });

  return data.app_access_token;
}

function saveToken(key, value, expire) {
  return larkcloud.redis.setex(key, expire, value);
}


module.exports = async function getAccessToken() {
  const existsToken = await larkcloud.redis.get(ACCESS_TOKEN_KEY);

  if (!existsToken) {
    const token = await getAccessTokenFromLark();

    saveToken(ACCESS_TOKEN_KEY, token, ACCESS_TOKEN_EXPIRE).catch(e => console.error(e.message));

    return token;
  }

  return existsToken;
}
