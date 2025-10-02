#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_tResolution;
uniform float u_mid; // Mapped from 0.0 to 1.0
uniform float u_time;

// Custom uniform from the debug panel
uniform float u_midResponse;

// A simple random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

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
  
  vec4 color = texture2D(u_texture, uv);
  
  // The final noise amount is a combination of the base setting and the audio input
  float noiseAmount = u_mid * u_midResponse;
  
  float noise = (random(uv + u_time) - 0.5) * noiseAmount;
  
  color.rgb += noise;
  
  gl_FragColor = color;
}

