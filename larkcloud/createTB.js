const moment = require('moment');
const getUserInfo = require('./getUserInfo');
const getAccessToken = require('./getAccessToken');

const SEARCH_GROUP_MEMBER_URL = 'https://open.feishu.cn/open-apis/chat/v4/members';
const CREATE_CALENDAR_URL = 'https://open.feishu.cn/open-apis/calendar/v3/calendars';

function getTimeRange(date) {
  return {
      start: {
          time_stamp: moment(date).startOf('days').add('18', 'hours').unix(),
      },
      end: {
          time_stamp: moment(date).startOf('days').add('19', 'hours').unix(),
      },
  };
}

async function getGroupMember(chatId, userAccessToken, pageSize, pageToken) {
  const { data } = await axios({
    url: SEARCH_GROUP_MEMBER_URL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userAccessToken}`
    },
    params: {
      chat_id: chatId,
    },
  }).catch(e => {
    if (e.response && e.response.data) {
      console.error(JSON.stringify(e.response.data));
    } else {
      console.error(e.message);
    }
  });

  return {
    chatId: data.data.chat_id,
    hasMore: data.data.has_more,
    members: data.data.members.map(member => ({ openId: member.open_id, userId: member.user_id, name: member.name })),
    pageToken: data.data.page_token,
    rawData: data.data
  };
}

async function createHistory(
  eventId,
  chatId,
  chatName, shopName, address, start, end
) {
  return larkcloud.db.table('history').save({
    eventId,
    chatId,
    chatName,
    shopName,
    address,
    start,
    end
  });
}

async function createCalendar(summary, opts = {}) {
  const {
    isPrivate = false,
    description,
    defaultAccessRole = 'reader',
  } = opts;

  const accessToken = await getAccessToken();
  const { data } = await axios({
    url: CREATE_CALENDAR_URL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      summary,
      is_private: isPrivate,
      description,
      default_access_role: defaultAccessRole,
    },
  }).catch(e => {
    if (e.response && e.response.data) {
      console.error(JSON.stringify(e.response.data));
    } else {
      console.error(e.message);
    }

  });

  return {
    id: data.data.id,
    summary: data.data.summary,
    description: data.data.description,
    defaultAccessRole: data.data.default_access_role,
  };
}

async function createEvent(
  userAccessToken,
  chatId,
  chatName,
  summary,
  start,
  end,
  opts
) {
  const relation = await larkcloud.db.table('groupCalendar').where({ chatId }).findOne();
  let calendarId = '';
  const timeRange = getTimeRange(start.time_stamp);
  start = timeRange.start;
  end = timeRange.end;

  if (!relation) {
    const calendarRes = await createCalendar('日历', { isPrivate: true, });
    await larkcloud.db.table('groupCalendar').save({
      chatId,
      chatName,
      calendarId: calendarRes.id
    });

    calendarId = calendarRes.id;
  } else {
    calendarId = relation.calendarId;
  }

  const members = (await getGroupMember(chatId, userAccessToken, 500)).rawData.members;
  const URL = `https://open.feishu.cn/open-apis/calendar/v3/calendars/${calendarId}/events`;

  const TOKEN = await getAccessToken();
  const requestBody = {
    summary,
    description: `${opts.shopName || ''} ${opts.address || ''}`,
    start, 
    end,
    attendees: members.map(member => {
      return {
        open_id: member.open_id,
        display_name: member.name
      }
    }),
  };
  const { data } = await axios({
    url: URL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`
    },
    data: requestBody
  });


  const item = data.data;

  await createHistory(item.id, chatId, chatName, opts.shopName || '', opts.address || '', start, end);

  let startDate;

  if (item.start.date) {
    startDate = moment(item.start.date).format('YYYY-MM-DD');
  }

  if (item.start.time_stamp) {
    startDate = moment(item.start.time_stamp * 1000).format('YYYY-MM-DD');
  }

  await larkcloud.db.table('userEvent').save(item.attendees.map(a => {
    return {
      openId: a.open_id,
      chatName: chatName,
      shopName: opts.shopName,
      address: opts.address,
      summary: item.summary,
      eventId: item.id,
      start: item.start,
      end: item.end,
      startDate: startDate,
    }
  }));

  return {
    id: item.id,
    summary: item.summary,
    description: item.description,
    visibility: item.visibility,
    start: {
      date: item.start.date,
      timeStamp: item.start.time_stamp,
      timeZone: item.start.time_zone,
    },
    end: {
      date: item.end.date, // YYYY-MM-DD
      timeStamp: item.end.time_stamp,
      timeZone: item.end.time_zone,
    },
    attendees: item.attendees.map(a => ({
      openId: a.open_id,
      employeeId: a.employee_id,
      displayName: a.display_name
    }))
  }
}

module.exports = async function(params) {
  const { summary = '团建', description, start, end, shopName, address, chatId, chatName, sessionKey } = params;
  const user = await getUserInfo({ sessionKey });

  return createEvent(user.accessToken, chatId, chatName, summary, start, end, {
    description,
    address,
    shopName,
  });
}
