import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game, Types } from "phaser";
import PhaserRaycaster from "phaser-raycaster";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 192, //192
    height: 112, //112
    pixelArt: true,
    zoom: 6, // 6
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 1, y: 300 },
            debug: false,
        },
    },
    parent: "game-container",
    backgroundColor: "#728af8",
    scene: [MainGame, MainMenu],
    plugins: {
        scene: [
            {
                key: "PhaserRaycaster",
                plugin: PhaserRaycaster,
                mapping: "raycasterPlugin",
            },
        ],
    },
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
};

export default StartGame;
