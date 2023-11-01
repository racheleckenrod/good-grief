const { DateTime } = require('luxon');

function formatMessage(username, text, userTimeZone) {
  // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // console.log(userTimeZone);
  // const utcTime = moment.utc();
  const localTime = DateTime.now().setZone(userTimeZone)
  const formattedTime = localTime.toFormat('h:mm:ss a');

  
  return {
    username,
    text,
    time: formattedTime
  };
}

module.exports = formatMessage;
