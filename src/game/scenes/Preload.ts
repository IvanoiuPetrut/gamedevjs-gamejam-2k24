import { Scene } from "phaser";

export class Preload extends Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("bg_story", "background/bg_story.png");
        this.load.image("bg1", "background/bg1.png");
        this.load.image("bg2", "background/bg2.png");
        this.load.image("bg3", "background/bg3.png");
        this.load.image("bg4", "background/bg4.png");
        this.load.image("bg5", "background/bg5.png");

        this.load.image("base_tiles", "environment.png");
        this.load.tilemapTiledJSON("tilemap", "minimalistic.json");

        this.load.spritesheet("player_sprite-sheet", "player.png", {
            frameWidth: 8,
            frameHeight: 12,
        });

        this.load.image("brush", "brush2.png");

        this.load.audio("bg-music", "audio/bg.wav");
        this.load.audio("footstep", "audio/footstep.ogg");
        this.load.audio("jump", "audio/jump.ogg");
        this.load.audio("time-mode", "audio/time-mode.ogg");
    }

    create() {
        this.scene.start("Intro");
    }
}
