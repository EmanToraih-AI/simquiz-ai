# Git Credential Setup for Easy Pushing

## Current Status
✅ Code is already pushed to GitHub (commit `ad3308f`)

## Why You Got the 403 Error

The error `Permission denied to emantoraih` happened because:
- Git tried to use your system username (`emantoraih`) 
- But the repository belongs to the `EmanToraih-AI` organization
- Git needs your GitHub Personal Access Token to authenticate

## Setup for Future Pushes (One-Time)

I've already configured Git to use macOS Keychain for storing credentials.

### Next Time You Push:

1. **Just use the normal command:**
   ```bash
   git push origin main
   ```

2. **When prompted, enter:**
   - Username: `EmanToraih-AI`
   - Password: `YOUR_GITHUB_PERSONAL_ACCESS_TOKEN` (paste your token here)

3. **macOS Keychain will save it**, so you won't need to enter it again!

### Alternative: Use SSH (More Permanent)

If you want to use SSH keys instead:

1. **Check if you have SSH keys:**
   ```bash
   ls -la ~/.ssh/id_*.pub
   ```

2. **If no keys, create one:**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # Press Enter for default location
   ```

3. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```

4. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key
   - Save

5. **Switch remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:EmanToraih-AI/simquiz-ai.git
   ```

6. **Now push normally:**
   ```bash
   git push origin main
   ```

## Summary

- ✅ Credential helper is configured (uses macOS Keychain)
- ✅ Next push: Just use `git push origin main` and enter credentials once
- ✅ They'll be saved for future use

