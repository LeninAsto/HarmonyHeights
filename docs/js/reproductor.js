"use strict";

initializeMusicPlayer();

function initializeMusicPlayer() {
  const audio = document.querySelector("#ambientAudio");
  const player = document.querySelector("#musicPlayer");
  const launcher = document.querySelector("#ambientButton");
  if (!audio || !player) return;
  if (window.self !== window.top) {
    player.hidden = true;
    if (launcher) launcher.hidden = true;
    return;
  }

  const audioFolder = new URL("../audio/", document.currentScript.src);
  const tracks = [
    {
      title: "Für Elise",
      artist: "Ludwig van Beethoven",
      file: "Bethoveen - Für Elise.mp3",
    },
    {
      title: "Sinfonía n.º 5",
      artist: "Ludwig van Beethoven",
      file: "Beethoven's - 5th Symphony.mp3",
    },
    {
      title: "El cascanueces: Marcha",
      artist: "Orquesta Lírica de Barcelona",
      file: "El Cascanueces.mp3",
    },
    {
      title: "El Danubio Azul",
      artist: "Johann Strauss II",
      file: "Johann Strauss - El Danubio Azul.mp3",
    },
  ];
  const toggle = document.querySelector("#musicToggle");
  const next = document.querySelector("#musicNext");
  const previous = document.querySelector("#musicPrevious");
  const collapse = document.querySelector("#musicCollapse");
  const volume = document.querySelector("#musicVolume");
  const volumeValue = document.querySelector("#musicVolumeValue");
  const status = document.querySelector("#musicStatus");
  const title = document.querySelector("#musicTrack");
  const state = loadState();
  let waitingForInteraction = false;
  let pendingSeek = state.time;
  let lastSavedSecond = -1;
  let playRequest = 0;

  audio.volume = state.volume / 100;
  volume.value = state.volume;
  volumeValue.textContent = state.volume + "%";
  setPlayerOpen(false);
  selectTrack(state.track);
  if (state.playing) playMusic();
  else setStatus("En pausa", false);

  toggle.addEventListener("click", () => {
    if (state.playing && !waitingForInteraction) pauseMusic();
    else {
      state.playing = true;
      playMusic();
    }
  });
  next.addEventListener("click", () => changeTrack(1));
  previous.addEventListener("click", () => changeTrack(-1));
  collapse.addEventListener("click", () => {
    setPlayerOpen(false);
    if (launcher) launcher.focus();
  });
  if (launcher)
    launcher.addEventListener("click", () => setPlayerOpen(player.hidden));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !player.hidden) {
      setPlayerOpen(false);
      if (launcher) launcher.focus();
    }
  });

  volume.addEventListener("input", () => {
    state.volume = Number(volume.value);
    audio.volume = state.volume / 100;
    volumeValue.textContent = state.volume + "%";
    saveState();
  });

  audio.addEventListener("playing", () => {
    waitingForInteraction = false;
    setStatus("Reproduciendo", true);
    saveState();
  });
  audio.addEventListener("ended", () => changeTrack(1));
  audio.addEventListener("error", () => {
    state.playing = false;
    waitingForInteraction = false;
    setStatus("No se pudo cargar esta pista. Prueba la siguiente.", false);
    saveState();
  });
  audio.addEventListener("loadedmetadata", () => {
    if (pendingSeek > 0 && pendingSeek < audio.duration)
      audio.currentTime = pendingSeek;
    pendingSeek = 0;
  });
  audio.addEventListener("timeupdate", () => {
    const second = Math.floor(audio.currentTime);
    if (second !== lastSavedSecond) {
      lastSavedSecond = second;
      saveState();
    }
  });
  window.addEventListener("pagehide", saveState);
  document.addEventListener("click", startAfterInteraction);
  document.addEventListener("keydown", startAfterInteraction);

  function selectTrack(index) {
    state.track = index;
    const track = tracks[index];
    title.textContent = track.title + " — " + track.artist;
    title.title = title.textContent;
    audio.src = new URL(encodeURIComponent(track.file), audioFolder).href;
  }

  function changeTrack(direction) {
    playRequest += 1;
    pendingSeek = 0;
    lastSavedSecond = -1;
    audio.pause();
    const index = (state.track + direction + tracks.length) % tracks.length;
    selectTrack(index);
    state.playing = true;
    saveState();
    playMusic();
  }

  async function playMusic() {
    const request = ++playRequest;
    setStatus("Cargando música…", false);
    toggle.textContent = "Pausar";
    toggle.setAttribute("aria-label", "Pausar música");
    try {
      await audio.play();
    } catch (error) {
      if (request !== playRequest || error.name === "AbortError") return;
      if (error.name === "NotAllowedError") {
        waitingForInteraction = true;
        setStatus("Pulsa reproducir o interactúa con la página", false);
      } else {
        state.playing = false;
        waitingForInteraction = false;
        setStatus("No se pudo reproducir. Prueba otra pista.", false);
        saveState();
      }
    }
  }

  function pauseMusic() {
    playRequest += 1;
    state.playing = false;
    waitingForInteraction = false;
    audio.pause();
    setStatus("En pausa", false);
    saveState();
  }

  function startAfterInteraction(event) {
    if (!waitingForInteraction || !state.playing) return;
    if (event.target.closest("#musicPlayer, #ambientButton")) return;
    if (
      event.type === "keydown" &&
      (event.repeat || event.ctrlKey || event.metaKey || event.altKey)
    )
      return;
    waitingForInteraction = false;
    playMusic();
  }

  function setStatus(message, playing) {
    status.textContent = message;
    toggle.textContent = playing ? "Pausar" : "Reproducir";
    toggle.setAttribute(
      "aria-label",
      playing ? "Pausar música" : "Reproducir música",
    );
    player.classList.toggle("is-playing", playing);
  }

  function setPlayerOpen(open) {
    player.hidden = !open;
    if (launcher) launcher.setAttribute("aria-expanded", String(open));
  }

  function loadState() {
    const defaults = {
      track: 0,
      volume: 12,
      time: 0,
      playing: true,
    };
    try {
      const saved = JSON.parse(sessionStorage.getItem("harmonyMusic") || "{}");
      if (
        Number.isInteger(saved.track) &&
        saved.track >= 0 &&
        saved.track < tracks.length
      )
        defaults.track = saved.track;
      if (Number.isFinite(saved.volume))
        defaults.volume = Math.max(0, Math.min(100, saved.volume));
      if (Number.isFinite(saved.time) && saved.time >= 0)
        defaults.time = saved.time;
      if (typeof saved.playing === "boolean") defaults.playing = saved.playing;
    } catch (error) {
      player.dataset.storage = "unavailable";
    }
    return defaults;
  }

  function saveState() {
    state.time = pendingSeek || audio.currentTime;
    try {
      sessionStorage.setItem("harmonyMusic", JSON.stringify(state));
    } catch (error) {
      player.dataset.storage = "unavailable";
    }
  }
}
