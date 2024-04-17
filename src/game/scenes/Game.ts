import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import PhaserRaycaster from "phaser-raycaster";

const MOVE_SPEED = 80;
const JUMP_SPEED = 120;

export class Game extends Scene {
    raycasterPlugin: PhaserRaycaster;
    raycaster: Raycaster | undefined;
    hookRay: Raycaster.Ray | undefined;
    cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    player: Phaser.Physics.Arcade.Sprite | undefined;
    hook: Phaser.GameObjects.Rectangle | undefined;
    hookLine: Phaser.GameObjects.Line | undefined;
    MIN_JUMP_SPEED = 0;
    MAX_JUMP_SPEED = 240;
    currentJumpSpeed = 20;
    JUMP_SPEED_INCREMENT = 20;
    shiftMode = false;
    canEnterShiftMode = true;
    hookOffset = {
        x: 2,
        y: 6,
    };
    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("star", "star.png");
        this.load.image("background", "bg.png");
        this.load.image("logo", "logo.png");
        this.load.image("ground", "ground.png");

        this.load.image("base_tiles", "tiles.png");
        this.load.tilemapTiledJSON("tilemap", "map.json");

        // Player
        this.load.spritesheet("player_sprite", "player.bmp", {
            frameWidth: 8,
            frameHeight: 12,
        });
    }

    create() {
        const map = this.make.tilemap({ key: "tilemap" });
        map.addTilesetImage("cave", "base_tiles");

        const bg = map.createLayer("bg", "cave", -110, -64);
        const ground = map.createLayer("Ground", "cave", -110, -64);
        ground?.setCollisionByProperty({ collides: true });

        // Player

        this.player = this.physics.add
            .sprite(90, 50, "player_sprite")
            .setOrigin(0, 0);
        this.player.setBounce(0.2);

        if (ground) {
            this.physics.add.collider(this.player, ground);
        }

        // ! raycast for hook

        // this.raycaster = this.raycasterPlugin.createRaycaster({ debug: true });
        // this.raycaster.mapGameObjects(ground, false);

        // this.hookRay = this.raycaster.createRay();
        // this.hookRay.setOrigin(this.player.x, this.player.y);
        // this.hookRay.setAngle(this.player.rotation);

        //add a green rectangle

        // this.hook = this.add.rectangle(0, 0, 4, 2, 0x00ff00).setOrigin(0, 0);
        // this.hookLine = this.add
        //     .line(10, 30, 0, 0, 10, 15, 0x00ff00)
        //     .setOrigin(0, 0);

        this.cursor = this.input.keyboard?.createCursorKeys();

        const jumpTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.currentJumpSpeed < this.MAX_JUMP_SPEED) {
                    this.currentJumpSpeed += this.JUMP_SPEED_INCREMENT;
                }
            },
            loop: true,
            paused: true,
        });

        this.input.keyboard?.on("keydown-SPACE", () => {
            console.log("space down");
            jumpTimer.paused = false;
        });

        this.input.keyboard?.on("keyup-SPACE", () => {
            console.log("space up");
            jumpTimer.paused = true;
            if (this.player?.body?.blocked.down) {
                this.player?.setVelocityY(-this.currentJumpSpeed);
            }
            this.currentJumpSpeed = this.MIN_JUMP_SPEED;
        });

        this.input.keyboard?.on("keydown-SHIFT", () => {
            if (this.player?.body?.blocked.down) {
                return;
            }
            if (!this.canEnterShiftMode) {
                return;
            }
            this.canEnterShiftMode = false;
            this.shiftMode = true;
            setTimeout(() => {
                this.shiftMode = false;
            }, 1500);
        });

        this.input.keyboard?.on("keyup-SHIFT", () => {
            this.shiftMode = false;
        });
        // * 💗💗💗💗😻😻😻😻 <3 :* :~)
        EventBus.emit("current-scene-ready", this);
    }

    update() {
        if (this.player) {
            this.cameras.main.startFollow(this.player, false, 1, 1, 0, 15);
        }

        if (this.hook && this.player) {
            this.hook.x = this.player.x + this.hookOffset.x;
            this.hook.y = this.player.y + this.hookOffset.y;
            this.hook.rotation = this.player.rotation;
            this.hook.visible = this.shiftMode;
        }

        if (this.cursor) {
            if (this.cursor.left?.isDown && !this.shiftMode) {
                this.player?.setVelocityX(-MOVE_SPEED);
            } else if (this.cursor.right?.isDown && !this.shiftMode) {
                this.player?.setVelocityX(MOVE_SPEED);
            } else {
                this.player?.setVelocityX(0);
            }

            if (this.cursor.up?.isDown && this.player?.body?.blocked.down) {
                this.player?.setVelocityY(-JUMP_SPEED);
            }
        }

        if (this.cursor?.left?.isDown && this.shiftMode) {
            this.hookOffset.x = -4;
        } else if (this.cursor?.right?.isDown && this.shiftMode) {
            this.hookOffset.x = 8;
        } else {
            this.hookOffset.x = 2;
        }

        if (this.shiftMode && !this.player?.body?.blocked.down) {
            this.player?.setVelocityY(0);
        }

        if (this.player?.body?.blocked.down) {
            this.canEnterShiftMode = true;
        }

        // if (this.hookLine && this.player) {
        //     // this.hookLine.setX(this.player.x + 4);
        //     // this.hookLine.setY(this.player.y + 6);
        //     this.hookLine.setTo(
        //         this.player.x - 6,
        //         this.player.y - 25,
        //         this.hookLine.x,
        //         this.hookLine.y
        //     );
        // }

        // ! raycast
        // if (this.hookRay && this.player) {
        //     this.hookRay.setOrigin(this.player.x, this.player.y);
        //     this.hookRay.setAngleDeg(180);
        //     const intersection = this.hookRay.cast();
        //     if (intersection) {
        //         console.log(intersection);
        //         const hitObject = intersection.valueOf();
        //         console.log(hitObject);
        //     }
        // }
    }
}