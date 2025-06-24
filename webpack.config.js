const path = require("path");

const ROOT = path.resolve(__dirname, "src");
const DESTINATION = path.resolve(__dirname, "dist");

/* Configure HTMLWebpack plugin */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    title: "Hej",
    template: path.join(ROOT, "index.html"),
    // template: path.join(__dirname, 'src/index.html'),
    // filename: 'index.html',
    // inject: 'body',
});

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CleanWebpackPluginConfig = new CleanWebpackPlugin();

/* Configure BrowserSync */
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const BrowserSyncPluginConfig = new BrowserSyncPlugin(
    {
        host: "localhost",
        port: 3000,
        proxy: "http://localhost:8080/",
    },
    (config = {
        reload: false,
    })
);

/* Configure ProgressBar */
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const ProgressBarPluginConfig = new ProgressBarPlugin();

/* Configure Copy */
const CopyPlugin = require("copy-webpack-plugin");
const CopyPluginConfig = new CopyPlugin({
    patterns: [{ from: path.resolve(__dirname, "public"), to: "." }],
});

/* Export configuration */
module.exports = {
    context: ROOT,

    mode: "development",
    devtool: "source-map",

    entry: ["./index.ts"],
    output: {
        path: DESTINATION,
        filename: "[name].bundle.js",
    },

    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                use: "source-map-loader",
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: "ts-loader",
            },
            {
                test: /\.css$/,
                exclude: /[\/\\]src[\/\\]/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    { loader: "css-loader" },
                ],
            },
            {
                test: /\.css$/,
                exclude: /[\/\\](node_modules|bower_components|public)[\/\\]/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            importLoaders: 1,
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "/public/"),
        },
        watchFiles: ["public/**/*"],
    },
    resolve: {
        extensions: [".web.ts", ".web.js", ".ts", ".js"],
        modules: [ROOT, "node_modules"],
    },
    plugins: [
        BrowserSyncPluginConfig,
        ProgressBarPluginConfig,
        CleanWebpackPluginConfig,
        HTMLWebpackPluginConfig,
        CopyPluginConfig,
    ],
};
