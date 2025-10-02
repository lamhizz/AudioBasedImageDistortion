// --- Code & Logic Component: p5.js Sketch ---
// This is the main structure that holds the entire visual application logic.
const s = (p) => {
  // --- Global variables for the sketch ---
  let demo1Shader, img, fft, audio, displacementMap, backgroundNoise;
  let overlayShader, offscreenBuffer; // New variables for the overlay effect
  let currentTrackIndex = 0;
  let isPlaying = false;
  let currentVolume = 1;
  let toggleIdleTimer;
  let panelIdleTimer;

  // --- Code & Logic Component: `album` Array ---
  // This array holds the structured data for each track in the album.
  const album = [
    {
      artist: 'Dxginger',
      title: 'Blue Hour Static',
      audioPath: 'audio/demo1.mp3',
      imgPath: 'img/1.jpg',
      shaderPath: 'shaders/d1.frag',
    },
    {
      artist: 'Dxginger',
      title: 'The Quiet Hum',
      audioPath: 'audio/demo2.mp3',
      imgPath: 'img/2.jpg',
      shaderPath: 'shaders/d3.frag',
    },
    {
        artist: 'Dxginger',
        title: '4 AM Echo',
        audioPath: 'audio/demo3.mp3',
        imgPath: 'img/3.jpg',
        shaderPath: 'shaders/displacement.frag', 
        displacementMapPath: 'img/ripple.jpg',
    },
    {
      artist: 'Dxginger',
      title: 'Weightless Drift',
      audioPath: 'audio/demo4.mp3',
      imgPath: 'img/4.jpg',
      shaderPath: 'shaders/d3.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Phantom Vibration',
      audioPath: 'audio/demo5.mp3',
      imgPath: 'img/5.jpg',
      shaderPath: 'shaders/d5.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Counting the Seconds',
      audioPath: 'audio/demo6.mp3',
      imgPath: 'img/6.jpg',
      shaderPath: 'shaders/d6.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Synthetic Dawn',
      audioPath: 'audio/demo7.mp3',
      imgPath: 'img/7.jpg',
      shaderPath: 'shaders/d8.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Silk & Silicone',
      audioPath: 'audio/demo8.mp3',
      imgPath: 'img/8.jpg',
      shaderPath: 'shaders/d1.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Glimmering Loop',
      audioPath: 'audio/demo9.mp3',
      imgPath: 'img/9.jpg',
      shaderPath: 'shaders/d3.frag',
    },
    {
      artist: 'Dxginger',
      title: 'The Unmade Bed',
      audioPath: 'audio/demo10.mp3',
      imgPath: 'img/10.jpg',
      shaderPath: 'shaders/d1.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Subtle Decay',
      audioPath: 'audio/demo11.mp3',
      imgPath: 'img/11.jpg',
      shaderPath: 'shaders/noise.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Lucid Fade',
      audioPath: 'audio/demo12.mp3',
      imgPath: 'img/12.jpg',
      shaderPath: 'shaders/d5.frag',
    }
  ];

  // --- Code & Logic Component: Shader Settings Object ---
  // This object holds all the parameters that can be fine-tuned in the debug panel.
  const shaderSettings = {
    'overlay.frag': {
      grainIntensity: { value: 0.15, min: 0, max: 0.5, step: 0.01 },
      grainSize: { value: 200.0, min: 50.0, max: 1000.0, step: 1.0 },
      leakStrength: { value: 0.15, min: 0, max: 1.0, step: 0.01 },
      leakRed: { value: 0.9, min: 0.0, max: 1.0, step: 0.01 },
      leakGreen: { value: 0.2, min: 0.0, max: 1.0, step: 0.01 },
      leakBlue: { value: 0.15, min: 0.0, max: 1.0, step: 0.01 }
    },
    'pixelation.frag': {
      baseSize: { value: 20.0, min: 1.0, max: 400.0, step: 1.0 },
      bassResponse: { value: 180.0, min: 0.0, max: 500.0, step: 1.0 }
    },
    'noise.frag': {
      midResponse: { value: 0.4, min: 0.0, max: 1.0, step: 0.01 }
    },
    'displacement.frag': {
       midResponse: { value: 0.4, min: 0.0, max: 1.0, step: 0.01 }
    },
    'd1.frag': {
        bassFrequency: { value: 12.0, min: 1.0, max: 50.0, step: 0.1 },
        midAmplitude: { value: 0.05, min: 0.0, max: 0.5, step: 0.001 }
    }
    // Add other original shaders here if you want to control them
  };


  // --- Code & Logic Component: `preload()` function ---
  // This runs before setup() to load the initial assets for the first track.
  p.preload = () => {
    const track = album[0];
    audio = p.loadSound(track.audioPath);
    img = p.loadImage(track.imgPath);
    demo1Shader = p.loadShader('shaders/base.vert', track.shaderPath);
    if (track.displacementMapPath) {
        displacementMap = p.loadImage(track.displacementMapPath);
    }
    overlayShader = p.loadShader('shaders/base.vert', 'shaders/overlay.frag');
    backgroundNoise = p.loadSound('audio/background-noise.mp3');
  };

  // --- UI Component: Tracklist Panel ---
  // This function builds the HTML for the tracklist panel from the `album` array.
  function populateTracklist() {
    const tracklistEl = document.getElementById('tracklist');
    tracklistEl.innerHTML = '';
    album.forEach((track, index) => {
      const li = document.createElement('li');
      li.textContent = track.title;
      li.classList.add('track-item');
      if (index === currentTrackIndex) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => {
        playTrack(index);
      });
      tracklistEl.appendChild(li);
    });
  }

  // --- UI Component: Track Info Display ---
  // This function updates the centrally displayed track title and artist.
  function updateTrackInfo() {
      document.getElementById('track-artist').textContent = `Now Playing`;
      document.getElementById('track-title').textContent = album[currentTrackIndex].title;
      document.body.style.backgroundImage = `url(${album[currentTrackIndex].imgPath})`;

      const tracklistItems = document.querySelectorAll('.track-item');
      tracklistItems.forEach((item, index) => {
          if(index === currentTrackIndex) {
              item.classList.add('active');
          } else {
              item.classList.remove('active');
          }
      });
  }
  
  // --- Code & Logic Component: `playTrack()` function ---
  // Handles stopping the old track and loading all new assets for the selected track.
  function playTrack(index) {
    if (index < 0 || index >= album.length) return;
    
    if (audio && audio.isPlaying()) {
      audio.stop();
    }
    
    currentTrackIndex = index;
    const track = album[currentTrackIndex];
    
    const onAssetsLoaded = () => {
        p.loadSound(track.audioPath, loadedSound => {
          audio = loadedSound;
          fft.setInput(audio); // Re-connect FFT to the new track
          const volumeSlider = document.getElementById('volume-slider');
          audio.setVolume(parseFloat(volumeSlider.value));
          updateTrackInfo();
          if (isPlaying || document.body.classList.contains('start-anim')) {
             audio.loop();
             isPlaying = true;
             document.getElementById('play-pause-btn').querySelector('.material-symbols-outlined').textContent = 'pause';
          }
        });
    };

    let assetsToLoad = 2; // shader, image
    if (track.displacementMapPath) assetsToLoad++;

    const assetLoaded = () => {
        assetsToLoad--;
        if (assetsToLoad === 0) {
            onAssetsLoaded();
        }
    };

    p.loadImage(track.imgPath, loadedImg => {
      img = loadedImg;
      assetLoaded();
    });

    p.loadShader('shaders/base.vert', track.shaderPath, loadedShader => {
      demo1Shader = loadedShader;
      assetLoaded(); 
    });

    if (track.displacementMapPath) {
        p.loadImage(track.displacementMapPath, loadedMap => {
            displacementMap = loadedMap;
            assetLoaded();
        });
    } else {
        displacementMap = null;
        if(assetsToLoad > 2) assetLoaded();
    }
  }

  // --- Helper functions for Player Controls ---
  function togglePlayPause() {
    if (audio && audio.isLoaded()) {
      const playPauseIcon = document.getElementById('play-pause-btn').querySelector('.material-symbols-outlined');
      if (audio.isPlaying()) {
        audio.pause();
        isPlaying = false;
        playPauseIcon.textContent = 'play_arrow';
      } else {
        audio.loop();
        isPlaying = true;
        playPauseIcon.textContent = 'pause';
      }
    }
  }

  function toggleMute() {
      const muteIcon = document.getElementById('toggle-btn').querySelector('.material-symbols-outlined');
      const volumeSlider = document.getElementById('volume-slider');
      if (audio.getVolume() > 0) {
          currentVolume = audio.getVolume();
          audio.setVolume(0);
          volumeSlider.value = 0;
          muteIcon.textContent = 'volume_off';
      } else {
          audio.setVolume(currentVolume);
          volumeSlider.value = currentVolume;
          muteIcon.textContent = 'volume_up';
      }
  }

  // --- Function to create the Secret Debug Panel ---
  function createDebugPanel() {
      const container = document.getElementById('shader-controls-container');
      container.innerHTML = ''; // Clear previous controls
      
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
              });

              row.appendChild(label);
              row.appendChild(slider);
              row.appendChild(valueSpan);
              content.appendChild(row);
          }

          details.appendChild(content);
          container.appendChild(details);
      }
  }

  // --- Code & Logic Component: `setup()` function ---
  // This runs once to initialize the canvas, event listeners, and UI components.
  p.setup = () => {
      populateTracklist();
      updateTrackInfo();
      createDebugPanel(); // Create the debug panel on startup
      
      const playBtn = document.querySelector('#play-btn');
      playBtn.addEventListener('click', () => {
        document.body.classList.add('start-anim');
        togglePlayPause();
        
        // Start background noise on first interaction
        if (backgroundNoise && !backgroundNoise.isPlaying()) {
            backgroundNoise.loop();
            backgroundNoise.setVolume(0.1); // Increased background noise volume
        }
        
        const animTimeTotal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-time-total').replace('s', '')) * 1000;
        setTimeout(() => {
            document.body.classList.add('main-view-active');
            resetToggleIdleTimer(); 
        }, animTimeTotal);
      });

      p.pixelDensity(1);
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      canvas.parent('content'); 
      
      offscreenBuffer = p.createGraphics(p.windowWidth, p.windowHeight, p.WEBGL);
      
      document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
      document.getElementById('toggle-btn').addEventListener('click', toggleMute);
      document.getElementById('next-btn').addEventListener('click', () => {
          playTrack((currentTrackIndex + 1) % album.length);
      });
      document.getElementById('prev-btn').addEventListener('click', () => {
          playTrack((currentTrackIndex - 1 + album.length) % album.length);
      });

      const volumeSlider = document.getElementById('volume-slider');
      volumeSlider.addEventListener('input', (e) => {
        if (audio) {
          const newVolume = parseFloat(e.target.value);
          audio.setVolume(newVolume);
          currentVolume = newVolume;
          const muteIcon = document.getElementById('toggle-btn').querySelector('.material-symbols-outlined');
          muteIcon.textContent = newVolume > 0 ? 'volume_up' : 'volume_off';
        }
      });
      
      const fullscreenBtn = document.getElementById('fullscreen-btn');
      fullscreenBtn.addEventListener('click', () => {
          const fsIcon = fullscreenBtn.querySelector('.material-symbols-outlined');
          if (!p.fullscreen()) {
            p.fullscreen(true);
            fsIcon.textContent = 'fullscreen_exit';
          } else {
            p.fullscreen(false);
            fsIcon.textContent = 'fullscreen';
          }
      });
      
      const aboutBtn = document.getElementById('about-btn');
      const aboutModal = document.getElementById('about-modal');
      const closeModalBtn = aboutModal.querySelector('.modal-close');
      const modalOverlay = aboutModal.querySelector('.modal-overlay');

      aboutBtn.addEventListener('click', () => aboutModal.classList.add('visible'));
      closeModalBtn.addEventListener('click', () => aboutModal.classList.remove('visible'));
      modalOverlay.addEventListener('click', () => aboutModal.classList.remove('visible'));

      const playerWrapper = document.querySelector('.player-container');
      const tracklistWrapper = document.querySelector('.tracklist-wrapper');
      const playerToggle = document.querySelector('.player-toggle');
      const tracklistToggle = document.querySelector('.tracklist-toggle');

      const resetToggleIdleTimer = () => {
        clearTimeout(toggleIdleTimer);
        playerToggle.classList.remove('idle-fade');
        tracklistToggle.classList.remove('idle-fade');
        toggleIdleTimer = setTimeout(() => {
          playerToggle.classList.add('idle-fade');
          tracklistToggle.classList.add('idle-fade');
        }, 3000); 
      };
      
      if(document.body.classList.contains('main-view-active')){
        window.addEventListener('mousemove', resetToggleIdleTimer);
      }
      
      const startPanelIdleTimer = () => {
          clearTimeout(panelIdleTimer);
          panelIdleTimer = setTimeout(() => {
              playerWrapper.classList.remove('is-active');
              tracklistWrapper.classList.remove('is-active');
          }, 8000); 
      };
      
      playerWrapper.addEventListener('mouseenter', () => {
          playerWrapper.classList.add('is-active');
          startPanelIdleTimer();
      });
      playerWrapper.addEventListener('mouseleave', () => {
          playerWrapper.classList.remove('is-active');
          clearTimeout(panelIdleTimer);
      });

      tracklistWrapper.addEventListener('mouseenter', () => {
          tracklistWrapper.classList.add('is-active');
          startPanelIdleTimer();
      });
       tracklistWrapper.addEventListener('mouseleave', () => {
          tracklistWrapper.classList.remove('is-active');
          clearTimeout(panelIdleTimer);
      });

      window.addEventListener('mousemove', () => {
          if (playerWrapper.classList.contains('is-active') || tracklistWrapper.classList.contains('is-active')) {
              startPanelIdleTimer();
          }
      });

      const trackInfo = document.querySelector('.track-info');
      const title = document.querySelector('.track-info__title');
      const artist = document.querySelector('.track-info__artist');
      window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const percentX = (mouseX / window.innerWidth - 0.5) * 2;
        const percentY = (mouseY / window.innerHeight - 0.5) * 2;
        
        // Reduced parallax magnitude
        title.style.transform = `translate(${percentX * -8}px, ${percentY * -8}px)`;
        artist.style.transform = `translate(${percentX * 4}px, ${percentY * 4}px)`;
      });

      fft = new p5.FFT();
      fft.setInput(audio); // Connect FFT to the initial audio track
  };
  
  // --- Keyboard listener for debug panel ---
  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') {
      document.getElementById('debug-panel').classList.toggle('visible');
    }
  }

  // --- Code & Logic Component: `draw()` Loop ---
  // This function runs continuously (60fps) to create the animation.
  p.draw = () => {
    if (!demo1Shader || !img || img.width === 0 || !overlayShader) return;

    fft.analyze();
    const bass = fft.getEnergy("bass");
    const treble = fft.getEnergy("treble");
    const mid = fft.getEnergy("mid");

    const mapBass = p.map(bass, 0, 255, 0.0, 1.0);
    const mapMid = p.map(mid, 0, 255, 0.0, 1.0);

    // --- Pass 1: Render the unique distortion effect to the off-screen buffer ---
    offscreenBuffer.shader(demo1Shader);
    
    // Set base uniforms for the track-specific shader
    demo1Shader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    demo1Shader.setUniform('u_texture', img);
    demo1Shader.setUniform('u_tResolution', [img.width, img.height]);
    demo1Shader.setUniform('u_time', p.frameCount / 20);
    
    // Pass raw mapped audio values
    demo1Shader.setUniform('u_bass', mapBass);
    demo1Shader.setUniform('u_mid', mapMid);

    if (displacementMap) {
        demo1Shader.setUniform('u_displacementMap', displacementMap);
    }
    
    // Pass custom parameters from the debug panel
    const currentShaderName = album[currentTrackIndex].shaderPath.split('/').pop();
    if (shaderSettings[currentShaderName]) {
      for (const paramName in shaderSettings[currentShaderName]) {
        demo1Shader.setUniform(`u_${paramName}`, shaderSettings[currentShaderName][paramName].value);
      }
    }

    offscreenBuffer.rect(0, 0, p.width, p.height);


    // --- Pass 2: Render the buffer to the main canvas with the overlay shader ---
    p.shader(overlayShader);
    
    let mouseX = p.map(p.mouseX, 0, p.width, 0, 1.0);
    let mouseY = p.map(p.mouseY, 0, p.height, 0, 1.0);

    // Set uniforms for the global overlay shader
    overlayShader.setUniform('u_mainTexture', offscreenBuffer);
    overlayShader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    overlayShader.setUniform('u_time', p.frameCount / 60);
    overlayShader.setUniform('u_mouse', [mouseX, mouseY]);

    // Pass custom overlay parameters from the debug panel
    if (shaderSettings['overlay.frag']) {
      for (const paramName in shaderSettings['overlay.frag']) {
        overlayShader.setUniform(`u_${paramName}`, shaderSettings['overlay.frag'][paramName].value);
      }
    }

    p.rect(0, 0, p.width, p.height);
  };

  // Handles window resizing to keep the visualizer full-screen
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    offscreenBuffer.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

// Initialize the p5.js sketch to start the application
new p5(s);

