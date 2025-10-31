# Development Server Notes

## WebSocket Error Issue

If you see `RangeError: Invalid WebSocket frame: RSV1 must be clear` errors, this is caused by a browser extension (likely an ad blocker or privacy extension) compressing WebSocket frames.

### Solutions (in order of preference):

1. **Disable browser extensions** while developing
   - Turn off ad blockers, privacy extensions temporarily
   
2. **Use incognito/private mode** 
   - Extensions are typically disabled there

3. **Use a different browser**
   - Try Safari or a fresh Chrome profile without extensions

4. **Use the auto-restart script** (current setup)
   ```bash
   ./dev-server.sh
   ```
   This automatically restarts the server when it crashes

### Current Status
The `dev-server.sh` script is configured to auto-restart on crashes, so the app will remain accessible even when the WebSocket error occurs.

The video playback functionality has been fixed and should work correctly once you load a video into the timeline.
