// const moment = require('moment-timezone');

function formatMessage(username, text, userTimeZone, userLang) {
  // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // console.log(userTimeZone);
  // const utcTime = moment.utc();
  // const localTime=  moment.tz(userTimeZone).format('h:mm:ss a');
  const postingTime = new Date();
  const localTime = postingTime.toLocaleString( userLang, {timeZone: userTimeZone } )

  
  return {
    username,
    text,
    time: localTime
  };
}

module.exports = formatMessage;
