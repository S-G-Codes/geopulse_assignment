import json
import os
from django.conf import settings
from django.http import HttpResponseServerError
from django.shortcuts import render
from django.contrib import messages

def index(request):
    try:
    
        file_path = os.path.join(settings.BASE_DIR, 'static', 'data', 'villages.json')

    
        with open(file_path, 'r') as file:
            villages_data = json.load(file)

        if not isinstance(villages_data, dict) or 'features' not in villages_data:
            raise ValueError("Invalid JSON structure: 'features' key is missing")

   
        districts = list(set(feature['properties'].get('District', 'Unknown') for feature in villages_data['features']))

        context = {
            'districts': districts,
            'villages_data': json.dumps(villages_data) 
        }
        return render(request, 'map_app/index.html', context)

    except FileNotFoundError:
        
        error_message = "The villages data file could not be found."
        messages.error(request, error_message)
        return HttpResponseServerError(error_message)

    except json.JSONDecodeError:
     
        error_message = "The villages data file contains invalid JSON."
        messages.error(request, error_message)
        return HttpResponseServerError(error_message)

    except ValueError as e:
        
        error_message = str(e)
        messages.error(request, error_message)
        return HttpResponseServerError(error_message)

    except Exception as e:
       
        error_message = f"An unexpected error occurred: {str(e)}"
        messages.error(request, error_message)
        return HttpResponseServerError(error_message)
