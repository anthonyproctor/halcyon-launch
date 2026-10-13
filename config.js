// Site config, loaded before every other script (index.html). See docs/AUDIO_HOSTING.md.
// HALCYON_AUDIO_BASE: where narration mp3s are served from.
//   ""  (today): every mp3 plays from this site, the same paths as always.
//   "https://<audio domain>": an mp3 listed in audio-manifest.json plays from that domain, under its repo path with the take's hash before .mp3
//   (audio/v2/pages/f1/open.<hash>.mp3). Anything the manifest doesn't list, or whose copy there fails to load, plays from this site.
// This is the single switch. Flip it only after tools/r2_sync.py has uploaded the files and written audio-manifest.json.
window.HALCYON_AUDIO_BASE = "https://audio.strakesystems.com";
// HALCYON_AUDIO_REMOTE_ONLY: set to true only at step 5 of the doc, when the mp3s leave git and this site has no copy to fall back to.
window.HALCYON_AUDIO_REMOTE_ONLY = true;
