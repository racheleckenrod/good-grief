const moment = require('moment-timezone');

function formatMessage(username, text, userTimeZone) {
  // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // console.log(userTimeZone);
  // const utcTime = moment.utc();
  const localTime=  moment.tz(userTimeZone).format('h:mm:ss a');

  
  return {
    username,
    text,
    time: localTime
  };
}

module.exports = formatMessage;
