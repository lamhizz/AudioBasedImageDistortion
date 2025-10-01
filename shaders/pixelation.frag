#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform vec2 u_tResolution;
uniform float u_bass; // We'll use bass to control pixel size

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

  // The 'u_bass' uniform will control the pixel size.
  // A higher bass value will result in a smaller number (bigger pixels).
  float pixelSize = u_bass;
  
  // Quantize the texture coordinates to create the pixelated effect
  vec2 pixelatedUV = floor(uv * pixelSize) / pixelSize;
  
  vec4 image = texture2D(u_texture, pixelatedUV);

  gl_FragColor = image;
}
