---
description: How to release a new version of the Obsidian plugin
---

To release a new version of your Obsidian plugin, you need to update version numbers, build your production assets, and publish a GitHub Release containing those assets. Since you use `pnpm`, make sure to use it for scripts.

Here is the step-by-step workflow:

1. **Update Versions in Files**:
   - Update the version string in `manifest.json` (e.g. `"version": "1.0.1"`).
   - Update the version string in `package.json` (e.g. `"version": "1.0.1"`).
   - If your repository maintains a `versions.json` (standard for official community plugins), add a new key-value pair for this new release, mapping the plugin version to the minimum required Obsidian version (e.g. `"1.0.1": "1.5.0"`).

2. **Build the Production Plugin**:
   Create the minified and optimized `main.js` file required for distribution.

   ```bash
   pnpm run build
   ```

3. **Commit Your Changes**:
   Stage and commit your updated version files and the production build.

   ```bash
   git add package.json manifest.json versions.json main.js
   git commit -m "chore: release version X.Y.Z"
   ```

4. **Tag the Release and Push**:
   Create a git tag corresponding to your new version number and push it along with your commit to GitHub.

   ```bash
   git tag X.Y.Z
   git push origin main --tags
   ```

5. **Create a GitHub Release**:
   - Go to your repository on GitHub.
   - On the right side, click **Releases**, then **Draft a new release**.
   - Select the tag `X.Y.Z` you just pushed.
   - Enter a title (e.g., `vX.Y.Z` or Release Notes).
   - In the release description, describe the new features, fixes, or breaking changes.
   - **Attach the Release Assets**: At the bottom of the release page, drag and drop the following files from your local repository into the "Attach binaries" box:
     - `main.js`
     - `manifest.json`
     - `styles.css` (if you have styling in your plugin)
   - Click **Publish release**.

**Note**: To automate this process in the future, consider adding a tool like `version-bump.mjs` or setting up a GitHub Action (commonly found in the official Obsidian Plugin Template) to automatically bundle and draft GitHub releases on tag pushed.
