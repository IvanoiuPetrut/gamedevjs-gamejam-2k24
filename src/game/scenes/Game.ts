import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { PostFxPipeline } from "../shaders/post-fx-pipeline";

const MOVE_SPEED = 80;
const JUMP_SPEED = 120;

export class Game extends Scene {
    private backgrounds: {
        ratioX: number;
        sprite: Phaser.GameObjects.TileSprite;
    }[] = [];
    private cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private player: Phaser.Physics.Arcade.Sprite | undefined;
    private isInTimeMode = false;

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("star", "star.png");
        this.load.image("background", "bg.png");
        this.load.image("logo", "logo.png");
        this.load.image("ground", "ground.png");

        //for paralax
        this.load.image("bg1", "background/bg1.png");
        this.load.image("bg2", "background/bg2.png");
        this.load.image("bg3", "background/bg3.png");
        this.load.image("bg4", "background/bg4.png");
        this.load.image("bg5", "background/bg5.png");

        this.load.image("base_tiles", "environment.png");
        this.load.tilemapTiledJSON("tilemap", "minimalistic.json");

        // Player
        this.load.spritesheet("player_sprite-sheet", "player.png", {
            frameWidth: 8,
            frameHeight: 12,
        });
    }

    create() {
        // * Paralax BG
        const { width, height } = this.scale;
        this.add.image(0, 0, "bg1").setOrigin(0, 0).setScrollFactor(0);

        this.backgrounds.push({
            ratioX: 0.05,
            sprite: this.add
                .tileSprite(0, 0, width, height, "bg2")
                .setOrigin(0, 0)
                .setScrollFactor(0.0),
        });

        this.backgrounds.push({
            ratioX: 0.1,
            sprite: this.add
                .tileSprite(0, 0, width, height, "bg3")
                .setOrigin(0, 0)
                .setScrollFactor(0.0),
        });

        this.backgrounds.push({
            ratioX: 0.01,
            sprite: this.add
                .tileSprite(0, 0, width, height, "bg4")
                .setOrigin(0, 0)
                .setScrollFactor(0.0),
        });
        this.backgrounds.push({
            ratioX: 0.3,
            sprite: this.add
                .tileSprite(0, 0, width, height, "bg5")
                .setOrigin(0, 0)
                .setScrollFactor(0.0),
        });

        this.backgrounds[0].sprite.postFX.addShine(0.3, 2, 3, true);
        this.backgrounds[1].sprite.postFX.addShine(0.1, 2, 3, true);
        this.backgrounds[2].sprite.postFX.addGlow(0xffffff, 0.5, 0);

        const mapOffset = {
            x: -750,
            y: -1800,
        };
        const map = this.make.tilemap({
            key: "tilemap",
            tileWidth: 16,
            tileHeight: 16,
        });
        map.addTilesetImage("environemnt", "base_tiles");

        const trees = map.createLayer(
            "Trees",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        const decorations = map.createLayer(
            "Decorations",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        const ground = map.createLayer(
            "Ground",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        ground?.setCollisionByProperty({ collision: true });
        // ground?.setVisible(false);

        this.player = this.physics.add
            .sprite(150, 75, "player_sprite-sheet")
            .setOrigin(0, 0);

        // this.player.postFX?.addBloom(0xff5733, 1, 1, 1, 1, 4);
        this.player.postFX?.addGlow(0xff5733, 1, 4, true);
        decorations?.postFX.addGlow(0x89f335, 0.9, 2, true);
        decorations?.postFX.addBokeh(0.2, 0.5);
        ground?.postFX.addBokeh(0.2, 0.5);

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("player_sprite-sheet", {
                start: 0,
                end: 1,
            }),
            frameRate: 2,
        });

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("player_sprite-sheet", {
                start: 2,
                end: 5,
            }),
            frameRate: 5,
        });

        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("player_sprite-sheet", {
                start: 6,
                end: 7,
            }),
            frameRate: 2,
            repeat: -1,
        });

        if (ground) {
            const colider = this.physics.add.collider(this.player, ground);
            //remove the collision with the ground
            // this.physics.world.removeCollider(colider);
        }

        this.cursor = this.input.keyboard?.createCursorKeys();

        this.input.keyboard?.on("keydown-SPACE", () => {
            console.log("space down");
            this.player?.setVelocityY(-JUMP_SPEED);
        });

        this.input.keyboard?.on("keydown-C", () => {
            console.log("c");
            this.isInTimeMode = !this.isInTimeMode;
            if (this.isInTimeMode) {
                trees?.postFX.addBarrel(0.5);
                decorations?.postFX.addBarrel(0.5);

                trees?.postFX.addVignette(0.5, 0.5, 0.3);
                decorations?.postFX.addVignette(0.5, 0.5, 0.5);

                this.cameras.main.postFX.addVignette(0.5, 0.5, 0.6);
            } else {
                this.cameras.main.postFX.disable(true);
                trees?.postFX.disable(true);
                decorations?.postFX.disable(true);
                decorations?.postFX.addGlow(0x89f335, 0.9, 2, true);
                decorations?.postFX.addBokeh(0.2, 0.5);
            }
        });

        //renderer

        // (
        //     this.renderer as Phaser.Renderer.WebGL.WebGLRenderer
        // ).pipelines.addPostPipeline("PostFxPipeline", PostFxPipeline);

        // this.cameras.main.setPostPipeline(PostFxPipeline);

        EventBus.emit("current-scene-ready", this);
    }

    update() {
        for (let i = 0; i < this.backgrounds.length; ++i) {
            const bg = this.backgrounds[i];

            bg.sprite.tilePositionX = this.cameras.main.scrollX * bg.ratioX;
        }

        if (this.player) {
            this.cameras.main.startFollow(this.player, false, 1, 1, 0, 25);
        }

        if (this.cursor) {
            if (this.cursor.left?.isDown) {
                this.player?.setVelocityX(-MOVE_SPEED);
                this.player?.anims.play("walk", true);
                this.player?.setFlipX(true);
            } else if (this.cursor.right?.isDown) {
                this.player?.setVelocityX(MOVE_SPEED);
                this.player?.anims.play("walk", true);
                this.player?.setFlipX(false);
            } else {
                this.player?.setVelocityX(0);
                this.player?.anims.play("idle", true);
            }

            if (this.cursor.up?.isDown && this.player?.body?.blocked.down) {
                this.player?.setVelocityY(-JUMP_SPEED);
                this.player?.anims.play("jump", true);
            }
        }
    }
}
