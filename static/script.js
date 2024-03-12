let editor; // Declare editor globally to initialize after "Start" is clicked
let currentStepIndex = 0; // Use this to track the current step
let stepsConfig = []; // This will be populated from a configuration file

document.addEventListener('DOMContentLoaded', function() {
    // Hide editor container and validation result section initially
    document.getElementById('editorContainer').style.display = "none";
    document.getElementById('validationResult').style.display = "none";

    // Setup click listener for the "Next/Start" button
    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentStepIndex === 0) {
            // Display the editor and validation result on first click
            document.getElementById('editorContainer').style.display = "block";
            document.getElementById('validationResult').style.display = "block";
            initEditor();
            fetchStepsConfig(); // Fetch and display steps configuration
        } else {
            const jsonInput = editor.getValue();
            validateSchema(jsonInput, currentStepIndex);
        }
    });
});

function fetchStepsConfig() {
    // Assume '/static/stepsConfig.json' is the correct path
    fetch('/static/stepsConfig.json')
        .then(response => response.json())
        .then(data => {
            stepsConfig = data;
            currentStepIndex = 1; // Start from the first step
            updateStepIndicator();
            document.getElementById('nextButton').innerText = "Validate Schema";
        })
        .catch(error => console.error("Failed to fetch steps configuration:", error));
}

function initEditor() {
    editor = ace.edit("editor");
    editor.session.setMode("ace/mode/json");
    editor.setTheme("ace/theme/monokai");
    editor.setValue("{}"); // Initialize with an empty JSON object
}

function updateStepIndicator() {
    if (currentStepIndex > 0 && currentStepIndex <= stepsConfig.length) {
        const stepConfig = stepsConfig[currentStepIndex - 1];
        document.getElementById('stepIndicator').innerText = stepConfig.description;
        document.getElementById('stepIndicator').style.display = "block";
    }
}

function validateSchema(jsonInput, stepIndex) {
    try {
        const schema = JSON.parse(jsonInput);
        fetch('https://kunalbansal6701.pythonanywhere.com/validate-schema', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({schema, step: stepIndex}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('validationResult').innerText = data.message;
            if (data.message.includes("Schema is valid.") && currentStepIndex < stepsConfig.length) {
                // Prepare for the next step
                currentStepIndex++;
                updateStepIndicator();
                editor.setValue("{}"); // Clear the editor for the next input
            } else if (currentStepIndex === stepsConfig.length) {
                // Complete all steps
                document.getElementById('validationResult').innerText += " All steps completed successfully.";
                document.getElementById('nextButton').style.display = "none";
            }
        })
        .catch(error => {
            document.getElementById('validationResult').innerText = "Validation failed: " + error.message;
            console.error('Error:', error);
        });
    } catch (e) {
        document.getElementById('validationResult').innerText = 'Invalid JSON format: ' + e.message;
        console.error('Parsing error:', e);
    }
}
