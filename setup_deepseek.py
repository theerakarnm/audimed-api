# setup_deepseek.py
import os
from dotenv import load_dotenv

def setup_deepseek_env():
    """
    Interactive setup for DeepSeek environment
    """
    print("🔧 DeepSeek Environment Setup")
    print("="*40)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("Creating .env file...")
        
        api_key = input("Enter your DeepSeek API key: ").strip()
        
        with open('.env', 'w') as f:
            f.write(f"DEEPSEEK_API_KEY={api_key}\n")
            f.write("DEEPSEEK_BASE_URL=https://api.deepseek.com\n")
        
        print("✅ .env file created successfully!")
    else:
        print("✅ .env file already exists")
    
    # Load and validate
    load_dotenv()
    
    if os.getenv('DEEPSEEK_API_KEY'):
        print("✅ DeepSeek API key loaded")
    else:
        print("❌ DeepSeek API key not found")
    
    print("\n🚀 Setup complete! You can now run the optimization.")

if __name__ == "__main__":
    setup_deepseek_env()