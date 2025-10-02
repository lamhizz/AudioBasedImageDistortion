#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_tResolution;
uniform float u_bass; // Mapped from 0.0 to 1.0

// Custom uniforms from the debug panel
uniform float u_baseSize;
uniform float u_bassResponse;

void main() {
  vec2 ratio = vec2(
    min((u_resolution.x / u_resolution.y) / (u_tResolution.x / u_tResolution.y), 1.0),
    min((u_resolution.y / u_resolution.x) / (u_tResolution.y / u_tResolution.x), 1.0)
  );

  vec2 uv = vec2(
    vTexCoord.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vTexCoord.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  // Flip the Y-coordinate to correctly orient the source image
  uv.y = 1.0 - uv.y;

  // The final pixel size is a combination of the base setting and the audio input
  float pixelSize = u_baseSize + u_bass * u_bassResponse;
  
  vec2 pixelatedUV = floor(uv * pixelSize) / pixelSize;

  gl_FragColor = texture2D(u_texture, pixelatedUV);
}

