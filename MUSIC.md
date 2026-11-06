# After Hours Radio

Open `/music.html`, or use **Webamp** in the homelab controls. It opens in a separate tab so music can keep playing while browsing the portfolio.

The classic player is the official **Webamp 2.3.1** bundle, self-hosted under `dist/vendor/webamp/`. Its upstream MIT license is retained beside it. The bundled classic skin needs no third-party asset requests.

**Late Shift** is an original 48-second stereo synth composition rendered locally by `scripts/generate-music.py`. It includes pads, bass, plucked synth and percussion. Regeneration requires Python 3 and FFmpeg. No commercial song, streaming service or external music library is included.

Playback starts from the Play control. The optional “Play when I open Radio” preference is stored only in the browser and attempts automatic playback on later visits; browser autoplay restrictions may still require a click. Webamp provides volume, seeking, repeat, equalizer and playlist controls. Native browser audio controls are the fallback when Webamp cannot initialize. The scene's ambient sound and Radio are separate controls.

This integration uses the documented Webamp `renderInto`, playback, media-status, repeat and volume APIs. No private Redux/media implementation is required.

The companion status waits for Webamp's visible seek control to advance before showing Playing. A startup request with no progress offers a retry after eight seconds; a later stall offers a retry after 6.5 seconds without progress. Manual seeking restarts verification. Watchdog decisions pause while the tab is hidden and timing rebases on return, so background timer suspension cannot stop a healthy track. This handles Webamp's optimistic PLAYING status when a browser rejects autoplay, without reading private player internals.

- Upstream: https://github.com/captbaritone/webamp
- Documentation: https://docs.webamp.org/docs/api/instance-methods/
- Browser autoplay behavior: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

Validation: the MP3 fully decodes as 44.1 kHz stereo, exactly 48 seconds, with a peak below clipping. Live browser review confirmed advancing playback, pause holding position, close/reopen, and the full classic player fitting a 320 px phone viewport. A remembered autoplay request was blocked after reload; accurate feedback appeared and an explicit Play retry worked. Audio was paused and the remembered preference disabled after review. Freeform window dragging and native fallback playback remain unverified manually.
