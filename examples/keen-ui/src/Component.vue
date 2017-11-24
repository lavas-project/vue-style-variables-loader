<template>
    <div class="component-wrapper">
        <ui-button color="primary">Primary button</ui-button>
        <ui-button color="accent">Accent button</ui-button>
    </div>
</template>

<script>
import 'keen-ui/src/bootstrap';
import UiButton from 'keen-ui/src/UiButton.vue';

export default {
    name: 'component',
    components: {
        UiButton
    }
};
</script>

<style lang="styl">
.stylus-selector
    color: $brand-primary-color
</style>
