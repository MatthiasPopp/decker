-- This Pandoc filter prints metadata and variables to a file named after the document's title and the current timestamp

function get_safe_filename(title)
    -- Replace spaces with underscores and remove non-alphanumeric characters except underscores and periods
    return title:gsub("%s", "_"):gsub("[^%w_%.]", "")
end

function Pandoc(doc)
    local title = pandoc.utils.stringify(doc.meta.title or "Untitled")
    local safe_title = get_safe_filename(title)
    local date = os.date("%Y-%m-%d_%H-%M-%S")
    local debug_file_path = safe_title .. "_" .. date .. ".md_"

    local file = io.open(debug_file_path, "w")

    -- Write Metadata
    file:write("# Metadata\n\n")
    for key, value in pairs(doc.meta) do
        file:write(key .. ": " .. pandoc.utils.stringify(value) .. "\n")
    end

    -- write doc body
    file:write("\n# Body\n\n")
    for _, block in pairs(doc.blocks) do
        file:write(pandoc.utils.stringify(block) .. "\n")
    end

    -- write doc ast
    file:write("\n# AST\n\n")
    file:write(pandoc.utils.stringify(doc) .. "\n")
    

    -- -- Write Variables (from PANDOC_STATE)
    -- file:write("\n# Variables\n\n")
    -- for key, value in pairs(PANDOC_STATE['variables']) do
    --     file:write(key .. ": " .. tostring(value) .. "\n")
    -- end

    file:close()

    return doc
end
