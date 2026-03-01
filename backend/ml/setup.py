#!/usr/bin/env python3
"""
Setup script for Careerak ML/AI Environment
سكريبت إعداد بيئة التعلم الآلي لكاريرك

This script sets up the Python environment for the recommendation system.
"""

import os
import sys
import subprocess
import platform

def print_header(message):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"  {message}")
    print("=" * 60 + "\n")

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    print_header("Checking Python Version")
    
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Error: Python 3.8 or higher is required")
        print("   Please upgrade Python and try again")
        sys.exit(1)
    
    print("✅ Python version is compatible")

def create_virtual_environment():
    """Create a virtual environment"""
    print_header("Creating Virtual Environment")
    
    venv_path = os.path.join(os.path.dirname(__file__), 'venv')
    
    if os.path.exists(venv_path):
        print(f"⚠️  Virtual environment already exists at: {venv_path}")
        response = input("   Do you want to recreate it? (y/n): ")
        if response.lower() != 'y':
            print("   Skipping virtual environment creation")
            return venv_path
        
        # Remove existing venv
        import shutil
        shutil.rmtree(venv_path)
    
    try:
        subprocess.run([sys.executable, '-m', 'venv', venv_path], check=True)
        print(f"✅ Virtual environment created at: {venv_path}")
        return venv_path
    except subprocess.CalledProcessError as e:
        print(f"❌ Error creating virtual environment: {e}")
        sys.exit(1)

def get_pip_executable(venv_path):
    """Get the pip executable path for the virtual environment"""
    if platform.system() == 'Windows':
        return os.path.join(venv_path, 'Scripts', 'pip.exe')
    else:
        return os.path.join(venv_path, 'bin', 'pip')

def install_dependencies(venv_path):
    """Install Python dependencies"""
    print_header("Installing Dependencies")
    
    pip_executable = get_pip_executable(venv_path)
    requirements_file = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    
    if not os.path.exists(requirements_file):
        print(f"❌ Error: requirements.txt not found at: {requirements_file}")
        sys.exit(1)
    
    try:
        # Upgrade pip first
        print("📦 Upgrading pip...")
        subprocess.run([pip_executable, 'install', '--upgrade', 'pip'], check=True)
        
        # Install dependencies
        print("📦 Installing dependencies from requirements.txt...")
        subprocess.run([pip_executable, 'install', '-r', requirements_file], check=True)
        
        print("✅ All dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

def download_spacy_models():
    """Download spaCy language models"""
    print_header("Downloading spaCy Models")
    
    venv_path = os.path.join(os.path.dirname(__file__), 'venv')
    
    if platform.system() == 'Windows':
        python_executable = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:
        python_executable = os.path.join(venv_path, 'bin', 'python')
    
    models = [
        ('en_core_web_sm', 'English'),
        ('ar_core_news_sm', 'Arabic')
    ]
    
    for model, language in models:
        try:
            print(f"📥 Downloading {language} model ({model})...")
            subprocess.run([python_executable, '-m', 'spacy', 'download', model], check=True)
            print(f"✅ {language} model downloaded successfully")
        except subprocess.CalledProcessError:
            print(f"⚠️  Warning: Could not download {language} model")
            print(f"   You can download it manually later with:")
            print(f"   python -m spacy download {model}")

def create_directories():
    """Create necessary directories"""
    print_header("Creating Directories")
    
    base_dir = os.path.dirname(__file__)
    directories = [
        'models',
        'data',
        'data/raw',
        'data/processed',
        'data/features',
        'logs',
        'cache'
    ]
    
    for directory in directories:
        dir_path = os.path.join(base_dir, directory)
        os.makedirs(dir_path, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def create_env_file():
    """Create .env file if it doesn't exist"""
    print_header("Creating Environment File")
    
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_file):
        print(f"⚠️  .env file already exists at: {env_file}")
        return
    
    env_template = """# ML/AI Environment Variables
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/careerak

# Redis Connection (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Model Settings
MODEL_VERSION=1.0.0
MODEL_PATH=./models

# Feature Engineering
MAX_FEATURES=1000
MIN_SKILL_FREQUENCY=2

# Training Settings
TRAIN_TEST_SPLIT=0.2
RANDOM_SEED=42
BATCH_SIZE=32

# Recommendation Settings
MIN_RECOMMENDATION_SCORE=30
MAX_RECOMMENDATIONS=20
CACHE_TTL=3600

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/ml.log
"""
    
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(env_template)
    
    print(f"✅ Created .env file at: {env_file}")
    print("   Please update it with your actual configuration")

def print_activation_instructions(venv_path):
    """Print instructions for activating the virtual environment"""
    print_header("Setup Complete!")
    
    print("✅ Python environment is ready for ML/AI development")
    print("\nTo activate the virtual environment:")
    
    if platform.system() == 'Windows':
        activate_script = os.path.join(venv_path, 'Scripts', 'activate.bat')
        print(f"   {activate_script}")
        print("\n   Or in PowerShell:")
        activate_ps1 = os.path.join(venv_path, 'Scripts', 'Activate.ps1')
        print(f"   {activate_ps1}")
    else:
        activate_script = os.path.join(venv_path, 'bin', 'activate')
        print(f"   source {activate_script}")
    
    print("\nNext steps:")
    print("1. Activate the virtual environment")
    print("2. Update the .env file with your configuration")
    print("3. Run the data collection script to gather training data")
    print("4. Train the initial models")
    
    print("\n" + "=" * 60 + "\n")

def main():
    """Main setup function"""
    print_header("Careerak ML/AI Environment Setup")
    print("This script will set up the Python environment for the recommendation system")
    
    try:
        # Check Python version
        check_python_version()
        
        # Create virtual environment
        venv_path = create_virtual_environment()
        
        # Install dependencies
        install_dependencies(venv_path)
        
        # Download spaCy models
        download_spacy_models()
        
        # Create directories
        create_directories()
        
        # Create .env file
        create_env_file()
        
        # Print activation instructions
        print_activation_instructions(venv_path)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
