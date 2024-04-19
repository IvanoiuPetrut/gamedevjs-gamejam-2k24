import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { WEBGL, AUTO, Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
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
    scene: [MainGame, MainMenu],
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
};

export default StartGame;
