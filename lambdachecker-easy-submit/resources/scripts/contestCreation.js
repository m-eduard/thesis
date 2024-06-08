const vscode = acquireVsCodeApi();
var freshUsers = [];
var freshProblems = [];

const previousState = vscode.getState();
console.log("Previous state: ", previousState);

window.addEventListener("message", event => {
  console.log("received data from API", event.data);

  if (event.data.users !== undefined) {
    freshUsers = event.data.users;
  }

  if (event.data.problems !== undefined) {
    console.log(event.data.problems);

    freshProblems = event.data.problems.reverse().map((problem) => `${problem.id}. ${problem.name}`);
  }
});

function revealPassword() {
  const passwordBox = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");

  if (passwordBox.type === "password") {
    passwordBox.type = "text";
    eyeIcon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>';
  } else {
    passwordBox.type = "password";
    eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
  }
}

document.getElementById('contestForm').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});

document.getElementById('collab-input').addEventListener('input', (e) => searchMatchingUsers(e.target.value, freshUsers));
document.getElementById('collab-input').addEventListener('focus', () => searchMatchingUsers(document.getElementById('collab-input').value, freshUsers));
document.getElementById('collab-input').addEventListener('blur', () => disposeSuggestionsContainer('suggestions'));


document.getElementById('subject-input').addEventListener('input', (e) => searchMatchingStrings(e.target.value, subjects, 'subject'));
document.getElementById('subject-input').addEventListener('focus', () => searchMatchingStrings(document.getElementById('subject-input').value, subjects, 'subject'));
document.getElementById('subject-input').addEventListener('blur', () => disposeSuggestionsContainer('subject-suggestions'));

document.getElementById('problems-input').addEventListener('input', (e) => searchMatchingStrings(e.target.value, freshProblems, 'problems', true));
document.getElementById('problems-input').addEventListener('focus', () => {
  searchMatchingStrings(document.getElementById('problems-input').value, freshProblems, 'problems', true);

  const inputTextbox = document.getElementById('problems-input');
  inputTextbox.style.borderLeft = 'solid #8c30f5 1px';
  inputTextbox.style.borderBottom = 'solid #8c30f5 1px';

  if (selectedItems.length === 0) {
    inputTextbox.style.borderTop = 'solid #8c30f5 1px';
  } else {
    const contentWrapper = document.getElementById('input-wrapper');
    contentWrapper.style.width = inputTextbox.style.width;
    contentWrapper.style.borderTop = 'solid #8c30f5 1px';
    contentWrapper.style.borderLeft = 'solid #8c30f5 1px';
    contentWrapper.style.borderRight = 'solid #8c30f5 1px';
  }
});
document.getElementById('problems-input').addEventListener('blur', () => {
  disposeSuggestionsContainer('problems-suggestions');

  const inputTextbox = document.getElementById('problems-input');
  inputTextbox.style.border = 'none';
  const contentWrapper = document.getElementById('input-wrapper');
  contentWrapper.style.border = 'none';
  // contentWrapper.style.width = '100% - 2px';
});
document.getElementById('problems-input').addEventListener('keydown', (e) => {
  handleDeleteKey(e, 'problems');
});


function disposeSuggestionsContainer(containerId) {
  const suggestionsContainer = document.getElementById(containerId);
  suggestionsContainer.innerHTML = '';
}

function searchMatchingUsers(querySubstring, data) {
  querySubstring = querySubstring.toLowerCase();

  const suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = '';
  
  if (querySubstring !== undefined) {
    const matches = data.filter(item => {
      const fullName = item.first_name + ' ' + item.last_name;

      return fullName.toLowerCase().includes(querySubstring) ||
        item.username.toLowerCase().includes(querySubstring) ||
        item.email.toLowerCase().includes(querySubstring);
    });
    
    matches.forEach(item => {
      const fullName = item.first_name + ' ' + item.last_name;
      const fullNameIdx = fullName.toLowerCase().indexOf(querySubstring);
      const usernameIdx = item.username.toLowerCase().indexOf(querySubstring);
      const emailIdx = item.email.toLowerCase().indexOf(querySubstring);

      let formattedFullName = fullName;
      if (fullName.toLowerCase().includes(querySubstring)) {
        formattedFullName = fullName.substring(0, fullNameIdx) + '<span class="highlight">' + fullName.substring(fullNameIdx, fullNameIdx + querySubstring.length) + '</span>' + fullName.substring(fullNameIdx + querySubstring.length);
      }

      let formattedUsername = item.username;
      if (item.username.toLowerCase().includes(querySubstring)) {
        formattedUsername = item.username.substring(0, usernameIdx) + '<span class="highlight">' + item.username.substring(usernameIdx, usernameIdx + querySubstring.length) + '</span>' + item.username.substring(usernameIdx + querySubstring.length);
      }

      let formattedEmail = item.email;
      if (item.email.toLowerCase().includes(querySubstring)) {
        formattedEmail = item.email.substring(0, emailIdx) + '<span class="highlight">' + item.email.substring(emailIdx, emailIdx + querySubstring.length) + '</span>' + item.email.substring(emailIdx + querySubstring.length);
      }
      
      const suggestionItem = document.createElement('div');
      suggestionItem.classList.add('suggestion-item');
      suggestionItem.innerHTML = `
        <a tabindex="-1" role="menuitemradio">
          <li class="suggestion-item"><div>${formattedFullName}</div>${formattedUsername} &lt;${formattedEmail}&gt;</li>
        </a>
      `;

      // ${item.substring(0, startIndex)}
      //     <span class="highlight">${item.substring(startIndex, endIndex)}</span>
      //     ${item.substring(endIndex)}
      
      suggestionItem.addEventListener('mousedown', () => {
          document.getElementById('collab-input').value = item.username;
          suggestionsContainer.innerHTML = '';
      });
      
      suggestionsContainer.appendChild(suggestionItem);
    });
  }
}

