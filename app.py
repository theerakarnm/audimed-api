# app.py
import os
import pandas as pd
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

class DeepSeekClient:
    def __init__(self):
        self.api_key = os.getenv('DEEPSEEK_API_KEY')
        self.base_url = os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
        
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_KEY not found in environment variables")
    
    def chat_completion(self, messages, model="deepseek-chat", temperature=0.1, max_tokens=4000):
        """
        Make API call to DeepSeek using requests
        """
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
            
        except requests.exceptions.RequestException as e:
            print(f"DeepSeek API Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            return None

def deepseek_optimize_diagnosis_codes(dataset_path, available_codes):
    """
    Use DeepSeek to analyze patterns and optimize diagnosis code selection
    """
    
    # Initialize DeepSeek client
    client = DeepSeekClient()
    
    # Load and prepare dataset
    df = pd.read_csv(dataset_path)
    dataset_summary = prepare_dataset_summary(df)
    
    # Create analysis prompt
    prompt = f"""
    You are an expert healthcare data analyst specializing in DRG optimization and maximizing adjusted Relative Weight (adj RW).

    DATASET ANALYSIS - TOP PERFORMING CASES:
    {dataset_summary}

    AVAILABLE ICD-10 CODES TO SELECT FROM:
    {', '.join(available_codes)}

    TASK: Analyze the dataset patterns to select the optimal combination that will yield the HIGHEST possible adj RW.

    ANALYSIS REQUIREMENTS:
    1. Identify which diagnosis combinations correlate with highest adj RW values
    2. Look for synergistic effects between primary and secondary diagnoses
    3. Consider complexity factors that increase reimbursement
    4. Focus purely on maximizing adj RW (ignore clinical plausibility)

    SELECTION CRITERIA:
    - Choose 1 PRIMARY diagnosis (pdx) from available codes
    - Choose up to 12 SECONDARY diagnoses (sdx1-sdx12) from available codes
    - Aim for estimated adj RW > 15.0

    THINK STEP BY STEP:
    1. What patterns show the highest adj RW in the dataset?
    2. Which available codes match these high-value patterns?
    3. How can codes be combined for maximum synergy?
    4. What is the optimal combination?

    RESPOND IN VALID JSON FORMAT ONLY:
    {{
        "pattern_analysis": "Detailed analysis of high-value patterns found in dataset",
        "pdx": "selected_primary_diagnosis_code",
        "sdx": ["sdx1_code", "sdx2_code", "sdx3_code", "sdx4_code", "sdx5_code", "sdx6_code", "sdx7_code", "sdx8_code", "sdx9_code", "sdx10_code", "sdx11_code", "sdx12_code"],
        "reasoning": "Detailed explanation of why this combination should maximize adj RW",
        "estimated_adj_rw": 0.0,
        "confidence_level": "1-100 percentage scale"
    }}
    """
    
    system_prompt = """
     You are a healthcare data analyst specializing in DRG analysis and coding accuracy optimization. Your role is to help healthcare organizations improve their clinical documentation and coding practices while maintaining full compliance with healthcare regulations and ethical standards. a world-class healthcare data scientist with expertise in DRG optimization, ICD-10 coding patterns, and reimbursement maximization. Always respond with valid JSON only.

    CORE PRINCIPLES:
    - All recommendations must be clinically appropriate and ethically sound
    - Focus on accurate documentation rather than reimbursement maximization
    - Ensure compliance with CMS guidelines and coding standards
    - Prioritize patient care quality over financial metrics

    ANALYSIS FRAMEWORK:
    When analyzing healthcare data patterns, consider:

    1. CLINICAL ACCURACY
    - Ensure all diagnosis combinations are clinically plausible
    - Verify appropriate sequencing of primary and secondary diagnoses
    - Consider patient demographics and clinical context

    2. DOCUMENTATION IMPROVEMENT
    - Identify gaps in clinical documentation
    - Suggest areas where more specific coding could improve accuracy
    - Recommend physician education opportunities

    3. CODING COMPLIANCE
    - Follow ICD-10-CM/PCS official guidelines
    - Adhere to CMS coding and billing regulations
    - Maintain ethical coding practices

    4. QUALITY METRICS
    - Focus on Case Mix Index (CMI) improvement through accuracy
    - Consider quality indicators alongside financial metrics
    - Balance documentation completeness with clinical relevance

    RESPONSE FORMAT:
    Provide analysis in structured format including:
    - Clinical rationale for all recommendations
    - Compliance considerations
    - Educational opportunities identified
    - Quality improvement suggestions
    - Risk mitigation strategies

    ETHICAL BOUNDARIES:
    - Never recommend clinically inappropriate coding
    - Do not suggest documentation solely for reimbursement purposes
    - Always prioritize patient care and safety
    - Maintain transparency in all recommendations

    Remember: The goal is to improve healthcare delivery through better documentation and coding accuracy, not to manipulate reimbursement systems.
     """
    
    messages = [
        {
            "role": "system", 
            "content": system_prompt
        },
        {
            "role": "user", 
            "content": prompt
        }
    ]
    
    # Make API call
    response_text = client.chat_completion(messages)
    
    if not response_text:
        return None
    
    try:
        # Extract JSON from response
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start == -1 or json_end == 0:
            print("No JSON found in response")
            print(f"Response: {response_text}")
            return None
            
        json_text = response_text[json_start:json_end]
        result = json.loads(json_text)
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text}")
        return None

