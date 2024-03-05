import os
import shutil
from dotenv import load_dotenv

def copy(network_folder, local_folder):
    # Ensure local_folder is not None
    if local_folder is None:
        raise ValueError("local_folder cannot be None")

    # Create local folder if it doesn't exist
    if not os.path.exists(local_folder):
        os.makedirs(local_folder)

    # Get list of files in network folder
    network_files = os.listdir(network_folder)

    # Get list of files in local folder
    local_files = os.listdir(local_folder)

    for filename in network_files:
        network_file_path = os.path.join(network_folder, filename)
        local_file_path = os.path.join(local_folder, filename)

        # Check if file already exists in local folder
        if filename in local_files:
            # Check modification time to avoid duplicates
            network_file_time = os.path.getmtime(network_file_path)
            local_file_time = os.path.getmtime(local_file_path)
            if network_file_time != local_file_time:
                # File has been modified, copy the new version
                shutil.copy2(network_file_path, local_file_path)
                print(f"Updated {filename}")
        else:
            # File does not exist in local folder, copy it
            shutil.copy2(network_file_path, local_file_path)
            print(f"Copied {filename}")

    # Delete files from local folder that are not in the network folder
    for filename in local_files:
        if filename not in network_files:
            file_path = os.path.join(local_folder, filename)
            os.remove(file_path)
            print(f"Deleted {filename}")

if __name__ == "__main__":
    load_dotenv()  # Load environment variables from .env file
    network_folder = os.getenv("NETWORK_FOLDER")
    local_folder = os.getenv("LOCAL_FOLDER")

    copy(network_folder, local_folder)
