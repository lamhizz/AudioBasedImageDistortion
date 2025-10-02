// --- Global Overlay Shader ---
// This shader applies a consistent film grain and light leak effect on top of the main visual.

#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;

// Uniforms passed from the p5.js sketch
uniform sampler2D u_mainTexture; 
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse; 
// Custom uniforms from the debug panel
uniform float u_grainIntensity;
uniform float u_grainSize;
uniform float u_leakStrength;
uniform float u_leakRed;
uniform float u_leakGreen;
uniform float u_leakBlue;


// A better hashing function for a more organic random pattern.
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    // Correctly flip the texture from the offscreen buffer
    vec2 finalUV = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    vec4 originalColor = texture2D(u_mainTexture, finalUV);

    // --- Analog Film Grain Effect ---
    float grainTime = u_time * 24.0; 
    // Use u_grainSize to control the scale of the noise pattern
    vec2 grainCoords = (vTexCoord + fract(grainTime)) * u_resolution.y / u_grainSize;
    
    // Use the custom uniform for intensity
    float grain = (hash(grainCoords) - 0.5) * u_grainIntensity;

    // --- Luminance-Dependent Grain ---
    float luminance = dot(originalColor.rgb, vec3(0.299, 0.587, 0.114));
    float grainVisibility = smoothstep(0.0, 0.2, luminance) * (1.0 - smoothstep(0.8, 1.0, luminance));
    
    originalColor.rgb += grain * grainVisibility;


    // --- Light Leak Effect (Mouse-reactive) ---
    // Use custom uniforms for the leak color
    vec3 leakColor = vec3(u_leakRed, u_leakGreen, u_leakBlue); 
    float leakPosition = u_mouse.x + sin(u_time * 0.1) * 0.1; 
    float leak = smoothstep(0.0, 0.5, abs(vTexCoord.x - mod(leakPosition, 1.0)));
    // Use the custom uniform for strength
    originalColor.rgb += leakColor * (1.0 - leak) * u_leakStrength;

    gl_FragColor = originalColor;
}

