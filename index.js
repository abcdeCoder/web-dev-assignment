const perPageOptions = [10, 25, 50, 100];
let currentPage = 1;
let perPage = perPageOptions[0];

function searchUser() {
    const username = document.getElementById('usernameInput').value;
    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    showLoading();

    // API endpoint for user details
    const userApiUrl = `https://api.github.com/users/${username}`;

    // API endpoint for public repositories of a user
    const repoApiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;

    // jQuery for AJAX request for user details
    $.ajax({
        url: userApiUrl,
        method: 'GET',
        success: function (userData) {
            // jQuery for AJAX request for repositories
            $.ajax({
                url: repoApiUrl,
                method: 'GET',
                success: function (repoData) {
                    displayUserDetails(userData);
                    displayRepositories(repoData, userData);
                    hideLoading();
                },
                error: function (repoError) {
                    console.error('Error fetching repositories:', repoError);
                    hideLoading();
                }
            });
        },
        error: function (userError) {
            console.error('Error fetching user details:', userError);
            hideLoading();
        }
    });
}

function displayUserDetails(userData) {
    const userDetailsContainer = document.getElementById('userDetails');
    userDetailsContainer.innerHTML = '';

    const userDiv = document.createElement('div');
    userDiv.classList.add('user-details');

    const avatarDiv = document.createElement('div');
    avatarDiv.innerHTML = `<img src="${userData.avatar_url}" alt="User Avatar" class="user-avatar">
    <p>
    <a href="${userData.html_url}" target="_blank" style="display: flex; align-items: center; text-decoration: none; color: black;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link" viewBox="0 0 16 16">
            <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
            <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
        </svg>
                                     ${userData.html_url}
    </a>
</p>

    `;
    userDiv.appendChild(avatarDiv);

    const userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('user-info');
    userInfoDiv.innerHTML = `
        <p class="user-name">${userData.name || 'Name not available'}</p>
        <p>${userData.bio || 'No bio available.'}</p>
        <div><p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
    </svg>${userData.location || 'No location available.'}</p></div>
    `;

    if (userData.twitter_username) {
        const twitterUrl = `https://twitter.com/${userData.twitter_username}`;
        userInfoDiv.innerHTML += `<p>Twitter: <a href="${twitterUrl}" target="_blank">${twitterUrl}</a></p>`;
    } else {
        userInfoDiv.innerHTML += `<p>Twitter: Not Available</p>`;
    }

    userDiv.appendChild(userInfoDiv);

    userDetailsContainer.appendChild(userDiv);
}

function displayRepositories(repoData, userData) {
    const repositoriesContainer = document.getElementById('repositories');

    repositoriesContainer.innerHTML = '';

    repoData.forEach(repo => {
        const repoCardDiv = document.createElement('div');
        repoCardDiv.classList.add('repo-card');

        repoCardDiv.innerHTML += `
            <p class="repo-name"><a href="${repo.html_url}" target="_blank"  style="text-decoration: none;">${repo.name}</a></p>
            <p class="repo-description">${repo.description || 'No description available.'}</p>
            <p class="repo-topics">Topic: ${repo.topics.join(', ') || 'Not specified'}</p>
        `;

        repositoriesContainer.appendChild(repoCardDiv);
    });


    
    // _____________________________________________________________________________________________________________________

    const paginationContainer = document.getElementById('pagination');
paginationContainer.innerHTML = '';

const totalPages = Math.ceil(userData.public_repos / perPage);

// Create pagination structure with "<<", ">>", "--->", and "<---" symbols
const paginationDiv = document.createElement('div');
paginationDiv.id = 'pagination-contain';
paginationDiv.className = 'pagination-container';

const paginationList = document.createElement('ul');
paginationList.className = 'pagination';

// Create "<<"
const doubleLeftArrowButton = createPaginationButton('<<', () => {
    if (currentPage > 1) {
        currentPage = 1;
        searchUser();
    }
});
paginationList.appendChild(createPaginationItem(doubleLeftArrowButton));

// Create page number buttons
for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPaginationButton(i.toString(), () => {
        currentPage = i;
        searchUser();
    });

    // Highlight the current page with blue color
    if (i === currentPage) {
        pageButton.style.backgroundColor = 'blue';
        pageButton.style.color = 'white';
    }

    paginationList.appendChild(createPaginationItem(pageButton));
}

