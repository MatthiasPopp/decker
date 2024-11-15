-- This Pandoc filter creates a specific file named 'index.md' in the same directory

function Pandoc(doc)
    -- Define the path for the new file
    local file_path = "index.md"
    
    -- Open the file in write mode
    local file = io.open(file_path, "w")
    
    -- Define the content to write
    local content = [[
---
title: A minimal Decker deck
---

# Decker

(This space intentionally left blank)
]]

    -- Write the content to the file
    file:write(content)
    file:close()

    -- Return the original document unmodified
    return doc
end
