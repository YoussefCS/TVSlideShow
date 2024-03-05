from flask import Flask, render_template, send_from_directory, jsonify, abort
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static')

# Path to the directory where files are stored
FILES_DIR = os.getenv('local_folder')

# Function to get the list of files from the directory
def get_files():
    files = []
    for filename in os.listdir(FILES_DIR):
        file_path = os.path.join(FILES_DIR, filename)
        if os.path.isfile(file_path):
            files.append({'filename': filename, 'filetype': get_file_type(filename), 'filepath': os.path.join('static', 'files', filename)})
    return files

# Function to get the file type based on file extension
def get_file_type(filename):
    extension = filename.split('.')[-1].lower()
    if extension in ('jpg', 'jpeg', 'png', 'gif', 'bmp'):
        return 'image'
    elif extension in ('xlsx', 'xls'):
        return 'excel'
    elif extension == 'txt':
        return 'text'
    elif extension in ('mp4', 'avi', 'mov'):
        return 'video'
    else:
        return 'unknown'

# Route for serving CSS files
@app.route('/TVSlideShow/static/styles/<path:filename>')
def send_css(filename):
    return send_from_directory('static/styles', filename)

# Route for serving JavaScript files
@app.route('/TVSlideShow/static/JS/<path:filename>')
def send_js(filename):
    return send_from_directory('static/JS', filename)

# Route for serving files files
@app.route('/TVSlideShow/static/files/<path:filename>')
def send_files(filename):
    return send_from_directory('static/files', filename)

# Route for serving the main HTML template
@app.route('/TVSlideShow')
def contracts():
    files = get_files()
    return render_template('index.htm', files=files)

# Route for serving the list of files with their types
@app.route('/TVSlideShow/get_files')
def get_files_route():
    files = get_files()
    return jsonify(files=files)

if __name__ == '__main__':
    app.run(port=8000, debug=True)
