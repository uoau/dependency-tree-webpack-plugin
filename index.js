const fs = require('fs');
class DependencyTreePlugin {
    constructor({ filename = 'dependency-tree.json' } = {}) {
        this.filename = filename;    
    }

    apply(compiler) {
        const that = this;
        compiler.plugin("emit", function(compilation, callback) {
            const stats = compilation.getStats().toJson();
            const pushData = {
                rootDir: compiler.context,
                entry: [],
                modules: {},
            };

            function dealUri(uri) {
                // 过滤空
                if (!uri) return null;
                // 过滤名字带webpack的
                if (/^\(webpack\)/.test(uri)) return null;
                // 过滤用空格分隔的
                const arr = uri.split(' ');
                if (arr.length) {
                    uri = arr[arr.length - 1];
                }
                // 过滤 !./
                const arr2 = uri.split('!./');
                uri = arr2.length > 1 ? ('./' + arr2[arr2.length - 1]) : uri;
                // 过滤掉最后一个参数的
                let pushUri = uri.match(/(.*)\?[^\?]*$/);
                pushUri = pushUri ? pushUri[1] : uri;
                return pushUri;
            }
            function dealItem(item) {
                let moduleName = '';
                item.name = dealUri(item.name);
                if (item.name) {
                    if (item.name.indexOf('node_modules') > -1) {
                        // 模块的入口文件
                        item.issuerName = dealUri(item.issuerName);
                        if (item.issuerName && !(/node_modules/).test(item.issuerName)) {
                            moduleName = item.name.match(/node_modules\/([^\/]*)\//)[1];
                            const sencondName = moduleName.match(/^_([^\@]+)\@/) || moduleName.match(/^_(\@[^\@]+)\@/);
                            sencondName ? moduleName = sencondName[1].replace('_', '/') : null;
                            moduleName = 'node_modules/' + moduleName;
                        } else {
                            return false;
                        }
                    } else {
                        // 普通文件
                        moduleName = item.name;
                        pushData.modules[item.name] = pushData.modules[item.name] || [];
                    }
                    // 过滤一些特定字段的
                    if (/babel|\-loader|regenerator-runtime|core-js/.test(moduleName)) {
                        return false;
                    }
                    item.reasons.forEach((item2) => {
                        item2.moduleName = dealUri(item2.moduleName);
                        // 过滤 null  过滤名字里又node_modules
                        if (!item2.moduleName || item2.moduleName.indexOf('node_modules') > -1) {
                            return false;
                        }
                        // 过滤cj引入的包
                        if (item2.type === 'cjs require') {
                            return false;
                        }
                        // 过滤入口文件
                        if (item2.type === 'single entry') {
                            pushData.entry.push(item2.moduleName);
                            pushData.entry = Array.from(new Set(pushData.entry));
                            return false;
                        }
                        // 过滤自己引用自己的
                        if (item2.moduleName === moduleName) {
                            return false;
                        }
                        let belongObj = pushData.modules[item2.moduleName] || [];
                        belongObj.push(moduleName);
                        belongObj = Array.from(new Set(belongObj));
                        pushData.modules[item2.moduleName] = belongObj;
                    });
                }
            }
            function dealModules(modules) {
                modules.forEach((item) => {
                    if (item.modules) {
                        dealModules(item.modules);
                    } else {
                        dealItem(item);
                    }
                });
            }
            dealModules(stats.modules);
            let fileContent = '';
            let fileObj = {};
            try {
                fileContent = fs.readFileSync(this.filename);
                if (fileContent) {
                    fileObj = JSON.parse(fileContent);
                }
            } catch (e) {
                fileObj = {};
            }
            fileObj = { ...fileObj, ...pushData };
            fs.writeFileSync(that.filename, JSON.stringify(fileObj, null, 4));
            callback();
        })
    }
};
exports.default = DependencyTreePlugin;