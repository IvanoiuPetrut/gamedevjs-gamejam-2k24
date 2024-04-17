<script setup lang="ts">
import Phaser from "phaser";
import { ref, toRaw } from "vue";
import PhaserGame from "./game/PhaserGame.vue";

const phaserRef = ref();

const addSprite = () => {
    const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

    if (scene) {
        const x = Phaser.Math.Between(64, scene.scale.width - 64);
        const y = Phaser.Math.Between(64, scene.scale.height - 64);

        scene.add.sprite(x, y, "star");
    }
};

const goToMenuScene = () => {
    const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

    if (scene) {
        scene.scene.start("MainMenu");
    }
};

const goToMainScene = () => {
    const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

    if (scene) {
        scene.scene.start("Game");
    }
};
</script>

<template>
    <PhaserGame ref="phaserRef" />
    <div>
        <div class="flex-column">
            <button class="button" @click="addSprite">Add New Sprite</button>
            <button class="button" @click="goToMenuScene">Menu scene</button>
            <button class="button" @click="goToMainScene">Main Scene</button>
        </div>
    </div>
</template>

<style scoped>
.flex-column {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
