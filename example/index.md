---
title: Generated Index
subtitle: #{cwd}
pandoc:
  filters:
    before:
---
``` {.javascript .run}
import("./" + Decker.meta.supportPath + "/fuzzySearch/search.js")
    .then((module) => {
      anchor.classList.add("search");
      anchor.innerHTML = `
        <p>
          <i class="fa-solid fa-magnifying-glass"></i>
          <input class="search" placeholder="In Folien suchen" type="text">
        </p>
        <table class="search">
        <thead><tr><th>Wort</th><th>Foliensatz</th><th>Folie</th><th>Treffer</th></tr></thead>
        <tbody></tbody>
        </table>
      `;
      module.default(anchor, 0.6);
    });
```
\# Slide decks
#{unlines decksLinks}
\# Handouts
#{unlines handoutsLinks}
\# Supporting Documents
#{unlines pagesLinks}
\# Questions
#{unlines questLinks}