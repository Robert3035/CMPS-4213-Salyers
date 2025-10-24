// --- Snowfall system --- //
const snowflakes = [];
const numFlakes = 150;
const flakeSize = 0.02;

// Create a small white square at a given position
function createSnowflake(x, y, z) {
  const x0 = x - flakeSize / 2;
  const x1 = x + flakeSize / 2;
  const y0 = y - flakeSize / 2;
  const y1 = y + flakeSize / 2;

  const vertices = new Float32Array([
    x0, y0, z,
    x1, y0, z,
    x1, y1, z,
    x0, y0, z,
    x1, y1, z,
    x0, y1, z
  ]);

  const color = [1.0, 1.0, 1.0];
  const colors = new Float32Array([
    ...color, ...color, ...color,
    ...color, ...color, ...color
  ]);

  // Create buffers for the snowflake
  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  return { vBuffer, cBuffer, x, y, z, speed: 0.002 + Math.random() * 0.002 };
}

// Initialize snowflakes across the scene
for (let i = 0; i < numFlakes; i++) {
  const x = Math.random() * 2 - 1; // between -1 and 1
  const y = Math.random() * 2 - 1; // between -1 and 1
  const z = Math.random() * 0.5 - 0.25; // small z offset (front/back)
  snowflakes.push(createSnowflake(x, y, z));
}

// Animation loop
function animateSnow() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw static scene (bricks, house, etc.)
  shapes.forEach(shape => {
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vBuffer);
    const positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.cBuffer);
    const colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    gl.drawArrays(gl.TRIANGLES, 0, shape.vertexCount);
  });

  // Update & draw snow
  snowflakes.forEach(flake => {
    flake.y -= flake.speed;
    if (flake.y < -1.1) {
      flake.y = 1.1;
      flake.speed = 0.002 + Math.random() * 0.002;
    }

    const x0 = flake.x - flakeSize / 2;
    const x1 = flake.x + flakeSize / 2;
    const y0 = flake.y - flakeSize / 2;
    const y1 = flake.y + flakeSize / 2;


    const vertices = new Float32Array([
      x0, y0, flake.z,
      x1, y0, flake.z,
      x1, y1, flake.z,
      x0, y0, flake.z,
      x1, y1, flake.z,
      x0, y1, flake.z
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, flake.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, flake.cBuffer);
    const colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  requestAnimationFrame(animateSnow);
}

animateSnow();
