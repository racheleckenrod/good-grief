const moment = require('moment-timezone');

function formatMessage(username, text) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(userTimeZone);
  const utcTime = moment.utc();
  const localTime=  moment(utcTime).tz(userTimeZone).format('h:mm a');
  const LOCALTIME = now.local()
  console.log(utcTime, localTime, LOCALTIME);
  
  return {
    username,
    text,
    time: localTime
  };
}

module.exports = formatMessage;
