const vscode = acquireVsCodeApi();

let categories = [];

const skelButtonsIds = ['write-skel-btn', 'open-skel-btn', 'upload-skel-btn'];
let activeSkelMode = 'write-skel-btn';


document.getElementById('problem-form').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.target.type !== 'textarea') {
    e.preventDefault();

    const form = document.getElementById('problem-form');
    const index = [...form].indexOf(e.target);

    if (form.elements[index].classList.contains('categories-input')) {
      if (form.elements[index].value !== '') {
        addNewCategory(form.elements[index].value);
        updateCategoriesUI('categories');
      } else {
        form.elements[index + 1].focus();
      }
    } else if (form.elements[index].parentNode.classList.contains('autocomplete-container')) {
      const suggestionItems = form.elements[index].parentNode.getElementsByClassName('suggestion-item');

      if (suggestionItems.length > 0) {
        form.elements[index].parentNode.getElementsByClassName('suggestion-item')[0].click();
      } else {
        form.elements[index + 1].focus();
      }
    } else {
      form.elements[index + 1].focus();
    }
  }
});

document.getElementById('language-input').addEventListener('input', (e) => searchMatchingStrings(e.target.value, languages, 'language'));
document.getElementById('language-input').addEventListener('focus', () => searchMatchingStrings(document.getElementById('language-input').value, languages, 'language'));
document.getElementById('language-input').addEventListener('blur', () => disposeSuggestionsContainer('language-suggestions'));

document.getElementById('difficulty-input').addEventListener('input', (e) => searchMatchingStrings(e.target.value, difficulties, 'difficulty'));
document.getElementById('difficulty-input').addEventListener('focus', () => searchMatchingStrings(document.getElementById('difficulty-input').value, difficulties, 'difficulty'));
document.getElementById('difficulty-input').addEventListener('blur', () => disposeSuggestionsContainer('difficulty-suggestions'));

document.getElementById('categories-input').addEventListener('focus', () => {
  const inputTextbox = document.getElementById('categories-input');
  inputTextbox.style.borderLeft = 'solid #8c30f5 1px';
  inputTextbox.style.borderBottom = 'solid #8c30f5 1px';

  if (categories.length === 0) {
    inputTextbox.style.borderTop = 'solid #8c30f5 1px';
  } else {
    const contentWrapper = document.getElementById('input-wrapper');
    contentWrapper.style.width = inputTextbox.style.width;
    contentWrapper.style.borderTop = 'solid #8c30f5 1px';
    contentWrapper.style.borderLeft = 'solid #8c30f5 1px';
    contentWrapper.style.borderRight = 'solid #8c30f5 1px';
  }
});
document.getElementById('categories-input').addEventListener('blur', () => {
  const inputTextbox = document.getElementById('categories-input');
  inputTextbox.style.border = 'none';
  const contentWrapper = document.getElementById('input-wrapper');
  contentWrapper.style.border = 'none';
});
document.getElementById('categories-input').addEventListener('keydown', (e) => {
  handleDeleteKey(e, 'categories');
});

document.getElementById('description-input').addEventListener('input', (e) => resizeTextArea(e.target));


function disposeSuggestionsContainer(containerId) {
  const suggestionsContainer = document.getElementById(containerId);
  suggestionsContainer.innerHTML = '';
}

function searchMatchingStrings(querySubstring, data, containerIdPrefix) {
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

          suggestionItem.addEventListener('click', () => {
            document.getElementById(containerIdPrefix + '-input').value = item;
            suggestionsContainer.innerHTML = '';
          });

          suggestionItem.addEventListener('mousedown', () => {
            document.getElementById(containerIdPrefix + '-input').value = item;
            suggestionsContainer.innerHTML = '';
          });
          
          suggestionsContainer.appendChild(suggestionItem);
      });
  }
}


function handleDeleteKey(e, containerIdPrefix) {
  if (e.key === 'Backspace' && e.target.value === '') {
      const lastItem = categories[categories.length - 1];
      if (lastItem) {
          if (lastItem.grayed) {
              categories.pop();
              updateCategoriesUI(containerIdPrefix);
          } else {
              lastItem.grayed = true;
              updateCategoriesUI(containerIdPrefix);
          }
      }
  }
}

function addNewCategory(categoryStr) {
  if (!categories.some(category => category.text === categoryStr)) {
    categories.push({ text: categoryStr, grayed: false });
    updateCategoriesUI('categories');
  }
}

