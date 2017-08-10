<template>
    <div class="component-wrapper">
        xxx
    </div>
</template>

<script>
export default {
    name: 'component'
};
</script>

<style lang="styl">
.stylus-selector
    color: $theme.primary
    height: $height
</style>

<style lang="less">
.less-selector {
    color: @theme-primary;
    height: @height;
}
</style>

<style lang="scss">
.scss-selector {
    color: $theme-primary;
    height: $height;
}
</style>

<style lang="sass">
.sass-selector
    color: $theme-primary
    height: $height
</style>