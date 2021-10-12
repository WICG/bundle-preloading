const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/build.js');
const config = defaults.__get__('config');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

config.plugins[0].options.inject = false;
config.plugins[0].options.minify = false;

config.plugins.push(new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*bundlepreload.*/]));
// config.plugins.push(new HtmlInlineScriptPlugin());
// config.plugins.push(new HtmlInlineScriptPlugin(["bundlepreload.js"]));
