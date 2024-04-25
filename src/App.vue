<script setup lang="ts">
import { ref, onMounted } from "vue";
import PhaserGame from "./game/PhaserGame.vue";
import { EventBus } from "./game/EventBus";
import JSConfetti from "js-confetti";

const phaserRef = ref();
const confetti = new JSConfetti();

onMounted(() => {
    EventBus.on("game-finished", () => {
        confetti.addConfetti({
            confettiColors: [
                "#89f335",
                "#91f147",
                "#bbfa8a",
                "#f9e1b1",
                "#f9d4b7",
                "#f9b7b7",
            ],
        });

        setTimeout(() => {
            confetti.addConfetti({
                confettiColors: [
                    "#89f335",
                    "#91f147",
                    "#bbfa8a",
                    "#f9e1b1",
                    "#f9d4b7",
                    "#f9b7b7",
                ],
            });
        }, 500);
    });
});
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
