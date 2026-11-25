# 다다철거 YouTube journal — 2026-11-14

Existing site: https://www.bandeutjipsuri.co.kr/#videos

- Selected four advice Shorts from the official 다다철거 channel feed: https://www.youtube.com/feeds/videos.xml?channel_id=UCy0JkyC6icU-4Uhfufwqr2w
- IDs: 3EF9KCWPwAc, Z0UbYuqLCm0, g0JZNPb8GBA, V1faT19urTY. Titles in the selection are editorial summaries; these are not represented as completed project case studies.
- Single click-to-load youtube-nocookie iframe, native YouTube controls, fullscreen, close control, mobile scroll to player, external watch fallback. No iframe loaded on initial render. Selection replaces the previous player.
- Next/Image proxies official thumbnails; CSP frame-src permits only youtube-nocookie. Script/connect policies and existing frame-ancestors protection remain unchanged.
- Added navigation anchor and photo consultation link alongside videos. Existing brand film remains separately labeled as AI imagery.
- Static selection, not an automatically refreshed feed.

## Validation

- ESLint for all changed TSX/config files; production build; git diff --check passed.
- Local production browser: official player and video captions verified; video selection swaps single iframe; closing removes iframe.
- 1280 desktop, 920 intermediate, 390 mobile, and 320 narrow widths: no horizontal overflow. Thumbnail images loaded. Mobile selected video scrolls into visible area.
- Official embed documentation: https://developers.google.com/youtube/player_parameters and https://support.google.com/youtube/answer/171780

Previous deployment available for rollback: dpl_4nuz8SQETS64YNiFwhN8khUVBBxc (b2f7394).
