# Security Policy

## Supported Versions

Freedom Loader follows a **latest-only** support model. Security fixes are applied to the current release only — no backports to older versions.

| Version       | Supported          |
| ------------- | ------------------ |
| Latest stable | :white_check_mark: |
| Older versions | :x:               |

I recommend always running the latest version. The built-in auto-updater will notify you when a new release is available. Older versions will not receive security patches regardless of severity.

## Reporting a Vulnerability

If you discover a security vulnerability in Freedom Loader, please help us keep the project and its users safe by reporting it responsibly.

### How to Report

**DO NOT** open a public issue for security vulnerabilities.

Instead, please report security issues privately by:

1. **Email**: Send details to **masteracnolo25@gmail.com** with the subject line: `[SECURITY] Vulnerability Report`
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact and severity
   - Suggested fix (if available)
   - Your contact information for follow-up

### What to Expect

- **Acknowledgment**: I will acknowledge receipt of your report within 48 hours
- **Assessment**: I will assess the vulnerability and determine its severity
- **Updates**: I will keep you informed of our progress
- **Resolution**: I aim to release a fix within 7-14 days for critical vulnerabilities
- **Credit**: I will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices for Users

When using Freedom Loader, I recommend:

### General Security

- **Keep Updated**: Always use the latest version of Freedom Loader — older versions receive no security patches
- **Official Sources**: Download only from official sources:
    - [GitHub Releases](https://github.com/MasterAcnolo/Freedom-Loader/releases)
    - [Fedora COPR](https://copr.fedorainfracloud.org/coprs/masteracnolo/freedom-loader/)
    - [Snap Store](https://snapcraft.io/freedom-loader)
- **Verify Downloads**: Check that installers are from one of the above sources
- **Antivirus**: Keep your antivirus software up to date

### Configuration Security

- **Download Path**: Only set download paths within your user directory
- **Cookies**: Be aware that Firefox cookies are used for authentication — keep Firefox secure
- **Logs**: Logs may contain sensitive information such as URLs or local paths — avoid sharing them publicly without review

### Privacy Considerations

Freedom Loader respects your privacy:

- **No Data Collection**: I don't collect, store, or transmit your personal data
- **No Telemetry**: No usage tracking or analytics
- **Local Operation**: All downloads are processed locally on your machine
- **Optional Features**: Discord RPC is optional and can be disabled in settings

## Known Security Considerations

### Browser Cookie Access

Freedom Loader accesses Firefox cookies to download protected content. This is:

- **By Design**: Required for age-restricted or member-only content
- **Local Only**: Cookies are read locally and never transmitted outside your machine
- **User Controlled**: You control what content you download

### Native Dependencies

Freedom Loader bundles the following official binaries:

- **yt-dlp**: Official builds from [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) — auto-updated on each launch
- **FFmpeg**: Official builds from [FFmpeg.org](https://ffmpeg.org/)
- **Deno**: Official builds from [Deno.com](https://deno.com/)

These dependencies are verified and updated regularly.

### Windows Defender Warnings

New releases may trigger Windows Defender warnings because:

- The application is not yet widely distributed
- Code signing certificates are expensive for open-source projects

This is expected behavior for new releases and will diminish as more users download the software.

## Vulnerability Disclosure Policy

### Our Commitment

I am committed to:

- Responding promptly to security reports
- Working with security researchers to verify and address issues
- Keeping users informed about security updates
- Crediting researchers who report vulnerabilities responsibly

### Disclosure Timeline

1. **Day 0**: Vulnerability reported privately
2. **Day 1–2**: Acknowledgment sent to reporter
3. **Day 3–7**: Vulnerability assessed and fix developed
4. **Day 7–14**: Fix released (critical vulnerabilities prioritized)
5. **Day 14+**: Public disclosure (coordinated with reporter)

### Scope

Security issues we're most interested in:

- **Code Execution**: Arbitrary code execution vulnerabilities
- **Path Traversal**: Issues with file system access controls
- **Injection**: Command injection or similar vulnerabilities
- **Authentication**: Bypass of security controls
- **Data Exposure**: Unintended exposure of sensitive data

### Out of Scope

The following are generally not considered security vulnerabilities:

- Issues requiring physical access to the user's machine
- Social engineering attacks
- Denial of service against third-party services
- Issues in third-party dependencies (report to upstream projects directly)
- Missing security headers on the local HTTP server (not exposed remotely)

## Security Updates

Security updates are released as:

- **Patch Releases**: For critical security fixes (e.g., 1.6.0 → 1.6.1)
- **Automatic Updates**: Users are notified via the built-in update system
- **Release Notes**: Security fixes are clearly marked in the changelog

## Additional Resources

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [GitHub Security Advisories](https://github.com/MasterAcnolo/Freedom-Loader/security/advisories)

## Contact

For security-related questions or concerns:

- **Email**: masteracnolo25@gmail.com
- **GitHub**: [@MasterAcnolo](https://github.com/MasterAcnolo)

---

**Thank you for helping keep Freedom Loader and its users safe!**