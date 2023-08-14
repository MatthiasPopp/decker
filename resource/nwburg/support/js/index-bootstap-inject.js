// Function to extract presentations from the page
async function extractPresentations() {
    const presentations = [];

    // Find all <h2> elements preceding <ul> elements
    const sectionHeaders = document.querySelectorAll('h2 + ul');

    for (const header of sectionHeaders) {
        const sectionTitle = header.previousElementSibling.textContent;

        const presentationLinks = header.querySelectorAll('a');

        const presentationsInSection = [];

        for (const link of presentationLinks) {
            const presentationTitle = link.textContent;
            const presentationURL = link.getAttribute('href');


            // Fetch the presentation HTML using AJAX
            const response = await fetch(presentationURL);
            const presentationHTML = await response.text();

            // Parse the presentation HTML to extract information
            const parser = new DOMParser();
            const presentationDoc = parser.parseFromString(presentationHTML, 'text/html');

            // Extract chapter and section from the filename. 
            // Removing the path before.
            const filename = presentationURL.split('/').pop();
            const filenameParts = filename.split('-');
            const chapter = filenameParts[0];
            const section = /^[0-9]{2}$/.test(filenameParts[1]) ? filenameParts[1] : '';

            // Extract the title from the rest of the filename. If there was a valid section, the title starts at index 2, otherwise at index 1.
            // The  title should be capitalized and have spaces instead of dashes.

            const titleParts = filenameParts.slice(section ? 2 : 1);
            const presentationTitleWithoutOrdinal = titleParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

            const titleElement = presentationDoc.querySelector('.title') || presentationDoc.querySelector('title');
            const subtitleElement = presentationDoc.querySelector('.subtitle');
            const dateElement = presentationDoc.querySelector('.date');
            const authorElement = presentationDoc.querySelector('.author');
            const teaserImageElement = presentationDoc.querySelector('.teaser-img img');
            const affiliationLogoElement = presentationDoc.querySelector('.affiliation-logo img');
            const affiliationElement = presentationDoc.querySelector('.affiliation');
            const keywordsElement = presentationDoc.querySelector('meta[name="keywords"]');
            const keywords = keywordsElement ? keywordsElement.getAttribute('content').split(', ') : [];

            // If the presentation URL ends with -handout.html, add it as 
            // a handout to the presentations array element that was added 
            // already with the same section title.
            if (presentationURL.endsWith('-handout.html')) {

                const deckPresentationURL = presentationURL.replace('-handout.html', '-deck.html');
                const correspondingSection = presentations.find(section => section.sectionTitle === sectionTitle);
                const correspondingPresentation = correspondingSection.sectionPresentations.find(presentation => presentation.url === deckPresentationURL);
                correspondingPresentation.info.handout = presentationURL;
                continue;
            }

            const presentationInfo = {
                title: titleElement ? titleElement.textContent.trim() : '',
                subtitle: subtitleElement ? subtitleElement.textContent.trim() : '',
                date: dateElement ? dateElement.textContent.trim() : '',
                author: authorElement ? authorElement.textContent.trim() : '',
                teaserImage: teaserImageElement ? teaserImageElement.getAttribute('src') : '',
                affiliationLogo: affiliationLogoElement ? affiliationLogoElement.getAttribute('src') : '',
                affiliation: affiliationElement ? affiliationElement.textContent.trim() : '',
                chapter: chapter,
                section: section,
                keywords: keywords,
                url: presentationURL,
                supplemental: []
            };

            // if there is a keyword sublimental, add the presentation to the supplemental section 
            // of the corresponding section, identified by the chapter and section number
            if (keywords.includes('supplemental')) {
                // iterate over all presentationsInSection and each sectionPresentation of them 
                // to find the corresponding presentation

                let found = false;
                for (const sectionPresentation of presentations) {
                    if (found)
                        break;
                    for (const presentation of sectionPresentation.sectionPresentations) {
                        if (found)
                            break;
                        if (presentation.info.chapter === chapter) {
                            //query the icon 2
                            // <link rel="shortcut icon" href="../support/icons/favicon.ico">
                            // and add it to the supplemental presentation

                            const iconElement = presentationDoc.querySelector('link[rel="shortcut icon"]');
                            // misuse the affiliationLogo to store the icon
                            presentationInfo.affiliationLogo = iconElement ? iconElement.getAttribute('href') : '';
                            presentation.info.supplemental.push( presentationInfo );
                            found = true;
                            break;
                        }
                    }
                }
                if (found) {
                    // if there is a corresponding presentation,
                    // add the supplemental presentation is now just a icon and url
                    continue;
                }
            }



            presentationsInSection.push({
                title: presentationTitleWithoutOrdinal,
                url: presentationURL,
                info: presentationInfo,
            });
        }

        presentations.push({
            sectionTitle: sectionTitle,
            sectionPresentations: presentationsInSection
        });
    }

    removeExcludedDirectories('', presentations);
    removeEmptySections(presentations);

    return presentations;
}

   

