const frag = `
#define SHADER_NAME POST_TINT

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 outTexCoord;
uniform sampler2D uMainSampler;

void main() {
  gl_FragColor = texture2D(uMainSampler, outTexCoord);
  //gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

export class PostFxPipeline extends Phaser.Renderer.WebGL.Pipelines
    .PostFXPipeline {
    constructor(game: Phaser.Game) {
        super({
            game,
            fragShader: frag,
        });
    }
}
