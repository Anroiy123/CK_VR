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
    "void main(void) {",
    "  vec2 uv = vUv;",
    "",
    "  float scrollX = uTime * 0.025;",
    "  float scrollY = uTime * 0.015;",
    "",
    "  float gridScale = 16.0;",
    "  vec2 gridUv = uv * gridScale + vec2(scrollX, scrollY);",
    "",
    "  vec2 lineWidth = vec2(0.035, 0.035);",
    "  vec2 grid = abs(fract(gridUv) - 0.5);",
    "  vec2 gridLine = 1.0 - smoothstep(vec2(0.0), lineWidth, grid);",
    "",
    "  float lineValue = max(gridLine.x, gridLine.y);",
    "",
    "  vec2 gridUvSub = uv * gridScale * 4.0 + vec2(scrollX * 0.5, scrollY * 0.5);",
    "  vec2 gridSub = abs(fract(gridUvSub) - 0.5);",
    "  vec2 gridLineSub = 1.0 - smoothstep(vec2(0.0), vec2(0.012), gridSub);",
    "  float lineValueSub = max(gridLineSub.x, gridLineSub.y) * 0.18;",
    "",
    "  vec3 gridColor = vec3(0.302, 0.671, 0.969);",
    "",
    "  vec2 center = vec2(0.5, 0.5);",
    "  float dist = length(uv - center);",
    "  float edgeFade = 1.0 - smoothstep(0.35, 0.6, dist);",
    "",
    "  float alpha = (lineValue * 0.55 + lineValueSub) * edgeFade;",
    "",
    "  gl_FragColor = vec4(gridColor, alpha);",
    "}"
  ].join("\n");

  AFRAME.registerComponent("grid-floor", {
    init: function init() {
      var geom = new THREE.PlaneGeometry(24, 24);
      var mat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          uTime: { value: 0 }
        },
        transparent: true,
        depthWrite: false
      });
      var mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.02;
      this.el.setObject3D("gridFloor", mesh);
    },

    tick: function tick(time) {
      var obj = this.el.getObject3D("gridFloor");
      if (obj && obj.material && obj.material.uniforms) {
        obj.material.uniforms.uTime.value = time / 1000;
      }
    }
  });
})();
