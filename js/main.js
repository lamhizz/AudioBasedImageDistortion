// --- Constants and State ---
const SETTINGS_KEY = 'shaderSettings_InsomniaAlbum';
let album = [];
let shaderSettings = {};
let currentTrackIndex = 0;
let isPlaying = false;
let currentVolume = 1;

/**
 * The main p5.js sketch.
 * @param {p5} p - The p5.js instance.
 */
const s = (p) => {
  // --- Sketch-specific variables ---
  let demo1Shader, img, fft, audio, displacementMap, backgroundNoise;
  let overlayShader, offscreenBuffer;

  /**
   * Loads initial data from JSON files.
   */
  const loadInitialAssets = async () => {
    [album, shaderSettings] = await Promise.all([
      p.loadJSON('album.json'),
      p.loadJSON('shader-settings.json')
    ]);
  };

  /**
   * Loads all assets for a given track.
   * @param {object} track - The track object from album.json.
   * @returns {Promise<Array>} - A promise that resolves with an array of loaded assets.
   */
  const loadTrackAssets = async (track) => {
    const promises = [
      p.loadSound(track.audioPath),
      p.loadImage(track.imgPath),
      p.loadShader('shaders/base.vert', track.shaderPath),
    ];
    if (track.displacementMapPath) {
      promises.push(p.loadImage(track.displacementMapPath));
    }
    return Promise.all(promises);
  };

  /**
   * p5.js preload function.
   */
  p.preload = async () => {
    await loadInitialAssets();
    UI.showLoading();
    const track = album[0];
    [p.audio, img, demo1Shader, displacementMap] = await loadTrackAssets(track);
    overlayShader = await p.loadShader('shaders/base.vert', 'shaders/overlay.frag');
    backgroundNoise = await p.loadSound('audio/background-noise.mp3');
    UI.hideLoading();
  };

  /**
   * p5.js setup function.
   */
  p.setup = () => {
    p.pixelDensity(1);
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    canvas.parent('content');
    offscreenBuffer = p.createGraphics(p.windowWidth, p.windowHeight, p.WEBGL);

    Settings.load();
    UI.populateTracklist();
    UI.updateTrackInfo();
    UI.createDebugPanel();
    UI.initializeEventListeners();

    fft = new p5.FFT();
    fft.setInput(audio);
  };

  /**
   * p5.js draw function.
   */
  p.draw = () => {
    if (!demo1Shader || !img || img.width === 0 || !overlayShader) return;

    fft.analyze();
    const bass = fft.getEnergy("bass");
    const mid = fft.getEnergy("mid");
    const mapBass = p.map(bass, 0, 255, 0.0, 1.0);
    const mapMid = p.map(mid, 0, 255, 0.0, 1.0);

    // --- Main Shader Pass ---
    offscreenBuffer.shader(demo1Shader);
    demo1Shader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    demo1Shader.setUniform('u_texture', img);
    demo1Shader.setUniform('u_tResolution', [img.width, img.height]);
    demo1Shader.setUniform('u_time', p.frameCount / 20);
    demo1Shader.setUniform('u_bass', mapBass);
    demo1Shader.setUniform('u_mid', mapMid);
    if (displacementMap) {
      demo1Shader.setUniform('u_displacementMap', displacementMap);
    }
    const currentShaderName = album[currentTrackIndex].shaderPath.split('/').pop();
    if (shaderSettings[currentShaderName]) {
      for (const paramName in shaderSettings[currentShaderName]) {
        demo1Shader.setUniform(`u_${paramName}`, shaderSettings[currentShaderName][paramName].value);
      }
    }
    offscreenBuffer.rect(0, 0, p.width, p.height);

    // --- Overlay Shader Pass ---
    p.shader(overlayShader);
    let mouseX = p.map(p.mouseX, 0, p.width, 0, 1.0);
    let mouseY = p.map(p.mouseY, 0, p.height, 0, 1.0);
    overlayShader.setUniform('u_mainTexture', offscreenBuffer);
    overlayShader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    overlayShader.setUniform('u_time', p.frameCount / 60);
    overlayShader.setUniform('u_mouse', [mouseX, mouseY]);
    if (shaderSettings['overlay.frag']) {
      for (const paramName in shaderSettings['overlay.frag']) {
        overlayShader.setUniform(`u_${paramName}`, shaderSettings['overlay.frag'][paramName].value);
      }
    }
    p.rect(0, 0, p.width, p.height);
  };

  /**
   * p5.js windowResized event handler.
   */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    offscreenBuffer.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  /**
   * p5.js keyPressed event handler.
   */
  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') {
      document.getElementById('debug-panel').classList.toggle('visible');
    }
  };

  /**
   * Global sketch API.
   */
  window.sketch = {
    p,
    /**
     * Plays a track by its index.
     * @param {number} index - The index of the track in the album array.
     */
    playTrack: async (index) => {
      if (index < 0 || index >= album.length) return;
      if (audio && audio.isPlaying()) {
        audio.stop();
      }

      UI.showLoading();
      currentTrackIndex = index;
      const track = album[currentTrackIndex];

      [p.audio, img, demo1Shader, displacementMap] = await loadTrackAssets(track);

      fft.setInput(p.audio);
      const volumeSlider = document.getElementById('volume-slider');
      p.audio.setVolume(parseFloat(volumeSlider.value));
      UI.updateTrackInfo();

      if (isPlaying || document.body.classList.contains('start-anim')) {
        audio.loop();
        isPlaying = true;
        document.getElementById('play-pause-btn').querySelector('.material-symbols-outlined').textContent = 'pause';
      }
      UI.hideLoading();
    },
    /**
     * Toggles play/pause state.
     */
    togglePlayPause: () => {
      if (p.audio && p.audio.isLoaded()) {
        const playPauseIcon = document.getElementById('play-pause-btn').querySelector('.material-symbols-outlined');
        if (p.audio.isPlaying()) {
          p.audio.pause();
          isPlaying = false;
          playPauseIcon.textContent = 'play_arrow';
        } else {
          p.audio.loop();
          isPlaying = true;
          playPauseIcon.textContent = 'pause';
        }
      }
    },
    /**
     * Toggles mute state.
     */
    toggleMute: () => {
      const muteIcon = document.getElementById('toggle-btn').querySelector('.material-symbols-outlined');
      const volumeSlider = document.getElementById('volume-slider');
      if (p.audio.getVolume() > 0) {
        currentVolume = p.audio.getVolume();
        p.audio.setVolume(0);
        volumeSlider.value = 0;
        muteIcon.textContent = 'volume_off';
      } else {
        p.audio.setVolume(currentVolume);
        volumeSlider.value = currentVolume;
        muteIcon.textContent = 'volume_up';
      }
    },
    /**
     * Gets the current track index.
     * @returns {number} - The current track index.
     */
    getCurrentTrackIndex: () => currentTrackIndex,
    /**
     * Gets the total number of tracks in the album.
     * @returns {number} - The album length.
     */
    getAlbumLength: () => album.length,
    /**
     * Starts the audio-visual experience.
     */
    startExperience: () => {
        document.body.classList.add('start-anim');
        sketch.togglePlayPause();
        if (backgroundNoise && !backgroundNoise.isPlaying()) {
            backgroundNoise.loop();
            backgroundNoise.setVolume(0.1);
        }
        const animTimeTotal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-time-total').replace('s', '')) * 1000;
        setTimeout(() => {
            document.body.classList.add('main-view-active');
            UI.resetToggleIdleTimer();
        }, animTimeTotal);
    }
  };
};