function removeExcludedDirectories(prefix, sections) {
// In the header there is an optional list of directories to exclude from the index.
//    $if(index.exclude-dirs)$
//   <!-- Exclude directories from search index -->
//   <!-- The exclude dirs is a list of directories. Create a ul with li elements -->
//   <ul id="search-exclude-dirs" style="display: none;">
//     $for(index.exclude-dirs)$
//     <li>$index.exclude-dirs$</li>
//     $endfor$
//   </ul>
//   $endif$
//
// This function removes presentations that are in one of the excluded directories.

    const excludeDirs = document.getElementById('search-exclude-dirs');
    if (!excludeDirs) {
        return;
    }

    const excludedDirs = Array.from(excludeDirs.children).map(li => li.textContent.trim());

    //debug
    console.log('Checking for excluded directories: ' + excludedDirs.join(', '));

    // Remove excluded directories from the presentations array
    for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];

        for (let j = section.sectionPresentations.length - 1; j >= 0; j--) {
            console.log('Checking ' + section.sectionPresentations[j].url);
            const presentation = section.sectionPresentations[j];
            if (excludedDirs.some(excludedDir => presentation.url.startsWith(prefix + excludedDir))) {
                section.sectionPresentations.splice(j, 1);
                console.log('Removing ' + presentation.url);
            }else
            {
                console.log('Keeping ' + presentation.url);
            }
        }

    }
}

function removeEmptySections(presentations) {
    // Remove sections that have no presentations
    for (let i = presentations.length - 1; i >= 0; i--) {
        const section = presentations[i];

        if (section.sectionPresentations.length === 0) {
            presentations.splice(i, 1);
        }
    }
}



