"use strict";

// WebGL setup
let canvas = document.getElementById("gl-canvas");
let gl = canvas.getContext("webgl2");
if (!gl) alert("WebGL 2 not supported");

// Vertices of a unit square
const vertices = [
    vec4(-0.5, -0.5, 0.0, 1.0),
    vec4( 0.5, -0.5, 0.0, 1.0),
    vec4( 0.5,  0.5, 0.0, 1.0),
    vec4(-0.5,  0.5, 0.0, 1.0)
];

// Vertex Shader
const vertexShaderSource = `#version 300 es
in vec4 aPosition;
uniform mat4 uModel;
void main() { gl_Position = uModel * aPosition; }`;

// Fragment Shader
const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 outColor;
uniform vec4 uColor;
void main() { outColor = uColor; }`;

// Compile shader helper
function compileShader(src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw "Shader compile error: " + gl.getShaderInfoLog(shader);
    return shader;
}

// Program setup
let vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
let fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
let program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw "Program link error: " + gl.getProgramInfoLog(program);
gl.useProgram(program);

// Buffer vertices
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
let aPosition = gl.getAttribLocation(program, "aPosition");
gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

// Uniform locations
let uModel = gl.getUniformLocation(program, "uModel");
let uColor = gl.getUniformLocation(program, "uColor");

// Squares array
let squares = [
    { translation: vec3(-0.5, -0.5, 0), scale: 0.3, color: vec4(1,0,0,1) },
    { translation: vec3( 0.5, -0.5, 0), scale: 0.2, color: vec4(0,1,0,1) },
    { translation: vec3(-0.5,  0.5, 0), scale: 0.25, color: vec4(0,0,1,1) },
    { translation: vec3( 0.5,  0.5, 0), scale: 0.35, color: vec4(1,1,0,1) }
];

// Global transformations
let globalTranslation = vec3(0,0,0);
let globalScale = 1.0;

// Render function
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let sq of squares) {
        let model = mat4();
        model = mult(model, translate(sq.translation[0]+globalTranslation[0],
                                      sq.translation[1]+globalTranslation[1],
                                      sq.translation[2]+globalTranslation[2]));
        model = mult(model, scale(sq.scale*globalScale, sq.scale*globalScale, 1));
        gl.uniformMatrix4fv(uModel, false, flatten(model));
        gl.uniform4fv(uColor, flatten(sq.color));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    requestAnimationFrame(render);
}

// Button event listeners
document.getElementById("xButton").onclick = () => globalTranslation[0] += 0.1;
document.getElementById("yButton").onclick = () => globalTranslation[1] += 0.1;
document.getElementById("downButton").onclick = () => globalTranslation[1] -= 0.1;
document.getElementById("leftButton").onclick = () => globalTranslation[0] -= 0.1;
document.getElementById("scaleUp").onclick = () => globalScale *= 1.2;
document.getElementById("scaleDown").onclick = () => globalScale /= 1.2;

gl.clearColor(1.0,1.0,1.0,1.0);
render();