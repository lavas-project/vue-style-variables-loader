# vue-style-variables-loader

这个基于 webpack 的 loader 试图解决使用 Vue 开发中的两个问题：
1. 在 Vue 单文件中自动引入变量文件
2. 选用了一个 UI 框架并使用了框架提供的主题解决方案，在组件中想使用这些主题变量，但又不想使用框架指定的预处理器

## 问题1：在 Vue 单文件中引入变量文件

通常我们的项目中包含一个定义了常用变量的文件，以开发选择的预处理器格式存在。
使用时，在每个 Vue 单文件组件的 style 块中都需要手动引入这个变量文件。虽然使用 webpack alias 之后不用考虑路径问题，但如果能自动引入将方便很多。
``` vue
// Component.vue

<style lang="scss">
    // 引入变量文件
    @import "@/styles/variables.scss";
    // 开始使用变量
</style>
```

有人针对这个问题向 vue-loader 提出了[相关 issue](https://github.com/vuejs/vue-loader/issues/328)。而 vue-loader 认为这个工作应该交给各个预处理器 loader 完成。

例如使用 sass 时，可以[使用 sass-resources-loader](https://vue-loader.vuejs.org/en/configurations/pre-processors.html)
``` javascript
{
    loader: 'sass-resources-loader',
    options: {
        resources: 'variables.scss'
    }
}
```

或者[使用 sass-loader](https://github.com/webpack-contrib/sass-loader#environment-variables)的注入环境变量功能。[keen-ui就采用了这种方式支持用户覆盖预定义的主题变量](https://github.com/JosephusPaye/Keen-UI/blob/master/Customization.md#customization)
``` javascript
plugins: [
    new webpack.LoaderOptionsPlugin({
        options: {
            sassLoader: {
                data: '@import "src/styles/variables.scss";',
                includePaths: 'src/styles'
            },
            context: path.resolve(__dirname) // your project root
        }
    })
]
```

而在 stylus-loader 中，可以使用[import](https://github.com/shama/stylus-loader#using-nib-with-stylus)达到引入全局变量的目的。
``` javascript
plugins: [
    new webpack.LoaderOptionsPlugin({
        test: /\.styl$/,
        stylus: {
            use: [require('nib')()],
            import: ['~nib/lib/nib/index.styl']
        }
    })
]
```

less-loader 中并没有找到解决方法，似乎只能每次手动引入了。

可以看出，各个预处理器 loader 都有自己的方式解决这个问题。而且就算是手动引入，代价也并不高，让我们继续来看第二个问题。

## 问题2：选用和 UI 框架不同的预处理器开发

各个 UI 框架都有自己的主题解决方案，例如：
* vuetify [使用 stylus hash 变量](https://vuetifyjs.com/style/theme)覆盖[预定义的变量列表](https://github.com/vuetifyjs/vuetify/blob/dev/src/stylus/settings/_theme.styl)。
* keen-ui [使用用户自定义的 sass 变量文件](https://github.com/JosephusPaye/Keen-UI/blob/master/Customization.md#customization)覆盖[预定义的变量列表](https://github.com/JosephusPaye/Keen-UI/blob/master/src/styles/variables.scss)
* vux 通过 vux-loader [使用用户自定义的 less 变量文件](https://vux.li/#/?id=%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE)覆盖[预定义的变量列表](https://github.com/airyland/vux/blob/v2/src/styles/variable.less)
* [vue-material](https://github.com/vuematerial/vue-material)和以上框架都不同，使用了[编程式方式设置主题](http://vuematerial.io/#/themes/configuration)。

可以看出在使用变量文件覆盖的方案中，主题变量必须使用框架指定的预处理器定义。
例如选择了 vuetify，那开发者自定义的变量文件就必须使用 stylus 来写。这样在实际组件开发中，如果选择 less，就无法使用 stylus 定义的这些变量了。
``` vue
// Component.vue

<style lang="less">
    // 引入变量文件
    @import "@/styles/variables.styl";
    // 出错了，less 并不认识 stylus 定义的变量 $bg-color
    background: @bg-color;
</style>
```

所以在上述场景中，我们需要将文件中使用 stylus 定义的每一个主题变量都转换成 less 变量，然后注入`.vue`文件的`<style>`块中。
如果能实现这一点，其实第一个问题也就顺便解决了。

## 实现思路

首先，开发者使用所选 UI 框架的主题解决方案，使用框架指定的预处理器创建一个变量文件，由于该文件只包含变量，对于开发者而言，学习特定预处理器语法的成本并不高。

然后，使用 loader 处理每一个`.vue`文件。该 loader 接受之前的变量文件作为输入，在每个`.vue`文件的每个`<style>`块中，根据当前`<style>`块指定的预处理器语言，将包含的所有变量进行转换并注入。这样开发者就可以直接使用自己熟悉的预处理器语法开发了。

并不需要做类似[stylus，less，sass之间全部语法的互相转换](http://csspre.com/convert/)。只需要变量声明这部分。

*WIP* 但也并不能使用正则简单替换，原因是 stylus 中有 hash 类型的变量声明：
``` stylus
$theme := {
    primary: 'white';
}
```

所以只能写一个简单的 compiler 做一些词法语法分析的工作。

## 使用方法

安装
```bash
npm install vue-style-variables-loader --save-dev
```

在 webpack 中配置规则，处理项目中每一个`.vue`文件，要注意配置`include/exclude`规则，使 loader 只作用于开发者项目内的文件，不包含第三方文件。
```javascript
{
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-loader',
            options: vueLoaderConfig
        },
        {
            loader: 'vue-style-variables-loader',
            options: {
                injectInVueFile: true
            }
        }
    ],
    include: [resolve('src')]
},
{
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-loader',
            options: vueLoaderConfig
        }
    ],
    exclude: [resolve('src')]
},
```

## 参数说明

暂定两个参数：
* `variablesFiles` 变量文件路径，Array 类型
* `imports` import 语句，Array 类型

## 参考资料

[the-super-tiny-compiler](https://github.com/thejameskyle/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)

