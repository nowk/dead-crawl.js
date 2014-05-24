[![Build Status](https://travis-ci.org/nowk/dead-crawl.js.svg?branch=master)](https://travis-ci.org/nowk/dead-crawl.js)
[![Code Climate](https://codeclimate.com/github/nowk/dead-crawl.js.png)](https://codeclimate.com/github/nowk/dead-crawl.js)

# DeadCrawl.js

SEO+javascript == Undead *(An Express.js middleware)*

*Renders the page with Zombie.js and saves to file.*

# Install

    npm install dead-crawl

# Example

    var app = require('express')();
    var deadCrawl = require('dead-crawl').deadCrawl;

    app.use(deadCrawl());
    app.use(routes);
    app.use(express.static(...));


---

You may alter your hashbang delimiter by passing it in as an option.

    app.use(deadCrawl({hashbang: "#"}));

Will rebuild the url with that vs. the default `#!`.  
eg. `http://example.com?_escaped_fragment_=/js/page` => `http://example.com/#/js/page`

`null` or `''` will omit the hashbang entirely.

---

To change the destination root of the saved html files, supply a `destRoot` option.

    app.use(deadCrawl({destRoot: __dirname+'/public/crawled'}));

The default is `destRoot` is `.`;

---

To run process before the `html` gets written to file you can supply a `beforeWrite` option with an `Array` of functions.

    function waitForMetaDescription(browser, _, next) {
      var i = 0;
      var waiting = setInterval(function() {
        var desc = browser.query('meta[name="description"]')
          .attributes
          .content
          ._nodeValue;

        i++;
        if (!!desc || i > 10) {
          next();
        }
      }, 100);
    }

    function removeNgApp(browser, next) {
      next(browser.html().replace(/\sng\-app="\w+"/, ''));
    }

    var opts = {
      destRoot: __dirname+'/public/crawls',
      beforeWriter: [
        waitForMetaDescription,
        removeNgApp
      ]
    };

    app.use(deadCrawl(opts));

The first function will always be provided with **3** arguments: `browser`, `null`, `next`.

The last function (before the writer) needs to `next` any processed `html` (or `string`) to be written to file. Else `browser.html()` will be written to file.

*Information on using `next` to pass arguments can be viewed at [WalkingDead.js](https://github.com/nowk/walking-dead.js).*

---

Once a page has been crawled, any further requests `(?_escaped_fragment_=)` will send back the saved html file. If your page is dynamic you will have to ensure you sweep out the cached files when needed.

---

## Notes

[http://www.yearofmoo.com/2012/11/angularjs-and-seo.html](http://www.yearofmoo.com/2012/11/angularjs-and-seo.html)

## License

MIT

