#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform vec2 u_tResolution;
uniform float u_time;
uniform float u_mid; // We'll use the mid-range frequencies to control noise intensity

// A simple function to generate pseudo-random noise
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

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

  // Get the original color from the texture
  vec4 imageColor = texture2D(u_texture, uv);
  
  // Generate a random noise value and scale it by the mid-range audio frequency
  // Subtracting 0.5 centers the noise so it can darken as well as lighten the image
  float noise = (random(uv + u_time) - 0.5) * u_mid;
  
  // Add the noise to the original image color
  vec3 noisyColor = imageColor.rgb + noise;

  gl_FragColor = vec4(noisyColor, imageColor.a);
}
