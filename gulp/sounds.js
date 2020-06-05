const path = require("path");
const audiosprite = require("gulp-audiosprite");

function gulptasksSounds($, gulp, buildFolder) {
    // Gather some basic infos
    const soundsDir = path.join("..", "res_raw", "sounds");
    const builtSoundsDir = path.join("..", "res_built", "sounds");

    gulp.task("sounds.clear", () => {
        return gulp.src(builtSoundsDir).pipe($.clean({ force: true }));
    });

    const filters = ["volume=0.2"];

    const fileCache = new $.cache.Cache({
        cacheDirName: "shapezio-precompiled-sounds",
    });

    // Encodes the game music
    gulp.task("sounds.music", () => {
        return gulp
            .src([path.join(soundsDir, "music", "**", "*.wav"), path.join(soundsDir, "music", "**", "*.mp3")])
            .pipe($.plumber())
            .pipe(
                $.cache(
                    $.fluentFfmpeg("mp3", function (cmd) {
                        return cmd
                            .audioBitrate(48)
                            .audioChannels(1)
                            .audioFrequency(22050)
                            .audioCodec("libmp3lame")
                            .audioFilters(["volume=0.3"]);
                    }),
                    {
                        name: "music",
                        fileCache,
                    }
                )
            )
            .pipe(gulp.dest(path.join(builtSoundsDir, "music")));
    });

    // Encodes the ui sounds
    gulp.task("sounds.sfxGenerateSprites", () => {
        return gulp
            .src([path.join(soundsDir, "sfx", "**", "*.wav"), path.join(soundsDir, "sfx", "**", "*.mp3")])
            .pipe($.plumber())
            .pipe(
                audiosprite({
                    format: "howler",
                    output: "sfx",
                    gap: 0.1,
                    export: "mp3",
                })
            )
            .pipe(gulp.dest(path.join(builtSoundsDir)));
    });
    gulp.task("sounds.sfxOptimize", () => {
        return gulp
            .src([path.join(builtSoundsDir, "sfx.mp3")])
            .pipe($.plumber())
            .pipe(
                $.fluentFfmpeg("mp3", function (cmd) {
                    return cmd
                        .audioBitrate(128)
                        .audioChannels(1)
                        .audioFrequency(22050)
                        .audioCodec("libmp3lame")
                        .audioFilters(filters);
                })
            )
            .pipe(gulp.dest(path.join(builtSoundsDir)));
    });
    gulp.task("sounds.sfxCopyAtlas", () => {
        return gulp
            .src([path.join(builtSoundsDir, "sfx.json")])
            .pipe(gulp.dest(path.join(__dirname, "..", "src", "js", "built-temp")));
    });

    gulp.task(
        "sounds.sfx",
        $.sequence("sounds.sfxGenerateSprites", "sounds.sfxOptimize", "sounds.sfxCopyAtlas")
    );

    gulp.task("sounds.copy", () => {
        return gulp
            .src(path.join(builtSoundsDir, "**", "*.mp3"))
            .pipe($.plumber())
            .pipe($.cached("sounds.copy"))
            .pipe(gulp.dest(path.join(buildFolder, "res", "sounds")));
    });

    gulp.task("sounds.buildall", cb => $.multiProcess(["sounds.music", "sounds.sfx"], cb, true));

    gulp.task("sounds.fullbuild", cb => $.sequence("sounds.clear", "sounds.buildall", "sounds.copy")(cb));
    gulp.task("sounds.dev", cb => $.sequence("sounds.buildall", "sounds.copy")(cb));
}

module.exports = {
    gulptasksSounds,
};
