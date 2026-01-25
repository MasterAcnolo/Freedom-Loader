# Contributing to Freedom Loader

Welcome! Thanks for your interest in Freedom Loader. Your contributions—bug reports, feature ideas, or code improvements—are always appreciated. Every contribution makes Freedom Loader better.

---

## Quick Links

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Issue Templates](.github/ISSUE_TEMPLATE/)
- [Pull Request Templates](.github/PULL_REQUEST_TEMPLATE/)
- [Security Policy](SECURITY.md)

---

## Ways to Contribute

### 1. Report a Bug

Found a bug or unexpected behavior? Open an [**issue**](https://github.com/MasterAcnolo/Freedom-Loader/issues) using the **Bug Report** template.

**Please include:**
- Clear description of the bug
- Steps to reproduce
- App version and environment (Windows version, Firefox version if relevant)
- Logs from: `C:\Users\[USERNAME]\AppData\Local\FreedomLoader\logs\LOGS-YYYY-MM-DD.log`
- Screenshots if applicable

### 2. Request a Feature

Have an idea to improve Freedom Loader? Open a [**Feature Request**](https://github.com/MasterAcnolo/Freedom-Loader/issues/new/choose).

**Tips:**
- Describe the problem it solves
- Explain your proposed solution
- Include use cases and examples

### 3. Submit Code Changes

**Before starting:**
- Check existing issues and PRs to avoid duplicates
- For major changes, open an issue first to discuss
- Follow the project's code style and conventions

**Process:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly on Windows 10/11
5. Commit with clear messages: `git commit -m "Add feature X"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request using the appropriate template

**Code Guidelines:**
- Use camelCase for variables and functions
- Comment complex logic
- Keep commits focused and atomic
- Update documentation if needed
- Don't modify version numbers (done during release)

### 4. Improve Documentation

Documentation improvements are always welcome:
- Fix typos or unclear sections
- Add missing examples
- Update outdated information
- Improve README, wiki, or guides

Small contributions matter—don't hesitate to submit documentation PRs.

---

## Development Setup

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Git
- Windows 10/11 (for testing)

### Setup
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/Freedom-Loader.git
cd Freedom-Loader

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

### Project Structure
```
Freedom-Loader/
├── main.js           # Electron main process
├── preload.js        # Electron preload script
├── config.js         # Global configuration
├── server/           # Express backend
│   ├── routes/       # API routes
│   ├── controller/   # Business logic
│   └── helpers/      # Utility functions
├── public/           # Frontend (HTML, CSS, JS)
└── ressources/       # Binaries (yt-dlp, ffmpeg, etc.)
```

---

## Testing

Before submitting a PR, verify:
- [ ] Download functionality works (video/audio)
- [ ] Playlist downloads work
- [ ] Settings panel functions correctly
- [ ] Custom path selection works
- [ ] No errors in application logs
- [ ] UI changes work on all themes (if applicable)
- [ ] Tested on Windows 10 and/or Windows 11

---

## Pull Request Review Process

1. **Submission**: Open PR with clear description using the template
2. **Review**: Maintainers review code and provide feedback
3. **Updates**: Address feedback and push updates
4. **Approval**: Once approved, PR will be merged
5. **Release**: Changes included in next release

**Response times:**
- Bug fixes: Usually reviewed within 2-3 days
- Features: May take longer depending on complexity
- Documentation: Often reviewed quickly

---

## Code of Conduct

Be respectful and constructive in all interactions. We welcome everyone as long as discussions remain polite and productive.

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

---

## Questions?

- Check the [FAQ](https://masteracnolo.github.io/FreedomLoader/pages/faq.html)
- Review the [Wiki](https://masteracnolo.github.io/FreedomLoader/pages/wiki.html)
- Open a [Question issue](https://github.com/MasterAcnolo/Freedom-Loader/issues/new/choose)

---

## Credits

Thanks to **Zakaria** for the website icon design.  
Check out his work: [IG @designmark_studio](https://www.instagram.com/designmark_studio/)

---

**Thank you for contributing to Freedom Loader!**