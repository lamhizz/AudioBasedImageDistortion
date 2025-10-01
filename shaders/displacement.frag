#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform sampler2D u_displacementMap; // The new texture for the map
uniform vec2 u_tResolution;
uniform float u_time;
uniform float u_mid; // This will control the strength of the displacement

void main() {
  // Adjust texture coordinates to prevent stretching
  vec2 ratio = vec2(
    min((u_resolution.x / u_resolution.y) / (u_tResolution.x / u_tResolution.y), 1.0),
    min((u_resolution.y / u_resolution.x) / (u_tResolution.y / u_tResolution.x), 1.0)
  );

  vec2 uv = vec2(
    vTexCoord.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vTexCoord.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
  
  uv.y = 1.0 - uv.y;

  // Sample the displacement map
  // The .r channel is enough since it's a grayscale image
  float displacementValue = texture2D(u_displacementMap, vTexCoord).r;
  
  // Create an offset vector. (displacementValue - 0.5) allows it to push pixels
  // in both positive and negative directions.
  vec2 offset = vec2(displacementValue - 0.5); 

  // The strength of the effect is controlled by the mid-range audio frequencies
  float displacementStrength = u_mid * 0.5;

  // Apply the displacement to the texture coordinates of the main image
  vec2 displacedUV = uv + offset * displacementStrength;
  
  vec4 image = texture2D(u_texture, displacedUV);

  gl_FragColor = image;
}
