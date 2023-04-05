// Checking if the page is google search but not a google search results page
const URL = window.location.href;
const includesGoogle = URL.includes('www.google.com');
const canRun =
  (!URL.includes('search') && includesGoogle) ||
  !URL.includes('chat.openai.com');

console.log(`I'm Feeling ChatGPT Extension Loaded 🤖`);

if (URL.includes('chat.openai.com')) {
  let prompt = null;
  let dateTime = null;

  chrome.storage.local.get(['prompt', 'dateTime']).then((saved) => {
    console.log('Saved Data is: ', saved.prompt, saved.dateTime);

    prompt = saved.prompt;
    dateTime = saved.dateTime;
  });

  console.log(`Prompt is: ${prompt} and Date is: ${dateTime}`);

  // Wait for the chat page to load
  // chatWindow.addEventListener('load', function () {
  //   console.log('CHAT WINDOW OPENED 3');

  //   // Find the message input field and set its value to the search input
  //   let messageInput = chatWindow.document.querySelector(
  //     'textarea[placeholder="Send a message..."]'
  //   );
  //   messageInput.value = searchInput;

  //   let form = document.querySelector('form');

  //   // Find the button inside the form
  //   let sendButton = form.querySelector('button');
  //   sendButton.click();
  // });
}

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
const setToTeal = (selector, chatgptMessage) => {
  document.querySelectorAll(selector).forEach(function (item) {
    if (chatgptMessage) {
      item.classList.add('Teal-Text');
    } else {
      item.classList.remove('Teal-Text');
    }
  });
};

const sendToChatGPT = (prompt) => {
  // Function to save prompt and current date and time
  const dateTime = new Date().toLocaleString();

  chrome.storage.local.set({ prompt, dateTime }).then(() => {
    console.log('Saved values message: ', prompt, ' Date: ', dateTime);
  });

  window.location.href = 'https://chat.openai.com/chat';
};

const chatgptMessage = () => {
  // gets the input value from the function
  const search = getSearchValue();
  // checks it has returned a value
  if (search) {
    sendToChatGPT(search);
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
    chatgptMessage();
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
  const chatgptMessage = search?.includes(searchPrefix);
  // Search Field text
  setToTeal('[title="Search"]', chatgptMessage);
  // Suggestion text
  setToTeal('[role="option"]', chatgptMessage);
  // Checking it can run and it is the enter key
  if (e.code == 'Enter' && chatgptMessage) {
    e.preventDefault();
    // removes "/s+" from the start of our query
    const searchCleaned = search.trim().replace(searchPrefix, '');
    sendToChatGPT(searchCleaned);
    // window.location.href = `https://stackoverflow.com/search?q=${searchCleaned}`;
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

  const ChatgptButtonInnerNoAnimation = `
    <img src="${ChatgptLogo}" alt="" class="ChatGPT-Logo Flex-Center" style="margin-right: 4px;">
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
                    <button onclick="chatgptMessage()" class="ChatGPT-Button Button Flex-Center">
                      ${ChatgptButtonInner}
                    </button>
                </div>
            `;
      // replacing the feeling lucky button
      inputs[i].replaceWith(ButtonAnimated);
    } else {
      // Creating the new ChatGPT button
      const newButton = document.createElement('button');
      newButton.innerHTML = ChatgptButtonInnerNoAnimation;
      newButton.classList.add('ChatGPT-Button', 'Button', 'Inline-Flex');
      newButton.style.transform = 'translateY(4px)';
      newButton.onclick = () => chatgptMessage();
      // replacing the feeling lucky button
      inputs[i].replaceWith(newButton);
    }
  }
}