// Create ">>"
const doubleRightArrowButton = createPaginationButton('>>', () => {
    if (currentPage < totalPages) {
        currentPage = totalPages;
        searchUser();
    }
});
paginationList.appendChild(createPaginationItem(doubleRightArrowButton));

paginationDiv.appendChild(paginationList);
paginationContainer.appendChild(paginationDiv);

function createPaginationButton(text, onClickHandler) {
    const button = document.createElement('button');
    button.className = 'page-link';
    button.textContent = text;
    button.addEventListener('click', onClickHandler);
    return button;
}

function createPaginationItem(content) {
    const listItem = document.createElement('li');
    listItem.className = 'page-item';
    listItem.appendChild(content);
    return listItem;
}



const prevButton = createPaginationButton('← older', () => {

    if (currentPage > 1) {
        currentPage--;
        searchUser();
    }

    if(currentPage === 1) {
        prevButton.disabled = true;
    }
    updatePaginationButtons();
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i.toString(), () => {
            currentPage = i;
            searchUser();
        });
    
        // Highlight the current page with blue color
        if (i === currentPage) {
            pageButton.style.backgroundColor = 'blue';
            pageButton.style.color = 'white';
        }
    
        paginationList.appendChild(createPaginationItem(pageButton));
    }
    
});
prevButton.id = 'oldest-button'; 
prevButton.style =' color: #007bff'
paginationContainer.appendChild(prevButton);
paginationContainer.appendChild(prevButton);

const nextButton = createPaginationButton('newer →', () => {

    if (currentPage < totalPages) {
        currentPage++;
        searchUser();
    }
    updatePaginationButtons();
    if(currentPage === totalPages) {
        nextButton.disabled = true;
    }
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i.toString(), () => {
            currentPage = i;
            searchUser();
        });
    
        // Highlight the current page with blue color
        if (i === currentPage) {
            pageButton.style.backgroundColor = 'blue';
            pageButton.style.color = 'white';
        }
        
        paginationList.appendChild(createPaginationItem(pageButton));
    }
    
});
nextButton.id = 'newest-button'; 
nextButton.style =' color: #007bff'
paginationContainer.appendChild(nextButton);
paginationContainer.appendChild(nextButton);
function updatePaginationButtons() {
    // Disable the "Previous" button if on the first page
    if(prevButton.disabled = currentPage === 1){
        prevButton.style ='color: rgb(0, 0, 0)'
    }

    // Disable the "Next" button if on the last page
    if(nextButton.disabled = currentPage === totalPages){
        nextButton.style ='color: rgb(0, 0, 0)'
    }
}

// Initial update of pagination buttons
updatePaginationButtons();
function createPaginationButton(text, onClickHandler) {
    const button = document.createElement('button');
    button.className = 'page-link';
    button.textContent = text;
    button.addEventListener('click', onClickHandler);
    return button;
}

function createPaginationItem(content) {
    const listItem = document.createElement('li');
    listItem.className = 'page-item';
    listItem.style.listStyleType = 'none'; // Remove bullet points for list items
    listItem.style.display = 'inline-block'; // Display items in a line
    listItem.appendChild(content);
    return listItem;
}

    
    


    // Per page options
    const perPageSelect = document.createElement('select');
    perPageSelect.addEventListener('change', (event) => {
        perPage = parseInt(event.target.value);
        currentPage = 1;
        searchUser();
    });

    perPageOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;
        perPageSelect.appendChild(optionElement);
    });

    perPageSelect.value = perPage;
    paginationContainer.appendChild(perPageSelect);
}

function createPaginationButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('pagination-button');
    button.addEventListener('click', clickHandler);
    return button;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('inner').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('inner').style.display = 'block';
}


