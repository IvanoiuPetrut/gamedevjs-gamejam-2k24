import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
        // this.load.setPath("assets");
        // this.load.image("star", "star.png");
        // this.load.image("background", "bg.png");
        // this.load.image("logo", "logo.png");
    }

    create() {
        // this.add.image(512, 384, "background");
        // this.add.image(512, 350, "logo").setDepth(100);
        this.add
            .text(512, 490, "Menu wow!!", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        EventBus.emit("current-scene-ready", this);
    }
}
