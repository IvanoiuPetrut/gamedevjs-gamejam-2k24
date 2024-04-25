import { Scene } from "phaser";
import { EventBus } from "../EventBus";

const MAX_VELOCITY_X = 80;
const ACCELERATION = 200;
const JUMP_SPEED = 150;

export class Game extends Scene {
    private backgrounds: {
        ratioX: number;
        sprite: Phaser.GameObjects.TileSprite;
    }[] = [];
    private cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private player: Phaser.Physics.Arcade.Sprite;
    private isInTimeMode = false;
    private runEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private footstep: Phaser.Sound.BaseSound;
    private secondGroundColider: Phaser.Physics.Arcade.Collider | undefined;
    private secondGorundDamageColider:
        | Phaser.Physics.Arcade.Collider
        | undefined;
    private timeGroundColider: Phaser.Physics.Arcade.Collider | undefined;
    private timeGroundDamageColider: Phaser.Physics.Arcade.Collider | undefined;
    private respawnPoints: Phaser.Tilemaps.Tile[] = [];
    private currentRespawnPoint: Phaser.Tilemaps.Tile | undefined;
    private gameFinished = false;
    private finishSound: Phaser.Sound.BaseSound;
    private respawnCheckSound: Phaser.Sound.BaseSound;
    private jumpSound: Phaser.Sound.BaseSound;

    constructor() {
        super("Game");
    }