def prepare_dataset_summary(df):
    """
    Prepare comprehensive dataset summary for DeepSeek analysis
    """
    # Get top 15 highest adj RW cases
    top_cases = df.nlargest(15, 'adj RW')
    
    summary = "HIGH-VALUE CASES ANALYSIS:\n"
    summary += "=" * 50 + "\n"
    
    for idx, row in top_cases.iterrows():
        summary += f"CASE {row['case_id']}: adj RW = {row['adj RW']:.2f}\n"
        summary += f"  Primary Diagnosis: {row['pdx']}\n"
        
        # Collect all secondary diagnoses
        sdx_codes = []
        for i in range(1, 16):
            if pd.notna(row.get(f'sdx{i}')) and str(row.get(f'sdx{i}')).strip() != '':
                sdx_codes.append(str(row[f'sdx{i}']).strip())
        
        if sdx_codes:
            summary += f"  Secondary Diagnoses: {', '.join(sdx_codes)}\n"
        
        summary += "-" * 30 + "\n"
    
    return summary

def validate_deepseek_connection():
    """
    Test DeepSeek API connection
    """
    try:
        client = DeepSeekClient()
        response = client.chat_completion([
            {"role": "user", "content": "Hello, respond with just 'OK' if you're working."}
        ])
        
        if response and "OK" in response:
            print("✅ DeepSeek API connection successful!")
            return True
        else:
            print(f"⚠️ Unexpected response: {response}")
            return False
            
    except Exception as e:
        print(f"❌ DeepSeek API connection failed: {e}")
        return False

# Main execution
if __name__ == "__main__":
    print("🔧 Setting up DeepSeek optimization...")
    
    # Validate API connection first
    if not validate_deepseek_connection():
        print("Please check your API key in .env file")
        exit(1)
    
    # Your 20 available ICD-10 codes
    available_codes = [
        "J150", "J180", "J156", "J960", "J969", "D638", "N179", "E871",
        "E876", "C56", "I829", "J00", "J47", "I500", "E43", "I214",
        "C794", "C795", "I632", "N390"
    ]
    
    # Run optimization
    print("🚀 Starting DeepSeek optimization...")
    
    # Replace 'your_data.csv' with your actual file path
    dataset_file = "dataset.csv"  # Update this path
    
    result = deepseek_optimize_diagnosis_codes(dataset_file, available_codes)
    
    if result:
        print("\n" + "="*60)
        print("🎯 DEEPSEEK OPTIMIZATION RESULT")
        print("="*60)
        print(f"📊 Pattern Analysis:\n{result['pattern_analysis']}\n")
        print(f"🏥 Primary Diagnosis (pdx): {result['pdx']}")
        print("\n📋 Secondary Diagnoses:")
        for i, code in enumerate(result['sdx'], 1):
            print(f"   sdx{i:2d}: {code}")
        print(f"\n💰 Estimated adj RW: {result['estimated_adj_rw']:.2f}")
        print(f"🎯 Confidence Level: {result['confidence_level']}/10")
        print(f"\n💡 Reasoning:\n{result['reasoning']}")
    else:
        print("❌ Optimization failed. Please check your API key and data file.")