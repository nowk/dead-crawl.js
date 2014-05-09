# DeadCrawl.js

SEO+javascript == Undead *(An all Javascript solution)*

*Renders the page with Zombie.js and saves to file.*

# Install

    npm install dead-crawl

# Example

    var fs = require('fs');
    var DeadCrawl = require('dead-crawl');

    new DeadCrawl('http://mysite.com/#!/my/js/page')
      .zombify()
      .then(DeadCrawl.writer())
      .done(function(html) {
        fs.exists('./my/js/page.html', function(exists) {
          if (!exists) {
            return res.send(500);
          }

          return res.send(html);
        });
      });

---

You can add promises before writing (or not) to do additional processing or waiting.

    new DeadCrawl('http://mysite.com/#!/my/js/page')
      .zombify()
      .then(doSomething())
      .then(thenSomethingElse())
      .then(DeadCrawl.writer())
      .done(function(html) {
        fs.exists('./my/js/page.html', function(exists) {
          if (!exists) {
            return res.send(500);
          }

          return res.send(html);
        });
      });


The first promise will be resolved with the instance of the current `browser`, and it **must** continue to resolve the `browser`.

    function doSomething(browser) {
      var d = Q.defer();
      d.resolve(browser);
      return d.promise;
    }

If you plan to run a process against `browser.html()` and want to write that processed html to `DeadCrawl.writer()`, then you need to resolve that as part of an array with `browser`. *You must pass `browser` to `DeadCrawl.writer()`*

    function thenSomethingElse(browser) {
      var html = browser.html().replace(/\sng-app="\w+"/, '');
      return [browser, html];
    }

If the step is not async, you can just `return`, you don't have to provide a promise.

---

`DeadCrawl.writer()` will resolve the `browser.html()` or the passed in `html` (view above).

---

Using the middleware for Express.js

    var app = require('express')();

    function crawl(url, opts, res) {
      new DeadCrawl(url)
        .zombify()
        .then(DeadCrawl.writer(opts))
        .done(function(html) {
          res.send(html);
        });
    }

    app.use(DeadCrawl.middleware(crawl, {destRoot: __dirname+'/public/crawls'}));
    app.use(routes);
    app.use(express.static(...));



## Notes

[http://www.yearofmoo.com/2012/11/angularjs-and-seo.html](http://www.yearofmoo.com/2012/11/angularjs-and-seo.html)

## License

MIT

