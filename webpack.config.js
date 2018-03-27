const path = require('path');
var webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PKG = require('./package.json');

// set name for output file(s)
const packagenName = PKG.name;
// set version from Qlik extension Package file
const qlikExtVersion = PKG.version;
// set name with version
let packageNameWithVersion = PKG.name + '_' + qlikExtVersion;
// all path definition for webpack build and deployment
const PATHS = {
    // develop path for webpack
    src: path.resolve(__dirname, 'src'),
    // Webpack output destination path
    dist: path.resolve(__dirname, 'dist'),
    // Looking your Qlik Sense Extension Path or process.env.USERPROFILE is exist on your Hostsystem 
    deploy: path.resolve(`${process.env.USERPROFILE}/Documents/Qlik/Sense/Extensions/${packagenName}`)
};

/**
 * Basic Configuration
 */
let config = {
    /** 
     * Development root
     * https://webpack.github.io/docs/configuration.html#configuration-object-content
     */
    context: path.join(__dirname),
    /**
     * Start point(File) with all dependendcies 
     * https://webpack.github.io/docs/configuration.html#entry
     */
    entry: `./${packagenName}.js`,
    /**
     * Output Configuration name --> out path 
     * https://webpack.github.io/docs/configuration.html#output
     * 
     * libraryTarget --> module definition
     * https://webpack.github.io/docs/configuration.html#output-librarytarget
     */
    output: {
        filename: `${packagenName}.js`,
        path: (PATHS.deploy),
        publicPath: `/sense/extensions/${packagenName}/`,
        libraryTarget: "umd"
    },
    /**
     * This rules loads files from qlik "text!.*" and "css!*" loaders inline in output
     * and transpile typescript in javascript  
     * https://webpack.github.io/docs/configuration.html#module-loaders
     */
    module: {
        rules: [  
            { test: /text!.*\.html$/, use: ["raw-loader"] },
            { test: /\.tsx?$/, use: 'ts-loader' },
            { test: /\.less$/, use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            { test: /css!.*\.css$/, use:  [
                {
                    loader: 'style-loader',
                    options: {
                        convertToAbsoluteUrls: true
                    }
                },
                {
                    loader: 'css-loader',
                    options: { modules: false, minimize: true, importLoaders: 1 },
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => ([
                        require('autoprefixer'),
                        require('precss'),
                        ]),
                    },
                },
            ]},
            { test: /\.eot(\?\S*)?$/, loader: 'url-loader?limit=100000&mimetype=application/vnd.ms-fontobject' },
            { test: /\.woff2(\?\S*)?$/, loader: 'url-loader?limit=100000&mimetype=application/font-woff2' },
            { test: /\.woff(\?\S*)?$/, loader: 'url-loader?limit=100000&mimetype=application/font-woff' },
            { test: /\.ttf(\?\S*)?$/, loader: 'url-loader?limit=100000&mimetype=application/font-ttf' },
            { test: /\.svg(\?\S*)?$/, loader: 'url-loader?limit=100000&mimetype=image/svg+xml'},
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader', options: { limit: 10000 } }
        ]
    },
    /**
     * Indicates dependencies that should not be bundled by webPack but instead remain requested by the resulting bundle.
     * https://webpack.github.io/docs/configuration.html#externals
     */
    externals: [
        // Qlik, JQuery or other..
         // or external libs { ogma: './ogma.min'}
        { angular: 'angular' },
        { qvangular: 'qvangular' },
        { qlik: 'qlik' }
    ],
    /**
     * An array of extensions that should be used to resolve modules
     * https://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    /**
     * Replace modules with other modules or paths.
     * https://webpack.github.io/docs/configuration.html#resolve-alias
     */
    resolveLoader: {
        alias: {
            'text': 'raw-loader',
            'css': 'css-loader'
        }
    },
    /**
     * https://webpack.github.io/docs/list-of-plugins.html
     */
    plugins: [
        /**
         * Clean Destination according to the build type
         * https://github.com/johnagan/clean-webpack-plugin
         */
        new CleanWebpackPlugin( (PATHS.deploy), { allowExternal: true } ),
        new webpack.DefinePlugin({ 
            'process.env': { NODE_ENV: JSON.stringify('dev')} 
        }),
        /**
         * Copy image(s),files and folders to deploy or dist path
         * https://github.com/webpack-contrib/copy-webpack-plugin
         */
        new CopyWebpackPlugin([
            /**
             * copy Qlik Sense Extension preview image, to qlik sense extension root
             */
            //{ from: `${packagenName}.png`, to: `${PATHS.deploy}/${packagenName}.png` },
            /**
             * copy Qlik Sense Extension qext file, to qlik sense extension root
             */
            { from: `${packagenName}.qext`, to: `${PATHS.deploy}/${packagenName}.qext`},
            /**
             * copy Qlik Sense Extension wbl file, to qlik sense extension root
             */
            { from: `wbfolder.wbl`, to: `${PATHS.deploy}/wbfolder.wbl`},
            /**
             * copy development images to qlik sense extension root 
             */
            { context: `${PATHS.src}/images`, from: '**/*', to: `${PATHS.deploy}/images` }
        ])
    ]
};

/**
 * dev Configuration and else prod
 */
config.plugins = [
    ...config.plugins,
];


/**
 * Export for npm
 */
module.exports = config;