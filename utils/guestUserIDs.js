const moment = require ("moment-timezone");
const GuestUserID = require("../models/GuestUserID");

async function generateGuestID() {
    let guestID
    let userName
    console.log("generateGuestID")
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    while (true) {
        guestID = Math.floor(Math.random() * 100000).toString();
        userName = `guestUserID_${guestID}`;

        const existingGuest = await GuestUserID.findOne({ GuestUserID: guestID });

        if (!existingGuest) {

            const newGuest = GuestUserID({ 
                guestUserID: guestID,
                userName: userName,
                timezone: userTimeZone,
            });

            await newGuest.save();
            break;
        }
    }
    return { guestID, userName, timezone: userTimeZone };
}

module.exports = generateGuestID;