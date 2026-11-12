# Security boundaries

## Review status — 2026-11-12

This is a review candidate, not a security-cleared production release. The final npm audit reported **22 affected package entries: 4 high, 17 moderate, 1 low, 0 critical**. These entries include dependency propagation; they correspond to seven distinct advisories, not 22 independent defects.

PostCSS was overridden to version 8.5.32 to address its reported advisories. Remaining findings involve URI decoding, image parsing, glob/minimatch resource consumption, and deepmerge object merging. Fixing those findings requires a separately tested dependency migration or maintained patches. Do not deploy this demo as an internet-facing service or process untrusted images with its development toolchain until that work is complete.

The high-severity advisory sources reported by npm are [URI decoding](https://github.com/advisories/GHSA-qr28-fpjm-wq7f), [JXL/HEIF parsing](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), and [ICNS parsing](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr). A successful build and local walkthrough do not resolve these findings.

## Data boundary

## Review status — 2026-11-12

This is a review candidate, not a security-cleared production release. The final npm audit reported **22 affected package entries: 4 high, 17 moderate, 1 low, 0 critical**. These entries include dependency propagation; they correspond to seven distinct advisories, not 22 independent defects.

PostCSS was overridden to version 8.5.32 to address its reported advisories. Remaining findings involve URI decoding, image parsing, glob/minimatch resource consumption, and deepmerge object merging. Fixing those findings requires a separately tested dependency migration or maintained patches. Do not deploy this demo as an internet-facing service or process untrusted images with its development toolchain until that work is complete.

The high-severity advisory sources reported by npm are [URI decoding](https://github.com/advisories/GHSA-qr28-fpjm-wq7f), [JXL/HEIF parsing](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), and [ICNS parsing](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr). A successful build and local walkthrough do not resolve these findings.

## Data boundary

This edition has no backend credentials or production service configuration. Do not add real accounts, clinical records, private educational content, service accounts, signing certificates, or production environment files.

The sample answers are public by design. Client-side scoring and the fixed demo identity are not security controls. The session adapter is intended for one local demonstration, not an authenticated service.

The repository excludes original history, CSV banks, backups, logs, deployment settings and existing store screenshots. A filename ignore list is a secondary safeguard, not a substitute for reviewing every published file.

Before publishing a changed edition, inspect the complete file inventory and generated bundles for credentials, private content and identifiers. Review screenshots visually. Dependency security must be reassessed when upgrading or deploying; passing local checks is not a security certification.

For a suspected disclosure, contact the repository owner privately through a previously established channel. Do not post credentials or private material in public issues.
