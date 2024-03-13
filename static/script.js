let editor; 
let currentStepIndex = 0; 
let stepsConfig = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('editorContainer').style.display = "none";
    document.getElementById('validationResult').style.display = "none";

    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentStepIndex === 0) {
            document.getElementById('editorContainer').style.display = "block";
            document.getElementById('validationResult').style.display = "block";
            initEditor();
            fetchStepsConfig(); 
        } else {
            const jsonInput = editor.getValue();
            validateSchema(jsonInput, currentStepIndex);
        }
    });

    document.getElementById('homeButton').addEventListener('click', function() {
        currentStepIndex = 0;
        document.getElementById('editorContainer').style.display = "none";
        document.getElementById('validationResult').style.display = "none";
        document.getElementById('nextButton').innerText = "Start";
        document.getElementById('stepIndicator').style.display = "none";
        document.getElementById('validationResult').innerText = "";
        document.getElementById('homeButton').style.display = "none"; 
    });
});

function fetchStepsConfig() {
    
    fetch('https://kunal0607.github.io/qualifying_task/static/stepsConfig.json')
        .then(response => response.json())
        .then(data => {
            stepsConfig = data;
            currentStepIndex = 1; 
            updateStepIndicator();
            document.getElementById('nextButton').innerText = "Validate Schema";
        })
        .catch(error => console.error("Failed to fetch steps configuration:", error));
}

function initEditor() {
    editor = ace.edit("editor");
    editor.session.setMode("ace/mode/json");
    editor.setTheme("ace/theme/monokai");
    editor.setValue("{}"); 
}

function updateStepIndicator() {
    if (currentStepIndex > 0 && currentStepIndex <= stepsConfig.length) {
        const stepConfig = stepsConfig[currentStepIndex - 1];
        document.getElementById('stepIndicator').innerText = stepConfig.description;
        document.getElementById('stepIndicator').style.display = "block";
        if (currentStepIndex === 2) {
            document.getElementById('homeButton').style.display = "block"; 
        } else {
            document.getElementById('homeButton').style.display = "none"; 
        }
    }
}

function validateSchema(jsonInput, stepIndex) {
    try {
        const schema = JSON.parse(jsonInput);

        if (stepIndex === 1) {
            if (isObjectEmpty(schema)) {
                document.getElementById('validationResult').innerText = "Step 1 validation successful. Proceeding to Step 2.";
                currentStepIndex++;
                updateStepIndicator();
                editor.setValue("{}"); 
            } else {
                document.getElementById('validationResult').innerText = "Step 1 validation failed. Please provide a valid JSON Schema for Draft 2020-12.";
            }
        } else if (stepIndex === 2) {
            if (schema.type === "array" && schema.items && schema.items.type === "number") {
                document.getElementById('validationResult').innerText = "Step 2 validation successful. All steps completed successfully.";
                currentStepIndex++;
            } else {
                document.getElementById('validationResult').innerText = "Step 2 validation failed. Please provide a JSON Schema that defines an array with items of type number.";
            }
            updateStepIndicator(); 
        }
    } catch (e) {
        document.getElementById('validationResult').innerText = 'Invalid JSON format: ' + e.message;
        console.error('Parsing error:', e);
    }
}

function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
