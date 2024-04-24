<script setup lang="ts">
import { ref } from "vue";
import PhaserGame from "./game/PhaserGame.vue";

const phaserRef = ref();
</script>

<template>
    <PhaserGame ref="phaserRef" />
    <div
        style="
            font-family: kenney_blocks;
            position: absolute;
            left: -1000px;
            visibility: hidden;
        "
    >
        .
    </div>
</template>

<style>
@font-face {
    font-family: "kenney_blocks";
    src: url("../public/assets/font/kenney_blocks.ttf");
    font-weight: 400;
    font-weight: normal;
}
</style>
