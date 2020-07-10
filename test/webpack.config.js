const DependencyTreePlugin = require('../index').default;
console.log(DependencyTreePlugin)
const path = require('path');

module.exports = {
    entry: {
        a: `${__dirname}/src/a.js`,
    },
    output: {
        path: `${__dirname}/dist`,
        filename: '[name].js',
    },
    plugins: [
        new DependencyTreePlugin(),
    ]
}