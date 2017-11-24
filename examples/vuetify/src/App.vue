<template>
    <v-app>
        <v-btn flat>Normal</v-btn>
        <v-btn color="primary" dark>Primary</v-btn>
    </v-app>
</template>

<script>
export default {
    name: 'component'
};
</script>

<style lang="styl">
.stylus-selector
    color: $theme.primary
    background: $colors.red.lighten-1
</style>

<style lang="less">
.less-selector {
    color: @theme-primary;
    background: @colors-red-lighten-1;
}
.less-selector2 {
    color: @less-color;
}
</style>

<style lang="scss">
.scss-selector {
    color: $theme-primary;
    background: $colors-red-lighten-1;
}
</style>

<style lang="sass">
.sass-selector
    color: $theme-primary
    background: $colors-red-lighten-1
</style>
