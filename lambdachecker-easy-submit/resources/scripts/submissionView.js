function resizeTextArea(textarea) {
    const { style, value } = textarea;

    style.height = style.minHeight = 'auto';
    style.minHeight = `${ Math.min(textarea.scrollHeight + 4, parseInt(textarea.style.maxHeight)) }px`;
}

console.log(testsIds);

testsIds.forEach((element) => {
    const inputTextbox = document.getElementById(`${element}-input`);
    const outputTextbox = document.getElementById(`${element}-output`);
    const expectedTextbox = document.getElementById(`${element}-expected`);

    console.log("Found", inputTextbox, outputTextbox, expectedTextbox);

    resizeTextArea(inputTextbox);
    resizeTextArea(outputTextbox);
    resizeTextArea(expectedTextbox);
});