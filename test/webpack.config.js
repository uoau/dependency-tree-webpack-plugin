const DependencyTreePlugin = require('../index').default;
console.log(DependencyTreePlugin)
const path = require('path');

module.exports = {
    entry: {
        a: `${__dirname}/src/a.js`,
        b: `${__dirname}/src/b.js`,
    },
    output: {
        path: `${__dirname}/dist`,
        filename: '[name].js',
    },
    plugins: [
        new DependencyTreePlugin(),
    ]
}