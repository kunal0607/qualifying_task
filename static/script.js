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

    // Setup click listener for the "Home" button
    document.getElementById('homeButton').addEventListener('click', function() {
        // Reset current step index and hide unnecessary elements
        currentStepIndex = 0;
        document.getElementById('editorContainer').style.display = "none";
        document.getElementById('validationResult').style.display = "none";
        document.getElementById('nextButton').innerText = "Start";
        document.getElementById('stepIndicator').style.display = "none";
        document.getElementById('validationResult').innerText = "";
    });
});

function fetchStepsConfig() {
    // Assume '/static/stepsConfig.json' is the correct path
    fetch('https://kunal0607.github.io/qualifying_task/static/stepsConfig.json')
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

        if (stepIndex === 1) {
            // Step 1 validation
            if (isObjectEmpty(schema)) {
                document.getElementById('validationResult').innerText = "Step 1 validation successful. Proceeding to Step 2.";
                currentStepIndex++;
                updateStepIndicator();
                editor.setValue("{}"); // Clear the editor for the next input
            } else {
                document.getElementById('validationResult').innerText = "Step 1 validation failed. Please provide a valid JSON Schema for Draft 2020-12.";
            }
        } else if (stepIndex === 2) {
            // Step 2 validation
            if (schema.type === "array" && schema.items && schema.items.type === "number") {
                document.getElementById('validationResult').innerText = "Step 2 validation successful. All steps completed successfully.";
                currentStepIndex++;
                document.getElementById('nextButton').style.display = "none"; // Hide the next button since all steps are completed
            } else {
                document.getElementById('validationResult').innerText = "Step 2 validation failed. Please provide a JSON Schema that defines an array with items of type number.";
            }
        }
    } catch (e) {
        document.getElementById('validationResult').innerText = 'Invalid JSON format: ' + e.message;
        console.error('Parsing error:', e);
    }
}

function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
