const moment = require('moment-timezone');

function formatMessage(username, text) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return {
    username,
    text,
    time: moment().tz(userTimeZone).format('h:mm a')
  };
}

module.exports = formatMessage;
