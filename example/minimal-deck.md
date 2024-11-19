---
title: A minimal Decker deck
pandoc:
  filters:
    before:
    - get-meta-info.lua

resource-pack: ../resource/nwburg

# These variables are overwriting the default values in the template, therefore they are nested under `template`.
template:
  favicon:  './hci-logo-red.png'
  teaser-image: './preview-image.webp'

# These variables are used on the index page to generate the table of contents.
index:
  chapter: 1
  section: 1
  subsection: 1
  subsubsection: 1
  description: This is a minimal Decker deck.
  keywords: 
    - Decker
    - minimal
    - example
---

# Decker

(This space intentionally left blank)   
  