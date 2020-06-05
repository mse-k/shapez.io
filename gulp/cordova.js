const path = require("path");
const fs = require("fs");
const buildUtils = require("./buildutils");

export function gulptasksCordova($, gulp, buildFolder) {
    const cdvRes = path.join("..", "..", "res");

    // Cleans up the app assets
    // Removes all temporary folders used while optimizing the assets
    gulp.task("cleanupAppAssetsBuiltFolder", () => {
        return gulp.src(path.join(cdvRes, "built"), { read: false }).pipe($.clean({ force: true }));
    });

    // Optimizes all built assets
    gulp.task("optimizeBuiltAppAssets", () => {
        return gulp
            .src(path.join(cdvRes, "built", "**", "*.png"))
            .pipe($.flatten())
            .pipe($.imagemin([$.imagemin.optipng({ optimizationLevel: 1 })]))
            .pipe(gulp.dest(path.join(cdvRes, "built")));
    });

    // Scales the icon resources
    gulp.task("scaleIconIos", async () => {
        const sizes = [
            180,
            60,
            120,
            76,
            152,
            40,
            80,
            57,
            114,
            72,
            144,
            167,
            29,
            58,
            87,
            50,
            100,
            167,
            20,
            1024,
            24,
            48,
            55,
            172,
            196,
        ];
        for (let i = 0; i < sizes.length; ++i) {
            const size = sizes[i];
            console.log("Scaling icon to", size, "x", size);
            const img = await $.jimp.read(path.join(cdvRes, "ios", "icon-prefab.png"));
            await img.resize(size, size).write(path.join(cdvRes, "built", "ios", "icon@" + size + ".png"));
        }
    });

    gulp.task("copyOtherIosResources", () => {
        return gulp
            .src(path.join(cdvRes, "ios", "splash-prefab.png"))
            .pipe($.rename("Default@2x~universal~anyany.png"))
            .pipe(gulp.dest(path.join(cdvRes, "built", "ios")));
    });

    gulp.task("prepareIosRes", ["scaleIconIos", "copyOtherIosResources"]);

    gulp.task("copyAndroidResources", () => {
        return gulp
            .src(path.join(cdvRes, "android", "**", "*.*"))
            .pipe(gulp.dest(path.join(cdvRes, "built", "android")));
    });

    gulp.task("prepareAndroidRes", ["copyAndroidResources"]);

    gulp.task("prepareCordovaAssets", cb => {
        return $.sequence(
            "cleanupAppAssetsBuiltFolder",
            ["prepareIosRes", "prepareAndroidRes"],
            "optimizeBuiltAppAssets"
        )(cb);
    });

    // Patches the config.xml by replacing the app id to app_beta

    gulp.task("patchConfigXML", () => {
        const configUrl = path.join("..", "..", "config.xml");
        let configContent = fs.readFileSync(configUrl).toString();
        const version = buildUtils.getVersion();
        configContent = configContent.replace("%VERSION%", version);
        configContent = configContent.replace(' id="io.shapez.app" ', ' id="io.shapez.app_beta" ');
        configContent = configContent.replace("<name>Shapez.io</name>", "<name>Shapez.io BETA</name>");
        fs.writeFileSync(configUrl, configContent);
    });

    gulp.task("patchConfigXMLChangeStagingToProd", () => {
        const configUrl = path.join("..", "..", "config.xml");
        let configContent = fs.readFileSync(configUrl).toString();
        configContent = configContent.replace(' id="io.shapez.app_beta" ', ' id="io.shapez.app" ');
        configContent = configContent.replace("<name>Shapez.io BETA</name>", "<name>Shapez.io</name>");
        fs.writeFileSync(configUrl, configContent);
    });

    // Triggers a new build on phonegap
    gulp.task("triggerPhonegapBuild", () => {
        return gulp
            .src("src/html/", { dot: false })
            .pipe(
                $.phonegapBuild({
                    isRepository: true,
                    appId: "3339820",
                    platforms: ["android", "ios"],
                    user: {
                        token: process.env.SHAPEZ_CLI_PHONEGAP_KEY,
                    },
                })
            )
            .pipe(
                $.phonegapBuild({
                    isRepository: true,
                    appId: "3537816",
                    platforms: ["android", "ios"],
                    user: {
                        token: process.env.SHAPEZ_CLI_PHONEGAP_KEY,
                    },
                })
            );
    });

    // gulp.task("pushToStagingRepo", (cb) => {
    //     var cmd = spawn('../push-pgb.sh', ['https://TOKEN@github.com/tobspr/shapezapp-cordova-buildslave.git'],
    //         { stdio: 'inherit', stdout: 'inherit', stderr: 'inherit', shell: true });
    //     cmd.on('close', function (code) {
    //         console.log('push staging exited with code ' + code + " / " + cmd.stdout + " / " + cmd.stderr);
    //         cb(code);
    //     });

    // });

    // gulp.task("pushToProdRepo", (cb) => {
    //     var cmd = spawn('../push-pgb.sh', ['https://TOKEN@github.com/tobspr/shapezapp-cordova-buildslave-release.git'],
    //         { stdio: 'inherit', stdout: 'inherit', stderr: 'inherit', shell: true });
    //     cmd.on('close', function (code) {
    //         console.log('push prod exited with code ' + code + " / " + cmd.stdout + " / " + cmd.stderr);
    //         cb(code);
    //     });
    // });
}

module.exports = {
    gulptasksCordova,
};
