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

