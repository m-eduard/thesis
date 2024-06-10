// Initial resize for all the text areas, for example and also
// for the input and output content of the shown tests
const testsDisplayed = ['example', 'test-1', 'test-2', 'test-3'];

testsDisplayed.forEach((element) => {
    const inputTextbox = document.getElementById(`${element}-input`);
    const outputTextbox = document.getElementById(`${element}-output`);

    if (inputTextbox === null || outputTextbox === null) {
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
});

function activateTestDisplay(testDiv, testBtn) {
    testDiv.classList.remove('hidden');
    testBtn.classList.add('test-btn-active-text');
}

function deactivateTestDisplay(testDiv, testBtn) {
    testDiv.classList.add('hidden');
    testBtn.classList.remove('test-btn-active-text');
}

function revealTest(idx) {
    const exampleDiv = document.getElementById('example-content');
    const exampleBtn = document.getElementById('example-btn');

    // Hide all the tests and the example
    deactivateTestDisplay(exampleDiv, exampleBtn);

    for (let i = 1; i <= 3; ++i) {        
        const testDiv = document.getElementById(`test-${i}-content`);
        const testBtn = document.getElementById(`test-${i}-btn`);

        if (testDiv !== null) {
            deactivateTestDisplay(testDiv, testBtn);
        }
    }

    if (idx !== 0) {
        const testDiv = document.getElementById(`test-${idx}-content`);
        const testBtn = document.getElementById(`test-${idx}-btn`);
        
        activateTestDisplay(testDiv, testBtn);

        const inputTextbox = document.getElementById(`test-${idx}-input`);
        const outputTextbox = document.getElementById(`test-${idx}-output`);

        resizeTextArea(inputTextbox);
        resizeTextArea(outputTextbox);
    } else {
        activateTestDisplay(exampleDiv, exampleBtn);
    }
}

function resizeTextArea(textarea) {
    const { style, value } = textarea;

    // The 4 corresponds to the 2 2px borders (top and bottom):
    style.height = style.minHeight = 'auto';
    style.minHeight = `${ Math.min(textarea.scrollHeight + 4, parseInt(textarea.style.maxHeight)) }px`;
}

function addTest() {
    testsDisplayed.push(`test-${testsDisplayed.length + 1}`);
}

function getTestData() {
    const testData = [];

    testsDisplayed.forEach((element) => {
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