function updateCategoriesUI(containerIdPrefix) {
  const inputWrapper = document.getElementById('input-wrapper');
  inputWrapper.innerHTML = '';

  const inputTextbox = document.getElementById(containerIdPrefix + '-input');
  console.log("Searching for ", containerIdPrefix + '-input', inputTextbox);

  if (categories.length === 0) {
    inputTextbox.style.borderTopLeftRadius = '4px';
    inputTextbox.style.borderTopRightRadius = '4px';
  } else if (categories.length > 0) {
    inputTextbox.style.borderTopLeftRadius = '0';
    inputTextbox.style.borderTopRightRadius = '0';
  }

  categories.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('selected-item');
      if (item.grayed && index === categories.length - 1) {
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

  inputTextbox.value = '';
  inputTextbox.focus();
}

function resizeTextArea(textarea) {
  const { style, value } = textarea;

  style.height = style.minHeight = 'auto';
  style.minHeight = `${ Math.min(textarea.scrollHeight + 4, parseInt(textarea.style.maxHeight)) }px`;
}

function removeSelectedItem(index, containerIdPrefix) {
  categories.splice(index, 1);
  updateCategoriesUI(containerIdPrefix);
}


///// Skeleton related functions 
document.getElementById('skeleton-input').addEventListener('input', (e) => {
  resizeTextArea(e.target);
});

function highlightSkelButton(buttonId) {
  skelButtonsIds.forEach((id) => {
    const button = document.getElementById(id);
    button.classList.remove('test-btn-active-text');
  });

  const button = document.getElementById(buttonId);
  button.classList.add('test-btn-active-text');
  activeSkelMode = buttonId;
}

// Logic to allow writing the skeleton in form
function writeSkeleton() {
  highlightSkelButton('write-skel-btn');

  // Show the skeleton textarea
  const skeletonInput = document.getElementById('skeleton-input');
  skeletonInput.classList.remove('hidden');
}

// Logic to initiate the opening of a new window for skeleton
function openSkeletonFile() {
  // Send the request to open a new editor tab
  vscode.postMessage({
    action: "openSkeletonFile",
    data: getFormData()
  });

  highlightSkelButton('open-skel-btn');

  // Hide the textarea box
  const skeletonInput = document.getElementById('skeleton-input');
  skeletonInput.classList.add('hidden');
}

// Logic to initiate the uploading of a new window for skeleton
function uploadSkeletonFile() {
  highlightSkelButton('upload-skel-btn');

  // Show the skeleton textarea
  const skeletonInput = document.getElementById('skeleton-input');
  skeletonInput.classList.remove('hidden');

  vscode.postMessage({
    action: "uploadSkeletonFile"
  });
}

window.addEventListener('message', event => {
  const message = event.data;

  switch (message.action) {
    case 'uploadSkeletonFileResponse':
      // Populate the skeleton textarea with the received content
      const skeletonInput = document.getElementById('skeleton-input');
      skeletonInput.value = message.data;
      resizeTextArea(skeletonInput);
      
      break;
  }
});



///// Tests input related logic
let testsDisplayed = ['example'];
let totalNumberOfShownTests = 0;
let testsNamesMapping = [];

// Initial resize for all the text areas, for example and also
// for the input and output content of the shown tests
testsDisplayed.forEach((element) => {
    const inputTextbox = document.getElementById(`${element}-input`);
    const outputTextbox = document.getElementById(`${element}-output`);

    if (inputTextbox === null || outputTextbox === null) {
        testsDisplayed = testsDisplayed.filter((e) => e !== element);
        return;
    }

    inputTextbox.addEventListener('input', () => {
        resizeTextArea(inputTextbox);
    });
    
    outputTextbox.addEventListener('input', () => {
        resizeTextArea(outputTextbox);
    });

    testsNamesMapping.push(element);
    totalNumberOfShownTests++;
});

// Add the first test
addTest();
revealTestById('example');

function activateTestDisplay(testDiv, testBtn, removeTestBtn) {
    testDiv.classList.remove('hidden');
    testBtn.classList.add('test-btn-active-text');

    if (removeTestBtn !== undefined) {
        removeTestBtn.style.visibility = 'visible';
    } 
}

function deactivateTestDisplay(testDiv, testBtn, removeTestBtn) {
    testDiv.classList.add('hidden');
    testBtn.classList.remove('test-btn-active-text');

    if (removeTestBtn !== undefined) {
        removeTestBtn.style.visibility = 'hidden';
    }
}

function revealTestById(testIdPrefix) {
    const exampleDiv = document.getElementById('example-content');
    const exampleBtn = document.getElementById('example-btn');

    // Hide all the tests and the example
    deactivateTestDisplay(exampleDiv, exampleBtn);

    for (let i = 1; i < testsNamesMapping.length; ++i) {        
        const testDiv = document.getElementById(`${testsNamesMapping[i]}-content`);
        const testBtn = document.getElementById(`${testsNamesMapping[i]}-btn`);
        const removeTestBtn = document.getElementById(`${testsNamesMapping[i]}-btn-remove`);

        if (testDiv !== null) {
            deactivateTestDisplay(testDiv, testBtn, removeTestBtn);
        }
    }

    if (testIdPrefix !== 'example') {
        const testDiv = document.getElementById(`${testIdPrefix}-content`);
        const testBtn = document.getElementById(`${testIdPrefix}-btn`);
        const removeTestBtn = document.getElementById(`${testIdPrefix}-btn-remove`);
        
        activateTestDisplay(testDiv, testBtn, removeTestBtn);

        const inputTextbox = document.getElementById(`${testIdPrefix}-input`);
        const outputTextbox = document.getElementById(`${testIdPrefix}-output`);

        resizeTextArea(inputTextbox);
        resizeTextArea(outputTextbox);
    } else {
        activateTestDisplay(exampleDiv, exampleBtn);
    }
}

function addTest() {
    const testIndex = totalNumberOfShownTests;
    totalNumberOfShownTests++;

    testsNamesMapping.push(`test-${testIndex}`);

    createTestButtton(testIndex);
    createTestContent(testIndex);

    revealTestById(`test-${testIndex}`);
}

function createTestButtton(testIndex) {
    const testButtonsContainer = document.getElementById('test-buttons-container');
    testButtonsContainer.innerHTML += `
<span class="test-btn-wrapper" id="test-${testIndex}-btn-wrapper">
  <span class="separator">|</span>

  <button type="button" id="test-${testIndex}-btn" class="test-btn" onclick="revealTestById('test-${testIndex}')">Test ${testsNamesMapping.length - 1}</button>
    <button type="button" class="test-btn-remove" id="test-${testIndex}-btn-remove" onclick="removeTestById('test-${testIndex}')">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 8H1V7H15V8Z" fill="#C5C5C5"/>
    </svg>
  </button>
</span>`;
}

function createTestContent(testIndex, input, output) {
    const testContent = `
  <h3>Input:</h3>
  <textarea class="test-input" style="max-height: 300px; " id="test-${
    testIndex
  }-input" rows=1></textarea>

  <h3>Output:</h3>
  <textarea class="test-input" style="max-height: 300px; " id="test-${
    testIndex
  }-output" rows=1></textarea>
  
  <h3>Grade:</h3>
  <textarea class="test-input" id="test-${
    testIndex
  }-grade" rows=1></textarea>`;

    const testsContainer = document.getElementById('tests-container');

    const newTestContent = document.createElement('div');
    newTestContent.id = `test-${testIndex}-content`;
    newTestContent.classList.add('hidden');
    newTestContent.innerHTML = testContent;

    testsContainer.appendChild(newTestContent);

    const inputTextbox = document.getElementById(`test-${testIndex}-input`);
    const outputTextbox = document.getElementById(`test-${testIndex}-output`);

    inputTextbox.addEventListener('input', () => {
        resizeTextArea(inputTextbox);
    });
    outputTextbox.addEventListener('input', () => {
        resizeTextArea(outputTextbox);
    });
}

function removeTestById(testIdPrefix) {
    const currentIndex = testsNamesMapping.indexOf(testIdPrefix);

    const testButton = document.getElementById(`${testIdPrefix}-btn-wrapper`);
    testButton.remove();
    const testContent = document.getElementById(`${testIdPrefix}-content`);
    testContent.remove();

    // Activate the previous button
    const prevId = currentIndex === 1 ? 'example' : testsNamesMapping[currentIndex - 1];
    
    // Display the previous test
    const newTestContent = document.getElementById(`${prevId}-content`);
    const newTestBtn = document.getElementById(`${prevId}-btn`);
    const newRemoveTestBtn = document.getElementById(`${prevId}-btn-remove`) || undefined;
    activateTestDisplay(newTestContent, newTestBtn, newRemoveTestBtn);

    // Rename the remaining tests
    for (let i = currentIndex + 1; i < testsNamesMapping.length; ++i) {        
        const testBtn = document.getElementById(`${testsNamesMapping[i]}-btn`);

        testBtn.textContent = `Test ${i - 1}`;
        testsNamesMapping[i - 1] = testsNamesMapping[i];
    }

    testsNamesMapping.pop();
    console.log(testsNamesMapping);
}

///// Form related functions
function getFormData() {
  const problemName = document.getElementById('name-input').value;
  const languageInput = document.getElementById('language-input').value;
  const difficultyInput = document.getElementById('difficulty-input').value;
  const categoriesInput = categories.map(item => item.text).join(';');
  const descriptionInput = document.getElementById('description-input').value;
  const isPublicInput = document.getElementById('visibility-public').checked;
  
  const skeletonSource = skelButtonsIds.filter(id =>
    document.getElementById(id).classList.contains('test-btn-active-text')
  )[0];

  console.log("Source is ", skeletonSource);

  const skeleton = skeletonSource === 'open-skel-btn'
    ? ''
    : document.getElementById('skeleton-input').value;


  const example = {
    input: document.getElementById('example-input').value,
    output: document.getElementById('example-output').value
  };

  const tests = testsNamesMapping.slice(1).map(testId => {
    return {
      testInput: document.getElementById(`${testId}-input`).value,
      testOutput: document.getElementById(`${testId}-output`).value,
      testGrad: document.getElementById(`${testId}-grade`).value,
    };
  });

  return {
    name: problemName,
    language: languageInput,
    difficulty: difficultyInput,
    categories: categoriesInput,
    description: descriptionInput,
    visible: isPublicInput,
    skeleton: skeleton,
    skeleton_source_is_local: skeletonSource === 'open-skel-btn',
    example: example,
    tests: tests
  };
}

function submitForm() {
  vscode.postMessage({
    action: "sendRequestToApi",
    data: getFormData()
  });
}

function saveFormData() {
  const contestName = document.getElementById('contest-name').value;
  // localStorage.setItem('contestName', contestName);

  vscode.setState({
    contestName
  });
}