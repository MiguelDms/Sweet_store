const gulp = require("gulp");
const rename = require("gulp-rename");
const imageMin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const sourceMaps = require("gulp-sourcemaps");
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const imageminMozjpeg = require('imagemin-mozjpeg');
const uglifycss = require('gulp-uglifycss');


/* let jsSrc = "about.js"; */
let jsFolder = "src/js/";
let jsDist = "dist/js/";
let jsWatch = "src/js/**/*";
let jsFiles = ["main.js", "about.js"]; //compilar todos os ficheiros js numa array

let styleSrc = "src/css/*.css";
let styleDist = "./dist/css/";
let styleWatch = "src/css/**/*.css";

let htmlSrc = "src/**/*.html";
let htmlDist = "dist/";
let htmlWatch = "src/**/*.html";


// copy html

gulp.task('copyHtml', function (done) {
    gulp.src(htmlSrc)
        .pipe(gulp.dest(htmlDist));
    done();
})

// optimize images

gulp.task('imageMin', function (done) {
    gulp.src('C:/Users/Utilizador/Desktop/Web design/Templates/Full websites/Grandmas sweets/src/images/**/*')
        .pipe(imageMin([
            //jpg lossless
            imageMin.jpegtran({
                progressive: false
            }),
            //jpg very light lossy, use vs jpegtran
            imageminMozjpeg({
                quality: 70
            })
        ]))
        .pipe(gulp.dest('C:/Users/Utilizador/Desktop/Web design/Templates/Full websites/Grandmas sweets/dist/images/'));
    done();
})

gulp.task("style", function (done) {
    gulp
        .src(styleSrc)
        //sourcemap init
        .pipe(sourceMaps.init())
        .pipe(uglifycss({
            "maxLineLen": 80,
            "uglyComments": true
        }))
        //rename
        /* .pipe(
            rename({
                suffix: ".min"
            })
        ) */
        //sourcemap write, antes do dest. Vamos abrir o ficheiro base e não a versão minificada
        .pipe(sourceMaps.write("./"))
        .pipe(gulp.dest(styleDist))
    done();
});

gulp.task("js", function (done) {
    /* gulp.src(jsSrc)
        .pipe(gulp.dest(jsDist)); */



    jsFiles.map(function (entry) {

        //browserify --- IMPORTA OS MODULOS
        return browserify({
                entries: [jsFolder + entry]
            })

            // transform babelify -- es6 para es5 ----- tive de definir no package.json a dependencia do babelify a usar 
            .transform(babelify, {
                presets: ["@babel/preset-env"]
            })

            // bundle já está incluido no gulp
            .bundle()

            // vem do vinyl-source-stream no package.json
            .pipe(source(entry))

            //rename.min
            .pipe(
                rename({
                    suffix: ".min"
                })
            )

            //buffer
            .pipe(buffer())

            // vai fazer sourcemap aos ficheiros, e vai juntar todos num, com o loadMaps: true
            .pipe(sourceMaps.init({
                loadMaps: true
            }))
            .pipe(uglify() //comprime o js
            )

            // escreve e diz que estará no mesmo directorio
            .pipe(sourceMaps.write('./'))

            .pipe(gulp.dest(jsDist))

    });

    done();
});

// DEFAULT FUNCTION
gulp.task("default", gulp.series("copyHtml", "js", "style"), function () {});

//GULP WATCH

gulp.task(
    "watch",
    gulp.series("default", function () {
        gulp.watch(htmlWatch, gulp.series("copyHtml"));
        gulp.watch(jsWatch, gulp.series("js"));
        gulp.watch(styleWatch, gulp.series("style"));
    })

);