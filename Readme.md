# DeadCrawl.js

SEO+javascript == Undead *(An all Javascript solution)*

*Renders the page with Zombie.js and saves to file.*

# Install

    npm install dead-crawl

# Example

    var fs = require('fs');
    var DeadCrawl = require('dead-crawl');

    new DeadCrawl('http://mysite.com/#!/my/js/page'[, options])
      .zombify()
      .then(function(html) {
        fs.lstat('./my/js/page.html', function(err, stats) {
          if (err) {
            return res.send(500);
          }

          return res.send(html);
        });
      });

---

Using the middleware for Express.js

    var app = require('express')();

    app.use(DeadCrawl.middleware('http://localhost:3000'[, options]));
    // your routes
    // your static

If a `?_escaped_fragment_=` query param is provided, the middleware will check for the rendered page and stream that saved file back. Else it will render the page, save it to file, then `res.send` the HTML back to the client.

---

The `DeadCrawl` constructor can take an `options` object.

* **destroot** `String`

  root path to save rendered HTMLs. *default `.`*

* **hashbang** `String`

  your hashbang delimiter. *default `#!`*

* **postProcess(browser)** `Function`

  gives you access to the Zombie browser before it attempts to write to file.

  *This method must return a Promise and the Promise must resolve with a `String`*


## Notes

[http://www.yearofmoo.com/2012/11/angularjs-and-seo.html](http://www.yearofmoo.com/2012/11/angularjs-and-seo.html)

## License

MIT

