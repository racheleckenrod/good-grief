const GuestUserID = require("../models/GuestUserID");

async function generateGuestID(userTimeZone, userLang) {
    let guestID
    let userName

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
                userLang: userLang,
            });

            await newGuest.save();
            console.log("New guestUser created", newGuest)
            break;
        }
    }
    // console.log("guestID=", guestID)
    return { guestID, userName };
}

module.exports = generateGuestID;