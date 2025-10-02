#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_tResolution;
uniform sampler2D u_texture;
// Mapped audio values (0.0 to 1.0)
uniform float u_bass; 
uniform float u_mid;

// Custom uniforms from the debug panel
uniform float u_bassFrequency;
uniform float u_midAmplitude;


mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
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

  uv -= vec2(0.5);
  uv = scale(vec2(0.91)) * uv;
  uv += vec2(0.5);

  // The final frequency and amplitude are a combination of the base setting and the audio input
  float finalFreq = u_bassFrequency + u_bass * 10.0; // Bass affects frequency
  float finalAmp = u_midAmplitude + u_mid * 0.1; // Mid affects amplitude

  float wave_x = sin(uv.x * finalFreq + u_time) * finalAmp;
  float wave_y = sin(uv.y * finalFreq / 2.0) * finalAmp;
  vec2 d = vec2(wave_x, wave_y);

  vec4 image = texture2D(u_texture, uv + d);

  gl_FragColor = image;
}

