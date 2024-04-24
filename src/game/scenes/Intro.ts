import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Intro extends Scene {
    private gameStory: string[] = ["test 1", "test 2", "test 3"];
    private storyIndex = 0;

    constructor() {
        super("Intro");
    }

    create() {
        const screenCenterX =
            this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY =
            this.cameras.main.worldView.y + this.cameras.main.height / 2;
        const gameName = this.add
            .text(screenCenterX, screenCenterY - 50, "Chrono Switch", {
                font: "28px kenney_blocks",
                fill: "#ffffff",
            })
            .setOrigin(0.5);
        gameName.setTint(0xbbfa8a, 0x91f147, 0x98de20, 0x92c40d);
        gameName.postFX.addGlow(0x89f335, 0.8, 0, false);

        const storyTextNode = this.add
            .text(
                screenCenterX,
                screenCenterY,
                this.gameStory[this.storyIndex],
                {
                    font: "12px kenney_blocks",
                    fill: "#a5a0a0",
                }
            )
            .setOrigin(0.5);

        const bootomScreenY =
            this.cameras.main.worldView.y + this.cameras.main.height - 10;
        this.add
            .text(screenCenterX, bootomScreenY, "- press space -", {
                font: "8px kenney_blocks",
                fill: "#525050",
            })
            .setOrigin(0.5);

        this.input.keyboard?.on("keydown-SPACE", () => {
            this.storyIndex++;
            if (this.storyIndex >= this.gameStory.length) {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once(
                    Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                    () => {
                        this.scene.start("Game");
                    }
                );
            }
            storyTextNode.setText(this.gameStory[this.storyIndex]);
        });

        EventBus.emit("current-scene-ready", this);
    }
}
