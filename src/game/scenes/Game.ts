import { Scene } from "phaser";
import { EventBus } from "../EventBus";

const MOVE_SPEED = 70;
const JUMP_SPEED = 150;

export class Game extends Scene {
    private backgrounds: {
        ratioX: number;
        sprite: Phaser.GameObjects.TileSprite;
    }[] = [];
    private cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private player: Phaser.Physics.Arcade.Sprite | undefined;
    private isInTimeMode = false;
    private runEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private footstep: Phaser.Sound.BaseSound | undefined;
    private secondGroundColider: Phaser.Physics.Arcade.Collider | undefined;
    private timeGroundColider: Phaser.Physics.Arcade.Collider | undefined;

    constructor() {
        super("Game");
    }

    preload() {}

    create() {
        const bgMusic = this.sound.add("bg-music", {
            loop: true,
            volume: 0.3,
        });
        const jumpSound = this.sound.add("jump", {
            volume: 1,
            rate: 0.8,
        });
        const timeModeSound = this.sound.add("time-mode", {
            volume: 0.5,
            rate: 0.7,
        });
        this.footstep = this.sound.add("footstep", {
            volume: 0.5,
            loop: true,
            rate: 0.3,
        });
        bgMusic.play();
        this.footstep.play();
        this.footstep.pause();
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

        if (this.backgrounds.length > 0) {
            this.backgrounds[0].sprite.postFX.addShine(0.3, 2, 3, true);
            this.backgrounds[1].sprite.postFX.addShine(0.1, 2, 3, true);
            this.backgrounds[2].sprite.postFX.addGlow(0xffffff, 0.5, 0);
        }
        const mapOffset = {
            x: -750,
            y: -1800,
        };
        const map = this.make.tilemap({
            key: "tilemap",
            tileWidth: 16,
            tileHeight: 16,
        });

        this.player = this.physics.add
            .sprite(150, 75, "player_sprite-sheet")
            .setOrigin(0, 0);

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
        const secondGround = map.createLayer(
            "SecondGround",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        const timeGround = map.createLayer(
            "TimeGround",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        ground?.setCollisionByProperty({ collision: true });
        secondGround?.setCollisionByProperty({ collision: true });
        timeGround?.setCollisionByProperty({ collision: true });

        timeGround?.setAlpha(0.3);

        if (ground) {
            this.physics.add.collider(this.player, ground);
        }

        if (secondGround) {
            this.secondGroundColider = this.physics.add.collider(
                this.player,
                secondGround
            );
        }

        this.cameras.main.postFX.addVignette(0.5, 0.5, 0.9);
        this.player.postFX?.addGlow(0xff5733, 1, 4, true);
        decorations?.postFX.addGlow(0x89f335, 0.9, 2, true);
        decorations?.postFX.addBokeh(0.2, 0.5);
        ground?.postFX.addBokeh(0.2, 0.5);
        secondGround?.postFX.addBokeh(0.3, 0.5);
        timeGround?.postFX.addBokeh(0.3, 0.5);

        this.runEmitter = this.add.particles(0, 0, "brush", {
            speedX: 10,
            speedY: -10,
            lifespan: 200,
            scale: { start: 0.1, end: 0 },
            blendMode: "ADD",
            tint: [0xff5733, 0xffffff, 0xff5733, 0xffffff],
            bounce: 0.5,
        });

        this.runEmitter.startFollow(this.player, 2, 12);
        this.runEmitter.setAlpha(0);

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

        this.cursor = this.input.keyboard?.createCursorKeys();

        this.input.keyboard?.on("keydown-SPACE", () => {
            if (this.player?.body?.blocked.down) {
                this.player?.setVelocityY(-JUMP_SPEED);
                this.player?.anims.play("jump", true);
                jumpSound.play();
            }
        });

        this.input.keyboard?.on("keydown-C", () => {
            timeModeSound.play();
            this.isInTimeMode = !this.isInTimeMode;
            if (this.isInTimeMode) {
                bgMusic.rate = 0.5;
                trees?.postFX.addBarrel(0.5);
                decorations?.postFX.addBarrel(0.5);
                trees?.postFX.addVignette(0.1, 0.1, 0.6, 0.2);
                decorations?.postFX.addVignette(0.5, 0.5, 0.5);
                this.cameras.main.postFX.addVignette(0.5, 0.5, 0.6);

                //ground
                timeGround?.setAlpha(1);
                secondGround?.setAlpha(0.3);
                if (timeGround && this.player) {
                    this.timeGroundColider = this.physics.add.collider(
                        this.player,
                        timeGround
                    );
                }
                this.secondGroundColider?.destroy();
            } else {
                bgMusic.rate = 1;
                this.cameras.main.postFX.disable(true);
                trees?.postFX.disable(true);
                decorations?.postFX.disable(true);
                decorations?.postFX.addGlow(0x89f335, 0.9, 2, true);
                decorations?.postFX.addBokeh(0.2, 0.5);
                this.cameras.main.postFX.addVignette(0.5, 0.5, 0.9);

                //ground
                timeGround?.setAlpha(0.3);
                secondGround?.setAlpha(1);
                if (secondGround && this.player) {
                    this.secondGroundColider = this.physics.add.collider(
                        this.player,
                        secondGround
                    );
                }
                this.timeGroundColider?.destroy();
            }
        });

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
                this.runEmitter.setAlpha(1);
                this.footstep?.resume();
            } else if (this.cursor.right?.isDown) {
                this.player?.setVelocityX(MOVE_SPEED);
                this.player?.anims.play("walk", true);
                this.player?.setFlipX(false);
                this.runEmitter.setAlpha(1);
                this.footstep?.resume();
            } else {
                this.player?.setVelocityX(0);
                this.player?.anims.play("idle", true);
                this.runEmitter.setAlpha(0);
                this.footstep?.pause();
            }

            if (this.cursor.up?.isDown && this.player?.body?.blocked.down) {
                this.player?.setVelocityY(-JUMP_SPEED);
                this.player?.anims.play("jump", true);
            }

            if (this.cursor.left?.isDown && this.cursor.right?.isDown) {
                this.player?.setVelocityX(0);
                this.player?.anims.play("idle", true);
                this.runEmitter.setAlpha(0);
            }

            if (this.cursor.left?.isDown && !this.player?.body?.blocked.down) {
                this.runEmitter.setAlpha(0);
                this.footstep?.pause();
            } else if (
                this.cursor.right?.isDown &&
                !this.player?.body?.blocked.down
            ) {
                this.runEmitter.setAlpha(0);
                this.footstep?.pause();
            }
        }
    }
}
