// Checking if the page is google search but not a google search results page
const URL = window.location.href;
const includesGoogle = URL.includes('www.google.com');
const canRun = !URL.includes('search') && includesGoogle;

const getSearchValue = () => {
  const searchValue = document.querySelector('[title="Search"]').value;
  // If the value is not blank it continues
  if (searchValue.length) {
    // Replaces spaces in the query with pluses to work in url query
    const formattedValue = searchValue.replace(/\s/g, '+');
    // Sends the cleaned up value back
    return formattedValue;
  }
};

// Edits the suggestions google gives so they can send you to ChatGPT too
const setToTeal = (selector, stackSearch) => {
  document.querySelectorAll(selector).forEach(function (item) {
    if (stackSearch) {
      item.classList.add('Teal-Text');
    } else {
      item.classList.remove('Teal-Text');
    }
  });
};

const stackSearch = () => {
  // gets the input value from the function
  const search = getSearchValue();
  // checks it has returned a value
  if (search) {
    // visits the search
    window.location.href = `https://stackoverflow.com/search?q=${search}`;
  }
};

window.onbeforeunload = function (e) {
  if (!includesGoogle) return;
  return e.preventDefault();
};

document.addEventListener(
  'click',
  (e) => {
    // Don't want it running on google search / result pages
    if (!includesGoogle) return;
    // If we have not clicked on the ChatGPT button we want the page
    // to behave the same as normal
    if (!e.target.matches('.ChatGPT-Button')) return;
    // Prevent default click action that google does ( searches )
    e.preventDefault();
    // Now we run our search Function
    stackSearch();
  },
  false
);

const searchPrefix = `/c`;

document.addEventListener('keyup', (e) => {
  // The search and results page both use the same input title
  // This code can run on both (⌐■_■)
  if (!includesGoogle) return;
  // Gets the search value, checks it has a value and checks for the "/s" command
  const search = getSearchValue();
  const stackSearch = search?.includes(searchPrefix);
  // Search Field text
  setToTeal('[title="Search"]', stackSearch);
  // Suggestion text
  setToTeal('[role="option"]', stackSearch);
  // Checking it can run and it is the enter key
  if (e.code == 'Enter' && stackSearch) {
    e.preventDefault();
    // removes "/s+" from the start of our query
    const searchCleaned = search.trim().replace(searchPrefix, '');
    window.location.href = `https://stackoverflow.com/search?q=${searchCleaned}`;
  }
});

const rgbToHex = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

// This runs if this is the correct page
if (canRun) {
  // Grabs the buttons color to account for dark mode and any styling changes
  const luckyButton = document.querySelector(
    'input[value="I\'m Feeling Lucky"]'
  );
  const colour = window.getComputedStyle(luckyButton).getPropertyValue('color');
  const backgroundColour = window
    .getComputedStyle(luckyButton)
    .getPropertyValue('background-color');

  const ChatgptLogo = chrome.runtime.getURL('images/chatgpt-logo.png');
  const ChatgptButtonInner = `
    <span class="ChatGPT-Logo-Container Flex-Center">
      <img src="${ChatgptLogo}" alt="" class="ChatGPT-Logo Flex-Center">
    </span>
    ChatGPT
  `;

  // Finding each "I'm feeling lucky" Button
  var inputs = document.querySelectorAll('input[name="btnI"]');
  for (i = 0; i < inputs.length; i++) {
    // This is the main home screen Button that is going to be animated
    if (i == 1) {
      // Creating our animated button so there is no jump on load
      const ButtonAnimated = document.createElement('div');
      ButtonAnimated.classList.add('Button-Container-Viewport');
      ButtonAnimated.innerHTML = `
                <div class="Button-Container">
                    <button class="Button" style="color: ${colour}; background-color: ${backgroundColour};">I'm Feeling Lucky</button>
                    <button onclick="stackSearch()" class="ChatGPT-Button Button Flex-Center">
                      ${ChatgptButtonInner}
                    </button>
                </div>
            `;
      // replacing the feeling lucky button
      inputs[i].replaceWith(ButtonAnimated);
    } else {
      // Creating the new ChatGPT button
      const newButton = document.createElement('button');
      newButton.innerHTML = ChatgptButtonInner;
      newButton.classList.add('ChatGPT-Button', 'Button', 'Flex-Center');
      newButton.onclick = () => stackSearch();
      // replacing the feeling lucky button
      inputs[i].replaceWith(newButton);
    }
  }
}
