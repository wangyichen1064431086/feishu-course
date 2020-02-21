const moment = require('moment');
const _  = require('lodash');

const getUserInfo = require('./getUserInfo');

module.exports = async function(params) {
  const { sessionKey } = params;
  const user = await getUserInfo({ sessionKey });
  const { openId } = user;
  const today = moment().format('YYYY-MM-DD');

  const result = _.map(await larkcloud.db.table('userEvent').where({
    openId,
    startDate: { $lt: today }
  }).sort({ 'start.time_stamp': -1 }).find(), (v) => {
    return {
        ...v,
        start: {
            time_stamp: moment(v.start.time_stamp * 1000).format('YYYY-MM-DD HH:mm'),
        },
    }
  });

  return result;
}
