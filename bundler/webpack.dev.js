const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const path = require('path')
const express = require('express')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        devServer:
        {
            host: 'localhost',
            port: 8080,
            static:
            [
                {
                    directory: path.resolve(__dirname, '../static'),
                    publicPath: '/'
                }
            ],
            setupMiddlewares: (middlewares, devServer) => {
                // Intercept static & media asset requests before webpack-dev-middleware.
                // express.static natively supports HTTP 206 partial content range requests
                // and cleanly handles client stream disconnects without throwing ERR_STREAM_PREMATURE_CLOSE.
                middlewares.unshift({
                    name: 'static-media-stream-handler',
                    middleware: express.static(path.resolve(__dirname, '../static'), {
                        acceptRanges: true,
                        fallthrough: true
                    })
                })
                return middlewares
            },
            open: true,
            allowedHosts: 'all',
            client:
            {
                overlay: {
                    errors: true,
                    warnings: false
                }
            }
        }
    }
)
