// --- Code & Logic Component: p5.js Sketch ---
// This is the main structure that holds the entire visual application logic.
const s = (p) => {
  // --- Global variables for the sketch ---
  let demo1Shader, img, fft, audio, displacementMap;
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
      shaderPath: 'shaders/d2.frag',
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
      shaderPath: 'shaders/d4.frag',
    },
    {
      artist: 'Dxginger',
      title: 'Phantom Vibration',
      audioPath: 'audio/demo5.mp3',
      imgPath: 'img/5.jpg',
      shaderPath: 'shaders/pixelation.frag',
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
      shaderPath: 'shaders/d2.frag',
    },
    {
      artist: 'Dxginger',
      title: 'The Unmade Bed',
      audioPath: 'audio/demo10.mp3',
      imgPath: 'img/10.jpg',
      shaderPath: 'shaders/d3.frag',
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
      p.shader(demo1Shader);
      assetLoaded();
    });

    if (track.displacementMapPath) {
        p.loadImage(track.displacementMapPath, loadedMap => {
            displacementMap = loadedMap;
            assetLoaded();
        });
    } else {
        displacementMap = null; // Clear map if not used
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

  // --- Code & Logic Component: `setup()` function ---
  // This runs once to initialize the canvas, event listeners, and UI components.
  p.setup = () => {
      populateTracklist();
      updateTrackInfo();
      
      // Event listener for the main "Play" button on the Action Screen
      const playBtn = document.querySelector('#play-btn');
      playBtn.addEventListener('click', () => {
        document.body.classList.add('start-anim');
        togglePlayPause();
        
        // This class signals that the Intro Animation is over and the main view is active
        const animTimeTotal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-time-total').replace('s', '')) * 1000;
        setTimeout(() => {
            document.body.classList.add('main-view-active');
            resetToggleIdleTimer(); 
        }, animTimeTotal);

      });

      p.pixelDensity(1);
      // Main Visualizer is created here and attached to the #content div
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      canvas.parent('content'); 
      p.shader(demo1Shader);
      
      // --- Player Controls Event Listeners ---
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
      
      // --- "About Album" Modal Listeners ---
      const aboutBtn = document.getElementById('about-btn');
      const aboutModal = document.getElementById('about-modal');
      const closeModalBtn = aboutModal.querySelector('.modal-close');
      const modalOverlay = aboutModal.querySelector('.modal-overlay');

      aboutBtn.addEventListener('click', () => aboutModal.classList.add('visible'));
      closeModalBtn.addEventListener('click', () => aboutModal.classList.remove('visible'));
      modalOverlay.addEventListener('click', () => aboutModal.classList.remove('visible'));

      // --- UI Interaction Logic for Hover Panels ---
      const playerWrapper = document.querySelector('.player-container');
      const tracklistWrapper = document.querySelector('.tracklist-wrapper');
      const playerToggle = document.querySelector('.player-toggle');
      const tracklistToggle = document.querySelector('.tracklist-toggle');

      // --- Idle timer for Player/Tracklist Toggles ---
      const resetToggleIdleTimer = () => {
        clearTimeout(toggleIdleTimer);
        playerToggle.classList.remove('idle-fade');
        tracklistToggle.classList.remove('idle-fade');
        toggleIdleTimer = setTimeout(() => {
          playerToggle.classList.add('idle-fade');
          tracklistToggle.classList.add('idle-fade');
        }, 3000); 
      };
      
      // Only start the idle timer once the main view is active
      if(document.body.classList.contains('main-view-active')){
        window.addEventListener('mousemove', resetToggleIdleTimer);
      }
      
      // --- Auto-hide timer for open panels ---
      const startPanelIdleTimer = () => {
          clearTimeout(panelIdleTimer);
          panelIdleTimer = setTimeout(() => {
              playerWrapper.classList.remove('is-active');
              tracklistWrapper.classList.remove('is-active');
          }, 8000); 
      };
      
      // --- Player Controls Hover Logic ---
      playerWrapper.addEventListener('mouseenter', () => {
          playerWrapper.classList.add('is-active');
          startPanelIdleTimer();
      });
      playerWrapper.addEventListener('mouseleave', () => {
          playerWrapper.classList.remove('is-active');
          clearTimeout(panelIdleTimer);
      });

      // --- Tracklist Panel Hover Logic ---
      tracklistWrapper.addEventListener('mouseenter', () => {
          tracklistWrapper.classList.add('is-active');
          startPanelIdleTimer();
      });
       tracklistWrapper.addEventListener('mouseleave', () => {
          tracklistWrapper.classList.remove('is-active');
          clearTimeout(panelIdleTimer);
      });

      // Reset panel auto-hide timer on any mouse move if a panel is active
      window.addEventListener('mousemove', () => {
          if (playerWrapper.classList.contains('is-active') || tracklistWrapper.classList.contains('is-active')) {
              startPanelIdleTimer();
          }
      });

      // Initialize the Fast Fourier Transform for audio analysis
      fft = new p5.FFT();
  };

  // --- Code & Logic Component: `draw()` Loop ---
  // This function runs continuously (60fps) to create the animation.
  p.draw = () => {
    if (!demo1Shader || !img || img.width === 0) return;

    p.shader(demo1Shader);
    fft.analyze();

    // Get real-time audio frequency data
    const bass = fft.getEnergy("bass");
    const treble = fft.getEnergy("treble");
    const mid = fft.getEnergy("mid");

    let mapBass, mapTremble, mapMid;
    const currentShader = album[currentTrackIndex].shaderPath;

    // --- Code & Logic Component: Shader-Specific Settings Block ---
    // Apply specific audio mappings based on the active shader for tailored effects.
    if (currentShader === 'shaders/pixelation.frag') {
        mapBass = p.map(bass, 0, 255, 20.0, 200.0);
        mapTremble = p.map(treble, 0, 255, 0, 0.0);
        mapMid = p.map(mid, 0, 255, 0.0, 0.1);
    } else if (currentShader === 'shaders/noise.frag' || currentShader === 'shaders/displacement.frag') {
        mapBass = p.map(bass, 0, 255, 10, 15.0);
        mapTremble = p.map(treble, 0, 255, 0, 0.0);
        mapMid = p.map(mid, 0, 255, 0.0, 0.4);
    } else {
        // Default settings for original shaders
        mapBass = p.map(bass, 0, 255, 10, 15.0);
        mapTremble = p.map(treble, 0, 255, 0, 0.0);
        mapMid = p.map(mid, 0, 255, 0.0, 0.1);
    }
    
    // --- Code & Logic Component: Shader Uniforms ---
    // These variables are sent from JavaScript to the GLSL shader every frame.
    demo1Shader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    demo1Shader.setUniform('u_texture', img);
    demo1Shader.setUniform('u_tResolution', [img.width, img.height]);
    demo1Shader.setUniform('u_time', p.frameCount / 20);
    demo1Shader.setUniform('u_bass', mapBass);
    demo1Shader.setUniform('u_tremble', mapTremble);
    demo1Shader.setUniform('u_mid', mapMid);

    if (displacementMap) {
        demo1Shader.setUniform('u_displacementMap', displacementMap);
    }

    // This rectangle covers the whole screen, applying the shader to every pixel.
    p.rect(0,0, p.width, p.height);
  };

  // Handles window resizing to keep the visualizer full-screen
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if(demo1Shader) {
        demo1Shader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    }
  };
};

// Initialize the p5.js sketch to start the application
new p5(s);

