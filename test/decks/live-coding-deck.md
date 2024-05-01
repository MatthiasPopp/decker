---
subtitle: Edit and Execute Code Blocks
template:
  css:
  - "https://unpkg.com/@antonz/codapi@0.19.0/dist/snippet.css"
  - codapi.css
  js:
  - "https://unpkg.com/@antonz/codapi@0.19.0/dist/snippet.js"
templates:
  live-code: |
    <codapi-snippet sandbox=":(title)" editor="basic" selector=":(url)"></codapi-snippet>
    <script type="module">
      import {CodeJar} from "https://cdn.jsdelivr.net/npm/codejar@4.2.0/+esm";
      let jar = CodeJar(document.querySelector(':(url)'));
    </script>
  live-code-server: |
    <codapi-settings url=":(url)"> </codapi-settings>
title: Live Coding
---

# Live Coding in Code Blocks {.columns}

## {.left}

No Jupyter, but a self-hosted server with standard Docker images that run the
code snippets:

-   [codapi](https://codapi.org)
-   [codapi-js](https://github.com/nalgeon/codapi-js)

The server runs at:

-   <https://codapi.tramberend.de>

## {.right}

Languages (so far):

-   Python
-   Rust
-   Haskell

## TODO {.accent4}

-   integrate [CodeJar](https://medv.io/codejar/) for better editing
-   integrate [PrismJS](https://prismjs.com/) for syntax highlighting

# Python

``` {#python-1 .live-code}
msg = "Hello, World!"
print(msg)
```

[@live-code](#python-1 "python")

# Rust

``` {#rust-1 .live-code}
fn main() {
   print!("Hello, World!"); 
}
```

[@live-code](#rust-1 "rust")

# Haskell

``` {#haskell-1 .live-code}
main = putStrLn "Hello, World!"
```

[@live-code](#haskell-1 "haskell")

[@live-code-server](https://codapi.tramberend.de/v1)
