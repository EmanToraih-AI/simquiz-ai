# How to Push to GitHub

## Option 1: Personal Access Token (Easiest)

1. **Create Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "SimQuiz AI Push"
   - Scope: Check `repo` (full control)
   - Click "Generate token"
   - **Copy the token** (starts with `ghp_...`)

2. **Push using token:**
   ```bash
   cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
   git push origin main
   ```
   
   When prompted:
   - Username: `your-github-username`
   - Password: `paste-your-token-here` (the token, NOT your password)

## Option 2: SSH Keys (More Permanent)

1. **Check if you have SSH keys:**
   ```bash
   ls -la ~/.ssh/id_*.pub
   ```

2. **If no keys exist, create one:**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # Press Enter to accept default location
   # Optionally set a passphrase
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
   - Click "Add SSH key"

5. **Update remote to use SSH:**
   ```bash
   cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
   git remote set-url origin git@github.com:EmanToraih-AI/simquiz-ai.git
   git push origin main
   ```

## Your Commit is Already Saved! ✅

Your commit `2e9e41d` is saved locally with all changes:
- 37 files changed
- 2,960 insertions
- All authentication, database, YouTube URL features

You just need to authenticate to push it to GitHub!

