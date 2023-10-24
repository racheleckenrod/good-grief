const moment = require('moment-timezone');

function formatMessage(username, text) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcTime = moment().utc();
  
  return {
    username,
    text,
    time: moment(utcTime).tz(userTimeZone).format('h:mm a')
  };
}

module.exports = formatMessage;