// Function to populate tiles (modify according to your data)
async function populateTiles() {
    const tileContainer = document.getElementById('tileContainer');
    const presentations = await extractPresentations();

    presentations.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('section-description');

        const sectionTitle = document.createElement('h2');
        sectionTitle.classList.add('section-title');
        sectionTitle.textContent = section.sectionTitle;
        // TODO add option to add description

        sectionDiv.appendChild(sectionTitle);
        tileContainer.appendChild(sectionDiv);

        let previousChapter = '';
        section.sectionPresentations.forEach(presentation => {
            const card = document.createElement('div');
            card.classList.add('card', 'chapter');
            card.innerHTML = `
          <a href="${presentation.url}" class="card-link">
            <img src="${presentation.info.teaserImage}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${presentation.info.chapter} ${presentation.info.section} ${presentation.info.title}</h5>
            </div>
          </a>
        `;
            // add a div using css flex flow to add handout and supplemental links
            const cardLinks = document.createElement('div');
            cardLinks.classList.add('card-links');
            card.appendChild(cardLinks);


            // add handout link if available as an icon
            if (presentation.info.handout) {
                const handoutLink = document.createElement('a');
                handoutLink.href = presentation.info.handout;
                handoutLink.target = '_blank';
                handoutLink.innerHTML = `
            <img src="https://img.icons8.com/?size=50&id=y7PxIZBtQmoP&format=png" class="handout-icon" alt="handout">
            `;
                // add handout text 
                const handoutText = document.createElement('span');
                handoutText.classList.add('handout-text');
                handoutText.textContent = 'Handout';
                handoutLink.appendChild(handoutText);

                // add handout link to card flex container

                cardLinks.appendChild(handoutLink);

                // card.appendChild(handoutLink);
            }

            // add supplemental link if available as an icon
            if (presentation.info.supplemental) {
                for (const supplemental of presentation.info.supplemental) {
                    
                    const supplementalLink = document.createElement('a');
                    supplementalLink.href = supplemental.url;
                    supplementalLink.target = '_blank';

                    const supplementalIcon = document.createElement('img');
                    supplementalIcon.src = supplemental.affiliationLogo;
                    supplementalIcon.classList.add('supplemental-icon');
                    // make it use 10% of the card width


                    supplementalLink.appendChild(supplementalIcon);

                    supplementalText = document.createElement('span');
                    supplementalText.classList.add('supplemental-text');
                    supplementalText.textContent = supplemental.title;
                    supplementalLink.appendChild(supplementalText);

                    supplementalLink.style.width = '10%';

                    cardLinks.appendChild(supplementalLink);

                    // card.appendChild(supplementalLink);
                }
            }

            // add keywords as labels at the bottom of the card 

            const keywords = presentation.info.keywords;
            if (keywords.length > 0) {
                const keywordContainer = document.createElement('div');
                keywordContainer.classList.add('keyword-container');
                keywords.forEach(keyword => {
                    const keywordElement = document.createElement('span');
                    keywordElement.classList.add('badge', 'badge-pill', 'badge-secondary', 'keyword');
                    keywordElement.textContent = keyword;
                    keywordContainer.appendChild(keywordElement);
                });
                card.appendChild(keywordContainer);
            }

            // check if the previously added card has a different chapter than the current one
            // if so add a new div with the chapter title that spans the entire width of the container
            if (previousChapter !== presentation.info.chapter) {
                const chapterTitle = document.createElement('div');
                chapterTitle.classList.add('chapter-title');
                chapterTitle.textContent = presentation.info.chapter;
                tileContainer.appendChild(chapterTitle);
                previousChapter = presentation.info.chapter;
            }

            tileContainer.appendChild(card);
        });

    });
}

/**
 * Function to remove the default layout. The default layout is the one that is
 * shown before the data is loaded. This function is called after the data is
 * loaded.
 * The default layout is removed by removing the element with the class
 * 'default-layout'.
 */
function removeDefaultLayout() {
    let defaultLayout = document.getElementsByClassName('default-layout')[0];
    defaultLayout.parentNode.removeChild(defaultLayout);
}



// Function to add filters (modify according to your data)
function addFilters() {
    // Get filter elements, e.g., search input and checkboxes
    const searchInput = document.getElementById('searchInput');
    const checkbox = document.getElementById('checkbox');

    // Add event listeners to filters
    searchInput.addEventListener('input', filterTiles);
    checkbox.addEventListener('change', filterTiles);
}

// Function to filter tiles based on search input and checkboxes
function filterTiles() {
    // Filter logic based on search input and checkboxes
    // Modify the presentation display based on filters
}




// Function to filter tiles based on search input (modify as needed)
function filterTiles() {
    $(document).ready(function () {

        let $grid = $('.grid');
        let $items = $grid.children('.card');
        let currentCat = 'all';
        let sidebar = [];
        let sortItems = (a, b) => {
            let an = a.getAttribute('data-order');
            let bn = b.getAttribute('data-order');

            if (an > bn) { return 1; }
            if (an < bn) { return -1; }
            return 0;
        }

        let filterItems = function () {
            let cat = this.getAttribute('data-category');
            let newSidebar = [];

            $('.button--is-active').toggleClass('button--is-active');
            $(`.button[data-category=${cat}]`).toggleClass('button--is-active');

            $grid.fadeOut("slow", function () {

                sidebar.map((item) => $(item).appendTo($grid));

                if (cat === 'all') {
                    $items.sort(sortItems).detach().appendTo($grid);
                } else {
                    $(`.card:not([data-category=${cat}])`).each(function () {
                        newSidebar.push($(this).detach());
                    });
                }
                sidebar = newSidebar;
                currentCat = cat;
            }).fadeIn("slow");
        };

        // Handle the click on a category filter button
        $('.js-button-filter').click(filterItems);



    });
}




