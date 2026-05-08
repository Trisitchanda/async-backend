def process_operation(operation: str, input_text: str) -> dict:
    try:
        if operation == 'uppercase':
            result = input_text.upper()
        elif operation == 'lowercase':
            result = input_text.lower()
        elif operation == 'reverse string':
            result = input_text[::-1]
        elif operation == 'word count':
            result = str(len(input_text.split()))
        else:
            raise ValueError(f"Unknown operation: {operation}")
            
        return {"success": True, "result": result, "logs": [f"Operation '{operation}' completed successfully."]}
    except Exception as e:
        return {"success": False, "result": None, "logs": [f"Error processing operation '{operation}': {str(e)}"]}
