"use strict";

const canvas = document.getElementById("gl-canvas");
const gl = canvas.getContext("webgl2");

if (!gl) alert("WebGL2 not supported");

// Square vertices
const vertices = [
    vec3(-0.5, -0.5, 0.0),
    vec3(0.5, -0.5, 0.0),
    vec3(0.5, 0.5, 0.0),
    vec3(-0.5, 0.5, 0.0)
];

const indices = [0, 1, 2, 0, 2, 3];

let rotationX = 0, rotationY = 0, rotationZ = 0;
let tx = 0, ty = 0;
let sx = 1, sy = 1;

// --- Shaders ---
const vsSource = `#version 300 es
in vec3 aPosition;
uniform mat4 uModel;
void main() {
    gl_Position = uModel * vec4(aPosition, 1.0);
}
`;

const fsSource = `#version 300 es
precision mediump float;
out vec4 fragColor;
void main() {
    fragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// Buffers
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

const aPosition = gl.getAttribLocation(program, "aPosition");
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

const iBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

const uModel = gl.getUniformLocation(program, "uModel");

// Button Events
document.getElementById("xButton").onclick = () => { rotationX += 15; render(); };
document.getElementById("yButton").onclick = () => { rotationY += 15; render(); };
document.getElementById("zButton").onclick = () => { rotationZ += 15; render(); };

document.getElementById("leftButton").onclick = () => { tx -= 0.1; render(); };
document.getElementById("rightButton").onclick = () => { tx += 0.1; render(); };
document.getElementById("upButton").onclick = () => { ty += 0.1; render(); };
document.getElementById("downButton").onclick = () => { ty -= 0.1; render(); };

document.getElementById("scaleUpButton").onclick = () => { sx *= 1.2; sy *= 1.2; render(); };
document.getElementById("scaleDownButton").onclick = () => { sx /= 1.2; sy /= 1.2; render(); };

// Render
function render() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Transformations
    let model = mult(
        translate(tx, ty, 0),
        mult(
            mult(rotateX(rotationX), rotateY(rotationY)),
            mult(rotateZ(rotationZ), scale(sx, sy, 1))
        )
    );

    gl.uniformMatrix4fv(uModel, false, flatten(model));
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// Initial render
render();
