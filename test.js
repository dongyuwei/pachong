const assert = require('assert');
const Nightmare = require('nightmare'),
    nightmare = Nightmare({
        show: true
    });

async function run() {
    const links = await nightmare
        .goto('https://www.baidu.com/')
        .type('#kw', 'github nightmare')
        .click('#su')
        .wait('.result.c-container')
        .evaluate(function() {
            const urls = Array.from($('.result.c-container a')).map(function(el) {
                return el.href
            });
            return urls;
        });

    await nightmare.end();
    console.log(links)
    assert.equal(links.length, 53);
};

run();