    preload() {}

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.respawnCheckSound = this.sound.add("respawn-check", {
            volume: 1,
        });
        this.finishSound = this.sound.add("finish", {
            volume: 0.7,
        });
        const deathSound = this.sound.add("death", {
            volume: 0.5,
        });
        const bgMusic = this.sound.add("bg-music", {
            loop: true,
            volume: 0.5,
        });
        this.jumpSound = this.sound.add("jump", {
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
        const secondGroundDamage = map.createLayer(
            "SecondGroundDamage",
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
        const timeGroundDamage = map.createLayer(
            "TimeGroundDamage",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        const damage = map.createLayer(
            "Damage",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );
        const respawn = map.createLayer(
            "Respawn",
            "environemnt",
            mapOffset.x,
            mapOffset.y
        );

        this.player = this.physics.add
            .sprite(150, 75, "player_sprite-sheet")
            .setOrigin(0, 0);

        ground?.setCollisionByProperty({ collision: true });
        secondGround?.setCollisionByProperty({ collision: true });
        secondGroundDamage?.setCollisionByProperty({ collision: true });
        damage?.setCollisionByProperty({ collision: true });
        timeGround?.setCollisionByProperty({ collision: true });
        timeGroundDamage?.setCollisionByProperty({ collision: true });

        respawn?.forEachTile((tile) => {
            if (tile.index > 0) {
                this.respawnPoints.push(tile);
            }
        });
        this.respawnPoints.reverse();

        timeGround?.setAlpha(0.3);
        timeGroundDamage?.setAlpha(0.3);

        function respawnPlayer(
            player: Phaser.Physics.Arcade.Sprite,
            cameras: Phaser.Cameras.Scene2D.CameraManager,
            respawnPoint?: Phaser.Tilemaps.Tile
        ) {
            deathSound.play();
            cameras.main.fade(10, 0, 0, 0);
            cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                    cameras.main.fadeIn(100, 0, 0, 0);
                }
            );
            const x = respawnPoint ? respawnPoint.getCenterX() : 150;
            const y = respawnPoint ? respawnPoint.getCenterY() : 75;
            player?.setPosition(x, y);
        }

        if (damage && secondGroundDamage && timeGroundDamage && this.player) {
            this.physics.add.collider(this.player, damage, () => {
                respawnPlayer(
                    this.player,
                    this.cameras,
                    this.currentRespawnPoint
                );
            });
            this.secondGorundDamageColider = this.physics.add.collider(
                this.player,
                secondGroundDamage,
                () => {
                    respawnPlayer(
                        this.player,
                        this.cameras,
                        this.currentRespawnPoint
                    );
                }
            );
        }

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
        timeGroundDamage?.postFX.addBokeh(0.3, 0.5);
        secondGroundDamage?.postFX.addBokeh(0.3, 0.5);

        respawn?.postFX.addGlow(0xff5733, 0.9, 1, false);

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
                this.jumpSound.play();
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
                this.cameras.main.postFX.addVignette(0.5, 0.5, 0.7, 0.4);

                timeGround?.setAlpha(1);
                timeGroundDamage?.setAlpha(1);
                secondGround?.setAlpha(0.3);
                secondGroundDamage?.setAlpha(0.3);
                if (timeGround && timeGroundDamage && this.player) {
                    this.timeGroundColider = this.physics.add.collider(
                        this.player,
                        timeGround
                    );
                    this.timeGroundDamageColider = this.physics.add.collider(
                        this.player,
                        timeGroundDamage,
                        () => {
                            respawnPlayer(
                                this.player,
                                this.cameras,
                                this.currentRespawnPoint
                            );
                        }
                    );
                }

                this.secondGroundColider?.destroy();
                this.secondGorundDamageColider?.destroy();
            } else {
                bgMusic.rate = 1;
                this.cameras.main.postFX.disable(true);
                trees?.postFX.disable(true);
                decorations?.postFX.disable(true);
                decorations?.postFX.addGlow(0x89f335, 0.9, 2, true);
                decorations?.postFX.addBokeh(0.2, 0.5);
                this.cameras.main.postFX.addVignette(0.5, 0.5, 0.9);

                timeGround?.setAlpha(0.3);
                timeGroundDamage?.setAlpha(0.3);
                secondGround?.setAlpha(1);
                secondGroundDamage?.setAlpha(1);
                if (secondGround && secondGroundDamage && this.player) {
                    this.secondGroundColider = this.physics.add.collider(
                        this.player,
                        secondGround
                    );
                    this.secondGorundDamageColider = this.physics.add.collider(
                        this.player,
                        secondGroundDamage,
                        () => {
                            respawnPlayer(
                                this.player,
                                this.cameras,
                                this.currentRespawnPoint
                            );
                        }
                    );
                }

                this.timeGroundColider?.destroy();
                this.timeGroundDamageColider?.destroy();
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
            const playerVelocityX = this.player?.body?.velocity.x || 0;
            if (this.cursor.left?.isDown) {
                // Accelerate left
                if (playerVelocityX > -MAX_VELOCITY_X) {
                    this.player.setAccelerationX(-ACCELERATION);
                } else {
                    this.player.setAccelerationX(0);
                }
                this.player.anims.play("walk", true);
                this.player.setFlipX(true);
                this.runEmitter.setAlpha(1);
                this.footstep.resume();
            } else if (this.cursor.right?.isDown) {
                // Accelerate right
                if (playerVelocityX < MAX_VELOCITY_X) {
                    this.player.setAccelerationX(ACCELERATION);
                } else {
                    this.player.setAccelerationX(0);
                }
                this.player.anims.play("walk", true);
                this.player.setFlipX(false);
                this.runEmitter.setAlpha(1);
                this.footstep.resume();
            } else {
                // Decelerate to stop
                if (playerVelocityX !== 0) {
                    const deceleration =
                        playerVelocityX > 0 ? -ACCELERATION : ACCELERATION;
                    this.player.setAccelerationX(deceleration);
                } else {
                    this.player.setAccelerationX(0);
                }
                this.player.anims.play("idle", true);
                this.runEmitter.setAlpha(0);
                this.footstep.pause();
            }
        }

        for (let i = 0; i < this.respawnPoints.length; i++) {
            const distance = Phaser.Math.Distance.Between(
                this.player?.x,
                this.player?.y,
                this.respawnPoints[i].getCenterX(),
                this.respawnPoints[i].getCenterY()
            );
            if (distance < 35) {
                this.currentRespawnPoint = this.respawnPoints[i];
                this.respawnPoints.splice(i, 1);
                this.respawnCheckSound.play();
            }
        }

        if (this.respawnPoints.length === 0 && !this.gameFinished) {
            this.finishSound.play();
            EventBus.emit("game-finished");
            this.gameFinished = true;
        }
    }
}
