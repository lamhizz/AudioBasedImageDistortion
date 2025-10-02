#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D u_displacementMap;
uniform sampler2D u_texture;
uniform float u_mid;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_tResolution;

// Custom uniform from debug panel
uniform float u_midResponse;

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

  // Sample the displacement map
  vec4 displacementTexture = texture2D(u_displacementMap, vTexCoord);

  // Calculate the displacement amount based on the map's brightness and audio
  float displacementStrength = (displacementTexture.r - 0.5) * u_mid * u_midResponse;
  
  // Apply the displacement
  vec2 displacedUV = uv + vec2(displacementStrength, displacementStrength);
  
  vec4 image = texture2D(u_texture, displacedUV);

  gl_FragColor = image;
}