/**
 * UI Module.
 */
const UI = {
  /**
   * Populates the tracklist in the UI.
   */
  populateTracklist: () => {
    const tracklistEl = document.getElementById('tracklist');
    tracklistEl.innerHTML = '';
    album.forEach((track, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${track.imgPath}" alt="${track.title}" class="track-thumbnail">
        <span class="track-title">${track.title}</span>
      `;
      li.classList.add('track-item');
      if (index === currentTrackIndex) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => {
        sketch.playTrack(index);
      });
      tracklistEl.appendChild(li);
    });
  },
  /**
   * Updates the track info display.
   */
  updateTrackInfo: () => {
    document.getElementById('track-artist').textContent = `Now Playing`;
    document.getElementById('track-title').textContent = album[currentTrackIndex].title;
    document.body.style.backgroundImage = `url(${album[currentTrackIndex].imgPath})`;

    const tracklistItems = document.querySelectorAll('.track-item');
    tracklistItems.forEach((item, index) => {
      if (index === currentTrackIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },
  /**
   * Creates the debug panel.
   */
  createDebugPanel: () => {
    const container = document.getElementById('shader-controls-container');
    container.innerHTML = '';
    for (const shaderName in shaderSettings) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = shaderName;
      details.appendChild(summary);
      const content = document.createElement('div');
      content.classList.add('shader-controls-content');
      const params = shaderSettings[shaderName];
      for (const paramName in params) {
        const setting = params[paramName];
        const row = document.createElement('div');
        row.classList.add('control-row');
        const label = document.createElement('label');
        label.textContent = paramName;
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = setting.min;
        slider.max = setting.max;
        slider.step = setting.step;
        slider.value = setting.value;
        const valueSpan = document.createElement('span');
        valueSpan.textContent = setting.value.toFixed(2);
        slider.addEventListener('input', (e) => {
          const newValue = parseFloat(e.target.value);
          setting.value = newValue;
          valueSpan.textContent = newValue.toFixed(2);
          Settings.save();
        });
        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(valueSpan);
        content.appendChild(row);
      }
      details.appendChild(content);
      container.appendChild(details);
    }
  },
  /**
   * Shows the loading indicator.
   */
  showLoading: () => {
    document.getElementById('p5_loading').style.display = 'flex';
  },
  /**
   * Hides the loading indicator.
   */
  hideLoading: () => {
    document.getElementById('p5_loading').style.display = 'none';
  },
  /**
   * Resets the idle timer for UI toggles.
   */
  resetToggleIdleTimer: () => {
    // ... (idle timer logic)
  },
  /**
   * Initializes all UI event listeners.
   */
  initializeEventListeners: () => {
    document.getElementById('play-btn').addEventListener('click', () => sketch.startExperience());
    document.getElementById('play-pause-btn').addEventListener('click', () => sketch.togglePlayPause());
    document.getElementById('toggle-btn').addEventListener('click', () => sketch.toggleMute());
    document.getElementById('next-btn').addEventListener('click', () => {
      sketch.playTrack((sketch.getCurrentTrackIndex() + 1) % sketch.getAlbumLength());
    });
    document.getElementById('prev-btn').addEventListener('click', () => {
      sketch.playTrack((sketch.getCurrentTrackIndex() - 1 + sketch.getAlbumLength()) % sketch.getAlbumLength());
    });

    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.addEventListener('input', (e) => {
      if (sketch.p.audio) {
        const newVolume = parseFloat(e.target.value);
        sketch.p.audio.setVolume(newVolume);
        currentVolume = newVolume;
        const muteIcon = document.getElementById('toggle-btn').querySelector('.material-symbols-outlined');
        muteIcon.textContent = newVolume > 0 ? 'volume_up' : 'volume_off';
      }
    });

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => {
      const fsIcon = fullscreenBtn.querySelector('.material-symbols-outlined');
      if (!sketch.p.fullscreen()) {
        sketch.p.fullscreen(true);
        fsIcon.textContent = 'fullscreen_exit';
      } else {
        sketch.p.fullscreen(false);
        fsIcon.textContent = 'fullscreen';
      }
    });

    // ... (other event listeners)
  }
};

/**
 * Settings Module.
 */
const Settings = {
  /**
   * Saves shader settings to localStorage.
   */
  save: () => {
    const settingsToSave = {};
    for (const shader in shaderSettings) {
      settingsToSave[shader] = {};
      for (const param in shaderSettings[shader]) {
        settingsToSave[shader][param] = { value: shaderSettings[shader][param].value };
      }
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
  },
  /**
   * Loads shader settings from localStorage.
   */
  load: () => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const loadedSettings = JSON.parse(saved);
      for (const shader in loadedSettings) {
        if (shaderSettings[shader]) {
          for (const param in loadedSettings[shader]) {
            if (shaderSettings[shader][param]) {
              shaderSettings[shader][param].value = loadedSettings[shader][param].value;
            }
          }
        }
      }
    }
  }
};

// --- Initialize Sketch ---
new p5(s);
