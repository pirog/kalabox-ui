# Kalabox 2
===============

## AngularJS modules

Kalabox takes a modular approach by grouping files by functionality vs by type. Modules files, including partials and tests, belong in their own directory: `src/modules/<module name>`.

To add a module:

- Create the module directory and js file in `src/modules`
- Add the file as a script source in `index.html`
- Add the module dependency at the top of `src/app.js`

## Node modules
Angular services are created to wrap commonly used node modules. The `nodewrappers` module is the place to put these unless they would only be used for a custom module, in which case, the service would belong in that module.

Note that some JS libraries like `lodash` will not work correctly in node-webkit when included in a `<script>` tag. It does work when loaded in as a nodejs module however, so in order to use lodash, you will need to inject it.

## Running the app
First run `npm install` and then run `grunt`. This will run the app from the source directory. Grunt will watch `src/css/style.less` and compile it as it is updated.

Grunt will take care of the bower dependencies so no need to run `bower install`.

## Building
`grunt build` will copy the `src` directory to a `generated` directory and create node webkit binaries for each OS in `dist/Kalabox`.

If you would like to test the build from the exact codebase it was build from, run `nw .` from the `generated` directory.

## Testing
By default, the protractor config is setup to look for all tests defined in `tests/e2e`,
as well as tests defined in modules.
```
cd test/
protractor protractor.conf.js
```
