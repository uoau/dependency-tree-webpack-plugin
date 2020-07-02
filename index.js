const fs = require('fs');
class DependencyTreePlugin {
    constructor({ filename = 'dependency-tree.json' } = {}) {
        this.filename = filename;
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            'DependencyTreePlugin',
            (compilation, callback) => {
                const stats = compilation.getStats().toJson();
                const pushData = {
                    rootDir: compiler.context,
                    entry: [],
                    modules: {},
                };

                function dealUri(uri) {
                    if (!uri) return null;
                    if (/^\(webpack\)/.test(uri)) return null;
                    const arr = uri.split(' ');
                    if (arr.length) {
                        uri = arr[arr.length - 1];
                    }
                    let pushUri = uri.match(/(.*)\?[^\?]*$/);
                    pushUri = pushUri ? pushUri[1] : uri;
                    const arr2 = pushUri.split('!./');
                    pushUri = arr2.length > 1 ? ('./' + arr2[arr2.length - 1]) : pushUri;
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

                        item.reasons.forEach((item2) => {
                            if (!item2.moduleName) {
                                pushData.entry.push(moduleName);
                                pushData.entry = Array.from(new Set(pushData.entry));
                                return false;
                            }
                            item2.moduleName = dealUri(item2.moduleName);
                            if (item2.moduleName.indexOf('node_modules') > -1) {
                                return false;
                            }
                            if (!item2.moduleName) {
                                return false;
                            }
                            if (item2.moduleName === moduleName) {
                                return false;
                            }
                            if (/@babel|\-loader|regenerator-runtime|core-js/.test(item2.userRequest)) {
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
                fs.writeFileSync(this.filename, JSON.stringify(fileObj, null, 4));
                callback();
            },
        );
    }
};
exports.default = DependencyTreePlugin;