# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of Freedom Loader:

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | :white_check_mark: |
| 1.3.x   | :white_check_mark: |
| < 1.3.0 | :x:                |

**Note**: We recommend always using the latest version to benefit from the most recent security patches and features.

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

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to release a fix within 7-14 days for critical vulnerabilities
- **Credit**: We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices for Users

When using Freedom Loader, we recommend:

### General Security

- **Keep Updated**: Always use the latest version of Freedom Loader
- **Official Sources**: Download only from official releases on [GitHub](https://github.com/MasterAcnolo/Freedom-Loader/releases)
- **Verify Downloads**: Check that installers are properly signed (Windows SmartScreen may show warnings for new releases)
- **Antivirus**: Keep your antivirus software up to date

### Configuration Security

- **Download Path**: Only set download paths within your user directory (`C:\Users\[USERNAME]\...`)
- **Cookies**: Be aware that Firefox cookies are used for authentication—keep Firefox secure
- **Logs**: Logs may contain sensitive information—avoid sharing them publicly without review

### Privacy Considerations

Freedom Loader respects your privacy:

- **No Data Collection**: We don't collect, store, or transmit your personal data
- **No Telemetry**: No usage tracking or analytics
- **Local Operation**: All downloads are processed locally on your machine
- **Optional Features**: Discord RPC is optional and can be disabled

## Known Security Considerations

### Browser Cookie Access

Freedom Loader accesses Firefox cookies to download protected content. This is:

- **By Design**: Required for age-restricted or member-only content
- **Local Only**: Cookies are read locally and never transmitted
- **User Controlled**: You can control what content you download

### Native Dependencies

Freedom Loader bundles native binaries:

- **yt-dlp**: Official builds from [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **FFmpeg**: Official builds from [FFmpeg.org](https://ffmpeg.org/)
- **Deno**: Official builds from [Deno.land](https://deno.land/)

These dependencies are verified and updated regularly.

### Windows Defender Warnings

New releases may trigger Windows Defender warnings because:

- The application is not yet widely distributed
- Code signing certificates are expensive for open-source projects

This is expected behavior for new releases. The warning will decrease as more users download the software.

## Vulnerability Disclosure Policy

### Our Commitment

We are committed to:

- Responding promptly to security reports
- Working with security researchers to verify and address issues
- Keeping users informed about security updates
- Crediting researchers who report vulnerabilities responsibly

### Disclosure Timeline

1. **Day 0**: Vulnerability reported privately
2. **Day 1-2**: Acknowledgment sent to reporter
3. **Day 3-7**: Vulnerability assessed and fix developed
4. **Day 7-14**: Fix released (critical vulnerabilities prioritized)
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
- Issues in third-party dependencies (report to upstream projects)
- Missing security headers on local HTTP server (no remote access)

## Security Updates

Security updates are released as:

- **Patch Releases**: For critical security fixes (e.g., 1.4.1 → 1.4.2)
- **Automatic Updates**: Users are notified via the built-in update system
- **Release Notes**: Security fixes are clearly marked in changelog

## Additional Resources

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [GitHub Security Advisories](https://github.com/MasterAcnolo/Freedom-Loader/security/advisories)

## Contact

For security-related questions or concerns:

- **Email**: masteracnolo25@gmail.com (Subject: [SECURITY])
- **GitHub**: [@MasterAcnolo](https://github.com/MasterAcnolo)

---

**Thank you for helping keep Freedom Loader and its users safe!**