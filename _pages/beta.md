---
layout: page
language: en
lang: en
locale: en_US
title: Beta
description: TaigiKeyboard desktop beta builds for internal testing.
permalink: /beta
sitemap: false
noindex: true
---

{% comment %}
Unlisted page for internal testers. `_data/beta_release.json` is written by
taigikeyboard's tools/release/beta-release.sh. A beta whose version any
published release data already names is over, so it is hidden.
{% endcomment %}
{% assign beta = site.data.beta_release %}
{% assign published = false %}
{% assign release_files = "macos_release,windows_release,linux_release,linux_rpm_release,linux_arch_release,chromeos_release" | split: "," %}
{% for name in release_files %}
{% if site.data[name].version == beta.version %}{% assign published = true %}{% endif %}
{% endfor %}

# Desktop beta

{% if beta.version and published == false %}
**{{ beta.version }}** · `{{ beta.commit | slice: 0, 7 }}`

{% comment %}`label` / `requires`: the OS and the oldest version it runs on,
from DESKTOP_ASSET_ROWS in taigikeyboard's tools/release/lib/desktop-release.sh.{% endcomment %}
{% for asset in beta.assets %}- **{{ asset.label }}** ({{ asset.requires }}): [{{ asset.name }}]({{ asset.url }})
{% endfor %}
{% else %}
No beta build.
{% endif %}
