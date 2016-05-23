'use strict';

const stylelint    = require('stylelint');
const sass         = require('gulp-sass');
const prefix       = require('gulp-autoprefixer');
const gulp         = require('gulp');
const runSequence  = require('run-sequence');
const markdown     = require('gulp-markdown');
const rename       = require('gulp-rename');
const sprites      = require('gulp-svg-symbols');
const svgo         = require('gulp-svgo');
const globby       = require('globby');
const through2     = require('through2');
const path         = require('path');
const bSync        = require('browser-sync');
const fs           = require('fs');
const merge        = require('merge2');

/*
* Metalsmith dependencies
*/
const Metalsmith        = require('metalsmith');
const inplace           = require('metalsmith-in-place');
const layouts           = require('metalsmith-layouts');
const handlebars        = require('handlebars');
const handlebarsLayout  = require('handlebars-layouts');
const markdownms        = require('metalsmith-markdown');
const permalinks        = require('metalsmith-permalinks');
const navigation        = require('metalsmith-navigation');
const codehighlight     = require('metalsmith-code-highlight');
const matter            = require('gray-matter');
const requiredir        = require('require-dir');


const styleFiles = 'src/**/*.scss';
const site = {};
site.components = globby
  .sync('src/**/README.md')
  .map(el => {
    el = el.replace('README.md', '').replace('src/', '');
    var parts = el.split('/');
    return {
      url: el,
      name: capitalizeFirstLetter(parts[parts.length - 2])
    }
  });

gulp.task('styles:lint', () => {
  return stylelint.lint({
    files: [styleFiles],
    syntax: 'scss',
    formatter: "string"
  })
  .then(data => { if(data.errored) { console.error(data.output); } })
  .catch(err => console.error(err.stack));
});

gulp.task('styles', () => {
  return gulp.src(styleFiles)
    .pipe(sass())
    .pipe(prefix())
    .pipe(gulp.dest('dist/css'));
});


gulp.task('dev', (done) => {
  gulp.watch([styleFiles], ['styles:lint', 'styles']);
  gulp.watch(['src/**/samples/**/*.html','src/**/README.md'], ['doc']);
  runSequence('copy-assets', 'icons', 'styles:lint', 'styles', 'doc', 'serve', done);
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

gulp.task('serve', function(done) {
  bSync.init({
    server: {
      baseDir: "./dist",
      open: false
    }
  });
  done();
});

markdown.marked.Renderer.prototype.table = function(header, body) {
  return '<table class="table">\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};


gulp.task('doc', function(taskDone) {
  /*
  * setup handlebars
  */
  handlebars.registerHelper(handlebarsLayout(handlebars));
  const layoutPartials = requiredir('./docs/_templates/layouts');
  const templatePartials = requiredir('./docs/_templates/partials');
  const hbsPartials = Object.assign(layoutPartials, templatePartials);
  Object.keys(hbsPartials).forEach((key) => handlebars.registerPartial(key, hbsPartials[key]));
  const helpers = requiredir('./docs/_templates/helpers');
  Object.keys(helpers).forEach((key) => handlebars.registerHelper(key, helpers[key]));

  Metalsmith('./')
    .source('./docs/_pages/')
    .clean(false)
    .destination('dist')
    .use((files, metalsmith, done) => {
      /*
      * components Plugin
      */
      var componentFiles = {};
      return globby('**/README.md', {
        cwd: path.resolve(metalsmith._directory, 'src')
      })
      .then((componentSources) => {
        componentSources.map((component) => {
          var componentFile = {
            title: capitalizeFirstLetter(path.dirname(component))
          };

          /*
          * read README.md file and and fsStats
          */
          const parsed = matter(fs.readFileSync(path.resolve(metalsmith._directory, 'src', component)).toString());
          componentFile.stats = fs.statSync(path.resolve(metalsmith._directory, 'src', component));
          componentFile.data = parsed.data;
          componentFile.type = 'component';
          componentFile.layout = 'component_overview.hbs';
          var content = parsed.content;

          /*
          * read Samples and append to content
          */
          const samples = globby
            .sync('**.*', {cwd: path.resolve(metalsmith._directory, 'src', path.dirname(component), 'samples')})

          samples.map((sample) => {
            var ext = path.extname(sample);
            var fileContent = fs.readFileSync(path.resolve(metalsmith._directory, 'src', path.dirname(component), 'samples', sample)).toString();

            content+= `\n\n${fileContent}\n`;
            if (ext === '.html') {
              componentFile.samples = componentFile.samples || [];
              componentFile.samples.push({
                name: sample,
                code: fileContent
              });
              content+= `\n~~~html\n${fileContent}\n~~~\n`;
            }
          });

          /*
          * Map content
          */
          componentFile.contents = new Buffer(content);
          componentFiles['components/' + path.dirname(component) + '.md'] = componentFile;
        });
        return true;
      })
      .then(() => {
        files = Object.assign(files, componentFiles);
        return true;
      })
      .then(() => {
        done();
      });
    })
    .use(inplace({
      engine: 'handlebars',
      partials: './docs/_templates/partials/',
    }))
    .use(markdownms())
    .use(codehighlight())
    .use((files, metalsmith, done) => {
      Object.keys(files).forEach((key) => files[key].name = path.basename(key, '.html'));
      done();
    })
    .use(permalinks({
      pattern: 'doc/:name',

      linksets: [{
        match: { type: 'component' },
        pattern: 'doc/components/:name'
      }]
    }))
    .use(navigation({
      componentsNav: {
        includeDirs: true,
        filterProperty: 'type',
        filterValue: 'component'
      }
    }, {
      navListProperty: 'nav',
      permalinks: false
    }))
    .use((files, metalsmith, done) => {
      /*
      * navigation plugin being stupid, flattening things
      */
      const components = metalsmith._metadata.nav.componentsNav[0].children[0].children;
      let componentsNav = [];
      components.forEach((dir) => {
        componentsNav.push(dir.children[0])
      })
      metalsmith._metadata.nav.componentsNav = componentsNav;
      done();
    })
    .use(layouts({
      engine: 'handlebars',
      directory: './docs/_templates/layouts',
      default: 'default.hbs'
    }))
    .build((err) => {
      if (err) {
        throw new Error(err);
      }
      taskDone();
    });
});

gulp.task('copy-assets', function() {
  return merge(
    gulp.src('assets/**/*')
      .pipe(gulp.dest('dist/assets')),
    gulp.src('docs/_assets/**/*')
      .pipe(gulp.dest('dist/doc')));
});

gulp.task('icons', function() {
  return gulp.src('assets/icons/**/*.svg')
    .pipe(svgo({
      plugins: [
        { removeAttrs: { attrs: 'fill' } }
      ]
    }))
    .pipe(rename(function(path) {
      path.basename = path.basename.toLowerCase();
      path.basename = path.basename.replace(/icons_file_00._/, '');
      path.basename = path.basename.replace(/_/g, '-');
      path.basename = path.basename.replace(/[^\w\s-]/gi, '');
    }))
    .pipe(gulp.dest('dist/assets/images/icons'))
    .pipe(sprites({ templates: ['default-svg']}))
    .pipe(gulp.dest('dist/assets/images'));
})
