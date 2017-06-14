const Nightmare = require('nightmare');
const fs = require('fs');
const nightmare = Nightmare({
    show: true,
    typeInterval: 1
});

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

if (fs.existsSync('./config.json')) {
    const config = require('./config.json');
    rl.question('please input your search keyword(such as 架构师):', (keyword) => {
        rl.close();
        loginLinkedin(config.email, config.password, keyword);

    });
} else {
    rl.question('please input your linkedin email:', (email) => {
        console.log(`your linkedin email is: ${email}`);

        rl.question('please input your linkedin password:', (password) => {
            fs.writeFileSync('./config.json', JSON.stringify({
                email: email,
                password: password
            }, null, 3));

            rl.question('please input your search keyword(such as 架构师):', (keyword) => {
                rl.close();
                loginLinkedin(email, password, keyword);

            });
        });
    });
}

function loginLinkedin(email, password, keyword) {
    console.log('start to login linkedin ...');
    nightmare
        .goto('https://www.linkedin.com/')
        .type('#login-email', email)
        .type('#login-password', password)
        .click('#login-submit')
        .wait('.type-ahead-input-container')
        .type('.type-ahead-input-container input', keyword)
        .wait(10)
        .click('#nav-search-controls-wormhole button')
        .wait('.search-result__result-link')
        .evaluate(function() {
            const urls = Array.from($('.search-result__result-link')).map(function(el) {
                return el.href
            });
            return urls;
        })
        .then((urls) => {
            urls.reduce(function(accumulator, url) {
                return accumulator.then(function(results) {
                    return nightmare
                        .goto(url)
                        .wait('.pv-top-card-section__name')
                        .exists('.connect.top-card-action')
                        .then((notConnected) => {
                            if (!notConnected) {
                                nightmare
                                    .wait('button[data-control-name="contact_see_more"]')
                                    .click('button[data-control-name="contact_see_more"]')
                                    .evaluate(function() {
                                        const nameAndEamil =  {
                                        	name: $('.pv-top-card-section__name').text(),
                                        	email: $('.pv-contact-info__contact-type.ci-email .pv-contact-info__contact-item').text()
                                        };
                                        console.log(nameAndEamil);
                                        return nameAndEamil;
                                    })
                            } else {
                                return {}
                            }
                        })
                });
            }, Promise.resolve([])).then(function(results) {
                console.dir(results);
                nightmare.end();
            });
        })
        .catch(function(error) {
            console.error('Search failed:', error);
        });
}