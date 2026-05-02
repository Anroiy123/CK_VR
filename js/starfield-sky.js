(function () {
  if (!window.AFRAME) {
    return;
  }

  var vertexShader = [
    "varying vec2 vUv;",
    "void main(void) {",
    "  vUv = uv;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");

  var fragmentShader = [
    "precision highp float;",
    "varying vec2 vUv;",
    "uniform float uTime;",
    "",
    "float hash(vec2 p) {",
    "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);",
    "}",
    "",
    "void main(void) {",
    "  vec2 uv = vUv;",
    "",
    "  vec3 bottomColor = vec3(0.0392, 0.0, 0.0824);",
    "  vec3 topColor = vec3(0.0196, 0.051, 0.102);",
    "  vec3 bg = mix(bottomColor, topColor, uv.y);",
    "",
    "  vec3 starColor = vec3(0.0);",
    "",
    "  vec2 gridRes = vec2(32.0, 32.0);",
    "  vec2 cell = floor(uv * gridRes);",
    "  vec2 cellUV = fract(uv * gridRes) - 0.5;",
    "",
    "  float h = hash(cell);",
    "  float h2 = hash(cell + vec2(1.0, 0.0));",
    "  float h3 = hash(cell + vec2(0.0, 1.0));",
    "  float h4 = hash(cell + vec2(2.0, 2.0));",
    "",
    "  vec2 starPos = vec2(h - 0.5, h2 - 0.5);",
    "  float brightness = 0.3 + 0.7 * h3;",
    "  float twinkleSpeed = 1.0 + 3.0 * h4;",
    "  float twinkle = 0.6 + 0.4 * sin(uTime * twinkleSpeed + h * 6.2832);",
    "",
    "  float d = length(cellUV - starPos);",
    "  float size = 0.01 + 0.05 * h3;",
    "  float star = (1.0 - smoothstep(0.0, size, d)) * brightness * twinkle;",
    "",
    "  vec3 starTint = mix(vec3(1.0), vec3(0.7, 0.8, 1.0), h);",
    "  starTint = mix(starTint, vec3(1.0, 0.9, 0.6), h4 * 0.3);",
    "  starColor += star * starTint;",
    "",
    "  vec2 gridRes2 = vec2(40.0, 40.0);",
    "  vec2 cell2 = floor(uv * gridRes2 + 17.0);",
    "  vec2 cellUV2 = fract(uv * gridRes2 + 17.0) - 0.5;",
    "  float h5 = hash(cell2);",
    "  float h6 = hash(cell2 + vec2(3.0, 7.0));",
    "  float h7 = hash(cell2 + vec2(11.0, 5.0));",
    "  float brightness2 = 0.1 + 0.4 * h6;",
    "  float twinkle2 = 0.6 + 0.4 * sin(uTime * (1.0 + 2.0 * h7) + h5 * 6.2832);",
    "  vec2 starPos2 = vec2(h5 - 0.5, h6 - 0.5);",
    "  float d2 = length(cellUV2 - starPos2);",
    "  float star2 = (1.0 - smoothstep(0.0, 0.025, d2)) * brightness2 * twinkle2;",
    "  starColor += star2 * vec3(0.8, 0.85, 1.0);",
    "",
    "  gl_FragColor = vec4(bg + starColor, 1.0);",
    "}"
  ].join("\n");

  AFRAME.registerComponent("starfield-sky", {
    init: function init() {
      var geom = new THREE.SphereGeometry(80, 64, 32);
      var mat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          uTime: { value: 0 }
        },
        side: THREE.BackSide,
        depthWrite: false
      });
      var mesh = new THREE.Mesh(geom, mat);
      this.el.setObject3D("starfield", mesh);
      this.el.setAttribute("geometry", "skipCache: true");
    },

    tick: function tick(time) {
      var obj = this.el.getObject3D("starfield");
      if (obj && obj.material && obj.material.uniforms) {
        obj.material.uniforms.uTime.value = time / 1000;
      }
    }
  });
})();
