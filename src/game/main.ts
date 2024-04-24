import { Game as MainGame } from "./scenes/Game";
import { Preload } from "./scenes/Preload";
import { Intro } from "./scenes/Intro";
import { WEBGL, AUTO, Game, Types } from "phaser";

const config: Types.Core.GameConfig = {
    type: WEBGL,
    width: 352, //192
    height: 160, //112
    pixelArt: true,
    zoom: 3, // 6
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 1, y: 300 },
            debug: false,
        },
    },
    parent: "game-container",
    backgroundColor: "#1c1b1b",
    scene: [Preload, Intro, MainGame],
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
};

export default StartGame;
