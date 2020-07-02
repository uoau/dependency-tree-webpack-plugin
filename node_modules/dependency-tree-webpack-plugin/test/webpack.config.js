const DependencyTreePlugin = require('../index').default;
console.log(DependencyTreePlugin)

module.exports = {
    entry: {
        a: `${__dirname}/src/a.js`,
        b: `${__dirname}/src/b.js`,
    },
    output: {
        path: `${__dirname}/dist`,
    },
    plugins: [
        new DependencyTreePlugin(),
    ]
}