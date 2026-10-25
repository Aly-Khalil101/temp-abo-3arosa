"use strict";

const doorScene = document.getElementById("doorScene");
const openButton = document.getElementById("openButton");
const openingHint = document.getElementById("openingHint");
const openingStatus = document.getElementById("openingStatus");
const invitationCard = document.getElementById("invitationCard");
const replayButton = document.getElementById("replayButton");
const experience = document.getElementById("experience");
const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("backgroundMusic");
const doorSound = document.getElementById("doorSound");

let openingTimers = [];
let hasOpened = false;

// Music timing: 0 means start immediately from the seal click.
// A positive delay (for example, 600) waits that many milliseconds, but some
// browsers may block delayed playback under autoplay policies. Immediate is safest.
const MUSIC_START_DELAY_MS = 0;

backgroundMusic.volume = 0.7;
doorSound.volume = 0.6;

function showMusicPlayingState() {
  musicToggle.hidden = false;
  musicToggle.classList.remove("is-muted");
  musicToggle.classList.add("is-playing");
  musicToggle.setAttribute("aria-pressed", "true");
  musicToggle.setAttribute("aria-label", "إيقاف موسيقى الدعوة");
  musicToggle.title = "إيقاف موسيقى الدعوة";
}

function showMusicStoppedState() {
  musicToggle.hidden = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.classList.add("is-muted");
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "تشغيل موسيقى الدعوة");
  musicToggle.title = "تشغيل موسيقى الدعوة";
}

function startBackgroundMusic() {
  musicToggle.hidden = false;
  const playback = backgroundMusic.play();

  if (playback && typeof playback.then === "function") {
    playback.then(showMusicPlayingState).catch(() => {
      // The invitation still works if the MP3 is missing or playback is blocked.
      showMusicStoppedState();
    });
  } else {
    showMusicPlayingState();
  }
}

function scheduleBackgroundMusic() {
  if (MUSIC_START_DELAY_MS <= 0) {
    // Calling play() directly in the user's click handler is the most reliable
    // approach across browsers with autoplay restrictions.
    startBackgroundMusic();
    return;
  }

  openingTimers.push(
    window.setTimeout(startBackgroundMusic, MUSIC_START_DELAY_MS),
  );
}

function toggleBackgroundMusic() {
  if (backgroundMusic.paused) {
    // Resume from the paused position rather than restarting the song.
    startBackgroundMusic();
    return;
  }

  // Pausing preserves currentTime, so clicking again resumes from this point.
  backgroundMusic.pause();
  showMusicStoppedState();
}

function playDoorSound() {
  doorSound.currentTime = 0;
  const soundPlayback = doorSound.play();
  if (soundPlayback && typeof soundPlayback.catch === "function") {
    soundPlayback.catch(() => {
      // The door animation still works if the sound file is unavailable.
    });
  }
}

function clearOpeningTimers() {
  openingTimers.forEach((timer) => window.clearTimeout(timer));
  openingTimers = [];
}

function openInvitation() {
  if (hasOpened) return;

  hasOpened = true;
  openButton.disabled = true;
  playDoorSound();
  scheduleBackgroundMusic();
  doorScene.classList.add("is-opening");
  experience.classList.add("has-opened");
  openingStatus.textContent = "الباب بيتفتح...";

  // Keep the door motion first. Reveal the diwan only after the door has opened.
  openingTimers.push(
    window.setTimeout(() => {
      doorScene.classList.add("is-open");
      openingStatus.textContent = "أهلًا وسهلًا بيكم";
    }, 1080),
  );

  openingTimers.push(
    window.setTimeout(() => {
      doorScene.classList.add("is-revealed");
      invitationCard.setAttribute("aria-hidden", "false");
      replayButton.hidden = false;
      openingStatus.textContent = "نورتوا دعوة عائلات أبو خليل نوح";
    }, 2260),
  );
}

function replayInvitation() {
  clearOpeningTimers();
  hasOpened = false;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  musicToggle.hidden = true;
  musicToggle.classList.remove("is-playing", "is-muted");
  musicToggle.setAttribute("aria-pressed", "true");
  musicToggle.setAttribute("aria-label", "إيقاف موسيقى الدعوة");
  musicToggle.title = "إيقاف موسيقى الدعوة";
  openButton.disabled = false;
  doorScene.classList.remove("is-opening", "is-open", "is-revealed");
  experience.classList.remove("has-opened");
  invitationCard.setAttribute("aria-hidden", "true");
  replayButton.hidden = true;
  openingStatus.textContent = "";
  openingHint.textContent = "اضغط على ختم العائلة لفتح باب الدار";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

openButton.addEventListener("click", openInvitation);
replayButton.addEventListener("click", replayInvitation);
musicToggle.addEventListener("click", toggleBackgroundMusic);