function searchMatchingStrings(querySubstring, data, containerIdPrefix, hasContentWrapper) {
  querySubstring = querySubstring.toLowerCase();

  const suggestionsContainer = document.getElementById(containerIdPrefix + '-suggestions');
  suggestionsContainer.innerHTML = '';
  
  if (querySubstring !== undefined) {
      const matches = data.filter(item => item.toLowerCase().includes(querySubstring));
      
      matches.forEach(item => {
          const startIndex = item.toLowerCase().indexOf(querySubstring);
          const endIndex = startIndex + querySubstring.length;

          if (item.toLowerCase().includes(querySubstring)) {
            formattedItem = item.substring(0, startIndex) + '<span class="highlight">' + item.substring(startIndex, endIndex) + '</span>' + item.substring(endIndex);
          }
          
          const suggestionItem = document.createElement('div');
          suggestionItem.classList.add('suggestion-item');
          suggestionItem.innerHTML = `
            <a tabindex="-1" role="menuitemradio">
              <li class="suggestion-item"><div>${formattedItem}</div></li>
            </a>
          `;

          suggestionItem.addEventListener('mousedown', () => {
            if (hasContentWrapper === true) {
              addSelectedItem(item, containerIdPrefix);
            } else {
              document.getElementById(containerIdPrefix + '-input').value = item;
            }

            suggestionsContainer.innerHTML = '';
          });
          
          suggestionsContainer.appendChild(suggestionItem);
      });
  }
}


// addSelectedItem(item);

let selectedItems = [];

function handleDeleteKey(e, containerIdPrefix) {
  if (e.key === 'Backspace' && e.target.value === '') {
      const lastItem = selectedItems[selectedItems.length - 1];
      if (lastItem) {
          if (lastItem.grayed) {
              selectedItems.pop();
              updateSelectedItemsUI(containerIdPrefix);
          } else {
              lastItem.grayed = true;
              updateSelectedItemsUI(containerIdPrefix);
          }
      }
  }
}

function addSelectedItem(item, containerIdPrefix) {
  // Add a problem maximum once
  if (!selectedItems.some(selected => selected.text === item)) {
      selectedItems.push({ text: item, grayed: false });
      updateSelectedItemsUI(containerIdPrefix);
  }
}

// function updateSelectedItemsUI() {
//   const selectedItemsContainer = document.getElementById('selected-items');
//   selectedItemsContainer.innerHTML = '';

//   selectedItems.forEach((item, index) => {
//       const itemElement = document.createElement('div');
//       itemElement.classList.add('selected-item');
//       if (item.grayed) {
//           itemElement.classList.add('grayed');
//       }
//       itemElement.innerHTML = `
//           ${item.text} <span class="remove-btn" onclick="removeSelectedItem(${index})">X</span>
//       `;

//       selectedItemsContainer.appendChild(itemElement);
//   });
// }

function updateSelectedItemsUI(containerIdPrefix) {
  const inputWrapper = document.getElementById('input-wrapper');
  const subjectInput = document.getElementById('problems-input');
  inputWrapper.innerHTML = '';

  if (containerIdPrefix !== undefined) {
    const inputTextbox = document.getElementById(containerIdPrefix + '-input');

    if (selectedItems.length === 0) {
      inputTextbox.style.borderTopLeftRadius = '4px';
      inputTextbox.style.borderTopRightRadius = '4px';
    } else if (selectedItems.length > 0) {
      inputTextbox.style.borderTopLeftRadius = '0';
      inputTextbox.style.borderTopRightRadius = '0';
    }
  }

  if (containerIdPrefix === 'problems') {
    const quotasInput = document.getElementById('quotas-input');
    quotasInput.value = selectedItems.map((item) => 1);

    console.log("I am here ", quotasInput);
  }

  selectedItems.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('selected-item');
      if (item.grayed && index === selectedItems.length - 1) {
        itemElement.classList.add('grayed');
      } else if (item.grayed) {
        item.grayed = false;
      }

      itemElement.innerHTML = `
          <span>${item.text}</span> <span class="remove-btn" onclick="removeSelectedItem(${index}, '${containerIdPrefix}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="close">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z"/>
            </svg>
          </span>
      `;

      inputWrapper.appendChild(itemElement);
  });

  // Re-append the input field to the wrapper
  // inputWrapper.appendChild(subjectInput);
  subjectInput.value = '';  // Clear input value for fresh input
  subjectInput.focus(); // Move cursor to the input field
}

function removeSelectedItem(index, containerIdPrefix) {
  selectedItems.splice(index, 1);
  updateSelectedItemsUI(containerIdPrefix);
}



function submitForm() {
  const contestName = document.getElementById('name-input').value;
  const collabInput = document.getElementById('collab-input').value;
  const subjectInput = document.getElementById('subject-input').value;
  const descriptionInput = document.getElementById('description-input').value;
  const passwordInput = document.getElementById('password-input').value;

  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;

  const problemsInput = selectedItems.map(item => parseInt(item.text));
  const quotasInput = document.getElementById('quotas-input').value;
  const quotas = quotasInput.split(',').filter(quota => quota.length > 0).map(quota => parseInt(quota));

  vscode.postMessage({
    state: "submitted",
    data: {
      name: contestName,
      start_date: startDate,
      end_date: endDate,
      collab_username: collabInput,
      subject_abbreviation: subjectInput,
      description: descriptionInput,
      password: passwordInput,
      problems: problemsInput,
      quotas: quotas
    }
  });
}

function saveFormData() {
  const contestName = document.getElementById('contest-name').value;
  // localStorage.setItem('contestName', contestName);

  vscode.setState({
    contestName
  });
}