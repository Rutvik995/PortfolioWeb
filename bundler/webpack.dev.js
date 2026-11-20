const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const path = require('path')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        devServer:
        {
            host: 'localhost',
            port: 8080,
            static:
            {
                directory: path.resolve(__dirname, '../dist')
            },
            open: true,
            allowedHosts: 'all',
            client:
            {
                overlay: true
            }
        }
    }
)
