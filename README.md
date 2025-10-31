# Interactive Audio-Visual Album Experience 🎧

This project is an immersive, web-based audio-visual experience designed as an artist's album website. It leverages the **p5.js** library and **WebGL GLSL shaders** to create dynamic, audio-reactive image distortions that are unique to each track on the album. The user navigates the album through a sleek, interactive UI, placing the focus entirely on the visualizer.

---

## ✨ Features

*   **Data-Driven:** Album and shader data are loaded from external JSON files, making the project easily configurable.
*   **Dynamic Audio Visualization:** Real-time image distortion effects powered by **GLSL shaders** that react to the audio's frequency spectrum (**bass**, **mid**, **treble**).
*   **Full Album Experience:** A complete tracklist allows users to navigate through the entire album.
*   **Interactive Player Controls:** A modern, minimal UI for controlling the music: play/pause, next/previous track, volume control, mute, and fullscreen mode.
*   **Hover-Triggered UI:** The player controls and tracklist panel are hidden by default and appear on hover, keeping the focus on the visualizer.
*   **Modular Shader System:** An easily extendable system to add new, unique visual effects for different tracks.
*   **Responsive Design:** The experience is designed to work seamlessly across different screen sizes.

---

## 🏗️ Project Structure

The project is organized logically into several directories:

/
|-- audio/ # Contains all album track audio files (.mp3)
|-- css/
| |-- base.css # Base styles, layout, and animations
| |-- demo1.css # Specific styles for the album player UI
|-- fonts/ # Web fonts
|-- img/ # Image assets, including album art and UI icons
|-- js/
| |-- main.js # The core application logic (p5.js sketch)
|-- shaders/
| |-- base.vert # The Vertex Shader
| |-- *.frag # Fragment Shaders, each defining a unique visual effect
|-- album.json # Album track data
|-- shader-settings.json # Shader uniform settings
|-- index.html # Main HTML file
|-- README.md # This documentation file

---

## ⚙️ How It Works

The application is built on the synergy between the **p5.js** JavaScript library and **GLSL shaders** for high-performance rendering.

### Initialization (`index.html` & `js/main.js`)
*   `index.html` sets up the basic **DOM structure**.
*   `js/main.js` contains the main **p5.js Sketch**, which loads data from `album.json` and `shader-settings.json` and handles all application logic.

### Audio Analysis & Data Mapping (`draw()` loop)
1.  The `draw()` loop runs continuously.
2.  **p5.FFT (Fast Fourier Transform)** analyzes the audio signal in real-time.
3.  The energy of different frequency bands (**bass**, **mid**) is calculated and passed to the active GLSL shader as **uniforms**.

### GLSL Shader Rendering
*   The **Vertex Shader** (`base.vert`) creates a 2D plane.
*   The **Fragment Shader** (`*.frag`) runs for every pixel on the canvas, manipulating the texture coordinates of the source image based on the audio data.

---

## 🛠️ How to Add a New Track

1.  **Add Assets:** Place the new audio file in `/audio` and the image in `/img`.
2.  **Update `album.json`:** Add a new entry to the `album.json` file with the track's information:

    ```json
    {
      "artist": "Artist Name",
      "title": "Track Title",
      "audioPath": "audio/new-track.mp3",
      "imgPath": "img/new-image.jpg",
      "shaderPath": "shaders/your-shader.frag"
    }
    ```

---

## 🏃 Running Locally

To run this project, you **must** serve the files through a **local web server** due to browser security policies (CORS).

### Using VS Code
The easiest way is to use an extension like **"Live Server"**.

### Using Python
Navigate to the project's root directory in your terminal and run:

```bash
# For Python 3
python -m http.server
```

### Using Node.js
If you have Node.js, you can use a simple server package:

```bash
npm install -g http-server
http-server
```

Then, open your browser and navigate to the local address provided (e.g., `http://localhost:8080`).
