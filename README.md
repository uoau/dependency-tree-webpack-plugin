# Intro
This webpack plugin can export the dependencies of your project as JSON files.

# Usage
First, you need install it in your project.
```
npm i dependency-tree-webpack-plugin -D
```

Second, Add webpack plug to your project.
``` javascript
const DependencyTreePlugin = require('dependency-tree-webpack-plugin').default;

...
    plugins:[
        ...,
        new DependencyTreePlugin(),
    ]
}
```

Then, just run it, a `dependency-tree` file will appear in your root directory. The content of this file will look like this.

![image](https://github.com/uoau/dependency-tree-webpack-plugin/blob/master/readme-img/1.png?raw=true)

# What's the use of this JSON
You need install the VSCode extension `webpack tree`, And load the json file, and it will generate a tree view in the sidebar, like this.

![image](https://github.com/uoau/dependency-tree-webpack-plugin/blob/master/readme-img/2.png?raw=true)

This tree is made up of project dependencies, and you can clearly understand the structure of the project. you can jump quickly between these files.