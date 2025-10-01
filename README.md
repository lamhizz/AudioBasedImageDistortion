# Interactive Audio-Visual Album Experience 🎧
This project is an immersive, web-based audio-visual experience designed as an artist's album website. It leverages the **p5.js** library and **WebGL GLSL shaders** to create dynamic, audio-reactive image distortions that are unique to each track on the album. The user navigates the album through a sleek, interactive UI, placing the focus entirely on the visualizer.

---

## ✨ Features

* **Dynamic Audio Visualization:** Real-time image distortion effects powered by **GLSL shaders** that react to the audio's frequency spectrum (**bass**, **mid**, **treble**).
* **Full Album Experience:** A complete tracklist allows users to navigate through the entire album.
* **Interactive Player Controls:** A modern, minimal UI for controlling the music: play/pause, next/previous track, volume control, mute, and fullscreen mode.
* **Hover-Triggered UI:** The player controls and tracklist panel are hidden by default and appear on hover, keeping the focus on the visualizer.
* **Modular Shader System:** An easily extendable system to add new, unique visual effects for different tracks.
* **Responsive Design:** The experience is designed to work seamlessly across different screen sizes.

---

## 🏗️ Project Structure

The project is organized logically into several directories:

/
|-- audio/            # Contains all album track audio files (.mp3)
|-- css/
|   |-- base.css      # Base styles, layout, and animations for the UI framework
|   |-- demo1.css     # Specific styles for the album player UI components
|-- fonts/            # Web fonts used for the UI
|-- img/              # Image assets, including album art and UI icons (.jpg, .svg)
|-- js/
|   |-- demo1.js      # The core application logic (p5.js sketch)
|-- shaders/
|   |-- base.vert     # The Vertex Shader (standard 2D plane creation)
|   |-- *.frag        # Various Fragment Shaders, each defining a unique visual effect
|-- index.html        # The main HTML file that structures the application
|-- README.md         # This documentation file


---

## ⚙️ How It Works

The application is built on the synergy between the **p5.js** JavaScript library and **GLSL shaders** for high-performance rendering.

### Initialization (`index.html` & `js/demo1.js`)
* `index.html` sets up the basic **DOM structure**, including the container for the p5.js canvas, player controls, and the tracklist.
* `js/demo1.js` contains the main **p5.js Sketch**, which acts as the engine for the entire experience.

### Audio Analysis & Data Mapping (`draw()` loop)
1.  The `draw()` loop runs continuously (typically 60 FPS).
2.  Inside the loop, **p5.FFT (Fast Fourier Transform)** is used to analyze the audio signal in real-time.
3.  The energy (amplitude) of different frequency bands (**bass**, **mid**, and **treble**) is calculated.
4.  The raw energy values (0-255) are **mapped** to custom ranges that are more suitable for visual effects. Crucially, an **if/else if block** checks which shader is active and applies a custom mapping profile, allowing each visualizer to react differently to the audio.
5.  These mapped values, along with `u_time`, are passed to the active GLSL shader as **uniforms**.

### GLSL Shader Rendering
* The **Vertex Shader** (`base.vert`) simply creates a 2D plane that fills the entire canvas.
* The **Fragment Shader** (`*.frag`) is where the visual magic happens. It runs for every pixel on the canvas, receiving the uniforms from the JavaScript code.
* It uses these uniforms to manipulate the texture coordinates (`vTexCoord`) of the source image (`u_texture`), effectively **distorting**, **pixelating**, or **color-shifting** the image based on the audio data.

---

## 🧠 Key Code Components

### `js/demo1.js`

* **`album` Array:** The central "database" for the project. It's an array of objects, where each object defines a track's `title`, `audioPath`, `imgPath`, and critically, its **`shaderPath`**.
* **`playTrack(index)` function:** The core function for changing songs. It stops the current audio, **asynchronously loads** the new track's assets (audio, image, and shader), updates the UI, sets the new shader as active, and starts playback.
* **Shader-Specific Settings Block (in `draw()`):** The critical `if/else if` structure that checks `album[currentTrackIndex].shaderPath` to apply a unique mapping profile for each shader, allowing for bespoke audio-reactivity.

### `/shaders/*.frag`

* **Fragment Shaders:** Small, powerful programs written in **GLSL** that run directly on the GPU.
* **Key Uniforms:**
    * `uniform sampler2D u_texture;`: The main image (album art).
    * `uniform vec2 u_resolution;`: The dimensions of the canvas.
    * `uniform float u_time;`: A continuously increasing value for animating non-reactive effects (e.g., waves).
    * `uniform float u_bass;`, `uniform float u_mid;`, `uniform float u_tremble;`: The mapped audio frequency data. These are the primary drivers of the audio-reactivity.

---

## 🛠️ How to Add a New Shader Effect

The modular design makes adding new visualizations straightforward:

1.  **Create the `.frag` file:** Write your new GLSL fragment shader and save it in the `/shaders` directory (e.g., `shaders/vortex.frag`).

2.  **Update the `album` Array:** In `js/demo1.js`, find the track you want to apply the new effect to and change its `shaderPath` property:

    ```javascript
    // Before:
    {
      title: 'Synthetic Dawn',
      // ...
      shaderPath: 'shaders/d8.frag'
    }

    // After:
    {
      title: 'Synthetic Dawn',
      // ...
      shaderPath: 'shaders/vortex.frag' // <-- New path
    }
    ```

3.  **Add Custom Mappings (Recommended):** In the `draw()` loop in `js/demo1.js`, add a new `else if` condition to create a custom mapping profile for your new shader. This provides precise control over its audio-reactivity:

    ```javascript
    // ... inside draw()

    const currentShader = album[currentTrackIndex].shaderPath;

    if (currentShader === 'shaders/pixelation.frag') {
        // ... pixelation settings
    } else if (currentShader === 'shaders/vortex.frag') { // <-- Your new block
        mapBass = p.map(bass, 0, 255, 0.1, 1.0); // e.g., control swirl intensity
        mapMid = p.map(mid, 0, 255, 0.0, 5.0);   // e.g., control swirl speed
        mapTremble = p.map(treble, 0, 255, 0.0, 0.05); // e.g., control color shift
    } else {
        // ... default settings
    }
    ```

---

## 🏃 Running Locally

To run this project, you **must** serve the files through a **local web server**. Simply opening the `index.html` file will not work due to browser security policies (**CORS**) that prevent JavaScript from loading local files (like audio, images, and shaders) using `file://` protocols.

### Using VS Code
The easiest way is to use an extension like **"Live Server"**.

### Using Python
If you have Python installed, navigate to the project's root directory in your terminal and run:

```bash
# For Python 3
python -m http.server
Using Node.js
If you have Node.js, you can install a simple server package:

Bash

npm install -g http-server
http-server
Then, open your browser and navigate to the local address provided (e.g., http://localhost:8080).
