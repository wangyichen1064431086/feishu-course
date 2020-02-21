const getUserInfo = require('./getUserInfo');
const SEARCH_GROUP_URL = 'https://open.feishu.cn/open-apis/chat/v4/search';

async function searchLarkGroup(keywords, userAccessToken, pageSize) {
  const { data } = await axios({
    url: SEARCH_GROUP_URL, // MYNOTE: 请求飞书开放平台的接口
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
    params: {
      page_size: pageSize,
      query: keywords,
    },
  }).catch(e => {
    if (e.response && e.response.data) {
      console.error(JSON.stringify(e.response.data));
    } else {
      console.error(e.message);
    }
  });

  return data;
}

module.exports = async function(params) {
  const { keywords, sessionKey } = params;
  const user = await getUserInfo({ sessionKey });
  return searchLarkGroup(keywords, user.accessToken, 10);
}
