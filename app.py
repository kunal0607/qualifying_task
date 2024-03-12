from flask import Flask, request, jsonify, render_template
from jsonschema import Draft202012Validator, ValidationError, SchemaError
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="https://kunal0607.github.io/qualifying_task/")


@app.route('/')
def home():
    return render_template('index.html')

def validate_json_schema(input_schema, schema_requirements=None):
    validator = Draft202012Validator
    try:
        validator.check_schema(input_schema)
        if schema_requirements:
            schema_requirements(input_schema)
        return True, "Schema is valid."
    except (ValidationError, SchemaError) as e:
        return False, str(e)

@app.route('/validate-schema', methods=['POST'])
def validate_schema():
    input_schema = request.json.get('schema')
    step = request.json.get('step')

    if step == 1:
        is_valid, message = validate_json_schema(input_schema)
    elif step == 2:
        def array_with_numbers_requirement(schema):
            if schema['type'] != 'array' or schema['items']['type'] != 'number':
                raise ValidationError("Schema must define an array with items of type number.")
        is_valid, message = validate_json_schema(input_schema, array_with_numbers_requirement)
    else:
        return jsonify({"message": "Invalid step provided."}), 400

    if is_valid:
        return jsonify({"message": message}), 200
    else:
        return jsonify({"message": message}), 400

if __name__ == "__main__":
    app.run(debug=True)
