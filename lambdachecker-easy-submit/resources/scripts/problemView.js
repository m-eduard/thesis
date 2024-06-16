let testsDisplayed = ['example', 'test-1', 'test-2', 'test-3'];
let totalNumberOfShownTests = 0;

// Use a mapping as a link to the original name
// for a test, since they have to be reindexed
// after each deletion
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

    resizeTextArea(inputTextbox);
    resizeTextArea(outputTextbox);

    inputTextbox.addEventListener('input', () => {
        resizeTextArea(inputTextbox);
    });
    
    outputTextbox.addEventListener('input', () => {
        resizeTextArea(outputTextbox);
    });

    testsNamesMapping.push(element);
    totalNumberOfShownTests++;
});

// Reveal the Ranking button
if (contestId === undefined) {
    document.getElementById('restore-skeleton-separator').style.display = 'none';
    document.getElementById('contest-ranking').style.display = 'none';
}

// Countdown timer used when the problem is opened
// in an active contest context
if (contestEndDate !== undefined && contestEndDate.getTime() - Date.now() > 0) {
    document.getElementById('countdown').style.display = 'flex';

    function countdown() {
        const distance = contestEndDate.getTime() - Date.now();

        if (distance < 0) {
            clearInterval(countdown);
            document.getElementById('countdown-text').style.display = 'none';

            const expirationText = document.createElement('div');
            expirationText.classList.add('countdown-column');
            expirationText.style.fontWeight = '400';
            expirationText.innerHTML = '<span>Contest has ended<span>';
            document.getElementById('countdown').appendChild(expirationText);

            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').innerHTML = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').innerHTML = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById('countdown-seconds').innerHTML = seconds.toString().padStart(2, '0');

        if (days === 1) {
            document.getElementById('countdown-days-text').innerText = "Day";
        } else if (days === 0) {
            document.getElementById('countdown-days-column').style.display = 'none';
        }

        if (hours === 1) {
            document.getElementById('countdown-hours-text').innerText = "Hour";
        } else if (hours === 0) {
            document.getElementById('countdown-hours-text').innerText = "Hours";
        }

        if (minutes === 1) {
            document.getElementById('countdown-minutes-text').innerText = "Minute";
        } else if (minutes === 0) {
            document.getElementById('countdown-minutes-text').innerText = "Minutes";
        }

        if (seconds === 1) {
            document.getElementById('countdown-seconds-text').innerText = "Second";
        } else if (seconds === 0) {
            document.getElementById('countdown-seconds-text').innerText = "Seconds";
        }

        if (distance < 15 * 1000 * 60) {
            document.getElementById('countdown-text').classList.add('hard');
            document.getElementById('countdown-text').style.fontWeight = '500';
        }

        setTimeout(countdown, 900);
    }

    countdown();
}

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

function resizeTextArea(textarea) {
    const { style, value } = textarea;

    style.height = style.minHeight = 'auto';
    style.minHeight = `${ Math.min(textarea.scrollHeight, parseInt(textarea.style.maxHeight)) }px`;
}

function getTestData() {
    const testData = [];

    testsNamesMapping.forEach((element) => {
        const inputTextbox = document.getElementById(`${element}-input`);
        const outputTextbox = document.getElementById(`${element}-output`);
    
        if (inputTextbox === null || outputTextbox === null) {
            return;
        }
    
        testData.push({
            input: inputTextbox.value,
            output: outputTextbox.value
        });
    });

    console.log(testData);

    return testData;
}

function addTest() {
    const testIndex = totalNumberOfShownTests;
    totalNumberOfShownTests++;

    testsNamesMapping.push(`test-${testIndex}`);

    createTestButton(testIndex);
    createTestContent(testIndex);

    revealTestById(`test-${testIndex}`);
}

function createTestButton(testIndex) {
    const testButtonsContainer = document.getElementById('test-buttons-container');

    const newTestButton = document.createElement('span');
    newTestButton.id = `test-${testIndex}-btn-wrapper`;
    newTestButton.classList.add('test-btn-wrapper');
    newTestButton.innerHTML = `
<span class="test-btn-wrapper" id="test-${testIndex}-btn-wrapper">
  <span class="separator">|</span>

  <button id="test-${testIndex}-btn" class="test-btn" onclick="revealTestById('test-${testIndex}')">Test ${testsNamesMapping.length - 1}</button>
  <button class="test-btn-remove" id="test-${testIndex}-btn-remove" onclick="removeTestById('test-${testIndex}')">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 8H1V7H15V8Z" fill="#C5C5C5"/>
    </svg>
  </button>
</span>`;

    testButtonsContainer.appendChild(newTestButton);
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
  }-output" rows=1></textarea>`;

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
