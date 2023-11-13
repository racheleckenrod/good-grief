exports.getConsent = (req, res) => {
    console.log("from controllers getConsent")
    res.render("consent");
};

exports.setCookie = (req, res) => {
    console.log("Executing setCookie controller");

    // res.cookie('consentCookie', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000,  path: '/'  });
    console.log("consent cookie set", req.cookies);
    // res.render('/');
    res.status(200).send('Consent cookie set successfully this time.');
    
    console.log("Cookie test", req.cookies)
};

exports.getPrivacyPolicy = (req, res) => {
    res.render("privacyPolicy");
}

exports.removeCookies = async (req, res) => {
    try {
        // Asynchronously destroy the session
    await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
        res.clearCookie('consentCookie');
        res.clearCookie('guestID');
        res.clearCookie('connect.sid', { path: '/' }); // Specify the path for session cookie
        res.redirect("/consent");
    } catch (error) {
        console.error('Error destroying session:', error);

        res.status(500).send("Internal Server Error")
    }
    
};

