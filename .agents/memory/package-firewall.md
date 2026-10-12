---
name: Package firewall
description: Handling security-blocked dependencies while preserving the imported runtime.
---

When an imported test runner brings in a firewall-blocked dependency, upgrade the runner to a safe release compatible with the existing Node runtime rather than bypassing the firewall or changing the runtime unnecessarily.

**Why:** Installation of this import was blocked by a critical-vulnerability policy on a transitive test dependency; the newest runner major required a newer Node runtime, while a supported intermediate major installed and passed the existing tests.

**How to apply:** Check the parent package's available versions and engine requirements before choosing an upgrade. Keep dependency changes scoped to getting the existing project running.
