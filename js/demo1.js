const s = (p) => {
  let demo1Shader, img, fft, audio, displacementMap;
  let currentTrackIndex = 0;
  let isPlaying = false;
  let currentVolume = 1;

  const album = [
    {
      artist: 'Dxginger',
      title: 'Blue Hour Static',
      audioPath: 'audio/demo1.mp3',
      imgPath: 'img/1.jpg',
      shaderPath: 'shaders/d1.frag',
      lyrics: "Lyrics for Blue Hour Static..."
    },
    {
      artist: 'Dxginger',
      title: 'The Quiet Hum',
      audioPath: 'audio/demo2.mp3',
      imgPath: 'img/2.jpg',
      shaderPath: 'shaders/d1.frag',
      lyrics: "Lyrics for The Quiet Hum..."
    },
    {
        artist: 'Dxginger',
        title: '4 AM Echo',
        audioPath: 'audio/demo3.mp3',
        imgPath: 'img/3.jpg',
        shaderPath: 'shaders/displacement.frag', 
        displacementMapPath: 'img/noise.jpg',
        lyrics: "Lyrics for 4 AM Echo..."
    },
    {
      artist: 'Dxginger',
      title: 'Weightless Drift',
      audioPath: 'audio/demo4.mp3',
      imgPath: 'img/4.jpg',
      shaderPath: 'shaders/d3.frag',
      lyrics: "Lyrics for Weightless Drift..."
    },
    {
      artist: 'Dxginger',
      title: 'Phantom Vibration',
      audioPath: 'audio/demo5.mp3',
      imgPath: 'img/5.jpg',
      shaderPath: 'shaders/pixelation.frag',
      lyrics: "Lyrics for Phantom Vibration..."
    },
    {
      artist: 'Dxginger',
      title: 'Counting the Seconds',
      audioPath: 'audio/demo6.mp3',
      imgPath: 'img/6.jpg',
      shaderPath: 'shaders/d6.frag',
      lyrics: "Lyrics for Counting the Seconds..."
    },
    {
      artist: 'Dxginger',
      title: 'Synthetic Dawn',
      audioPath: 'audio/demo7.mp3',
      imgPath: 'img/7.jpg',
      shaderPath: 'shaders/d8.frag',
      lyrics: "Lyrics for Synthetic Dawn..."
    },
    {
      artist: 'Dxginger',
      title: 'Silk & Silicone',
      audioPath: 'audio/demo8.mp3',
      imgPath: 'img/8.jpg',
      shaderPath: 'shaders/d1.frag',
      lyrics: "Lyrics for Silk & Silicone..."
    },
    {
      artist: 'Dxginger',
      title: 'Glimmering Loop',
      audioPath: 'audio/demo9.mp3',
      imgPath: 'img/9.jpg',
      shaderPath: 'shaders/d2.frag',
      lyrics: "Lyrics for Glimmering Loop..."
    },
    {
      artist: 'Dxginger',
      title: 'The Unmade Bed',
      audioPath: 'audio/demo10.mp3',
      imgPath: 'img/10.jpg',
      shaderPath: 'shaders/d3.frag',
      lyrics: "Lyrics for The Unmade Bed..."
    },
    {
      artist: 'Dxginger',
      title: 'Subtle Decay',
      audioPath: 'audio/demo11.mp3',
      imgPath: 'img/11.jpg',
      shaderPath: 'shaders/noise.frag',
      lyrics: "Lyrics for Subtle Decay..."
    },
    {
      artist: 'Dxginger',
      title: 'Lucid Fade',
      audioPath: 'audio/demo12.mp3',
      imgPath: 'img/12.jpg',
      shaderPath: 'shaders/d5.frag',
      lyrics: "Lyrics for Lucid Fade..."
    }
  ];

  p.preload = () => {
    const track = album[0];
    audio = p.loadSound(track.audioPath);
    img = p.loadImage(track.imgPath);
    demo1Shader = p.loadShader('shaders/base.vert', track.shaderPath);
    if (track.displacementMapPath) {
        displacementMap = p.loadImage(track.displacementMapPath);
    }
  };

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

  function updateTrackInfo() {
      document.getElementById('track-artist').textContent = `Now Playing`;
      document.getElementById('track-title').textContent = album[currentTrackIndex].title;
      document.getElementById('track-lyrics').textContent = album[currentTrackIndex].lyrics;
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
        if(assetsToLoad > 2) assetLoaded(); // Only decrement if it was expected
    }
  }

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

  p.setup = () => {
      populateTracklist();
      updateTrackInfo();
      
      const playBtn = document.querySelector('#play-btn');
      playBtn.addEventListener('click', () => {
        document.body.classList.add('start-anim');
        togglePlayPause();
      });

      p.pixelDensity(1);
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.shader(demo1Shader);
      
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

      aboutBtn.addEventListener('click', () => {
          aboutModal.classList.add('visible');
      });

      closeModalBtn.addEventListener('click', () => {
          aboutModal.classList.remove('visible');
      });

      modalOverlay.addEventListener('click', () => {
          aboutModal.classList.remove('visible');
      });


      fft = new p5.FFT();
  };

  p.draw = () => {
    if (!demo1Shader || !img || img.width === 0) return;

    p.shader(demo1Shader);
    fft.analyze();

    const bass = fft.getEnergy("bass");
    const treble = fft.getEnergy("treble");
    const mid = fft.getEnergy("mid");

    let mapBass, mapTremble, mapMid;
    const currentShader = album[currentTrackIndex].shaderPath;

    if (currentShader === 'shaders/pixelation.frag') {
        // Settings for Pixelation Pulse
        mapBass = p.map(bass, 0, 255, 20.0, 200.0);
        mapTremble = p.map(treble, 0, 255, 0, 0.0);
        mapMid = p.map(mid, 0, 255, 0.0, 0.1);
    } else if (currentShader === 'shaders/noise.frag' || currentShader === 'shaders/displacement.frag') {
        // Settings for Noise and Displacement
        mapBass = p.map(bass, 0, 255, 10, 15.0);
        mapTremble = p.map(treble, 0, 255, 0, 0.0);
        mapMid = p.map(mid, 0, 255, 0.0, 0.4);
    } else {
        // Default settings for original shaders
        mapBass = p.map(bass, 0, 255, 10, 15.0);
        mapTremble = p.map(treble, 0, 255, 0, 0.0);
        mapMid = p.map(mid, 0, 255, 0.0, 0.1);
    }
    
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

    p.rect(0,0, p.width, p.height);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if(demo1Shader) {
        demo1Shader.setUniform('u_resolution', [p.windowWidth, p.windowHeight]);
    }
  };
};

new p5(s);

