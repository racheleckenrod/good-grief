// const moment = require ("moment-timezone");
const GuestUserID = require("../models/GuestUserID");

async function generateGuestID(userTimeZone) {
    let guestID
    let userName
    // const userTimeZone = socket.handshake.query.timeZone
    console.log("generateGuestID")

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
            console.log("New guestUser created", newGuest)
            break;
        }
    }
    // console.log("guestID=", guestID)
    return { guestID, userName, userTimeZone };
}

module.exports = generateGuestID;