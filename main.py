from groq import Groq
import os
from dotenv import load_dotenv
import sys
from flask import Flask,render_template, request, jsonify,send_file
from groq import Groq
from dotenv import load_dotenv
import cv2
from PIL import ImageGrab,Image
import os
import google.generativeai as genai
import shelve
import requests
from datetime import datetime
import base64
from pydub import AudioSegment
import io

load_dotenv()

app = Flask(__name__)

web_cam=cv2.VideoCapture(0)

grok_key=os.getenv('GROQ_API_KEY')
groq_client=Groq(api_key= grok_key)
genai_key=os.getenv('GENAI_API_KEY')
bhashini_key=os.getenv('bh_vivan')
genai.configure(api_key=genai_key)

load_dotenv()
app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

AudioSegment.converter = r"ffmpeg.exe"

TTS_FOLDER = 'tts_uploads'
os.makedirs(TTS_FOLDER, exist_ok=True)

generation_config={
    'temperature':0.7,
    'top_p':1,
    'top_k':1,
    'max_output_tokens':2048,
}
safety_settings=[
    {
        'category':'HARM_CATEGORY_HARASSMENT',
        'threshold':'BLOCK_NONE'
    },
    {
        'category':'HARM_CATEGORY_HATE_SPEECH',
        'threshold':'BLOCK_NONE'
    },
    {
        'category':'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold':'BLOCK_NONE'
    },
    {
        'category':'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold':'BLOCK_NONE'
    },

]

model=genai.GenerativeModel('gemini-1.5-flash-latest',
                            generation_config=generation_config,
                            safety_settings=safety_settings,)



def wav_to_text(audio_file_path,target_lang):
    with open(audio_file_path, "rb") as audio_file:
        audio_data = audio_file.read()
    base64_string = base64.b64encode(audio_data).decode('utf-8')
    translated=bhashini_stt(target_lang,base64_string)
    return translated

generation_config={
    'temperature':0.7,
    'top_p':1,
    'top_k':1,
    'max_output_tokens':2048,
}
safety_settings=[
    {
        'category':'HARM_CATEGORY_HARASSMENT',
        'threshold':'BLOCK_NONE'
    },
    {
        'category':'HARM_CATEGORY_HATE_SPEECH',
        'threshold':'BLOCK_NONE'
    },
    {
        'category':'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold':'BLOCK_NONE'
    },
    {
        'category':'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold':'BLOCK_NONE'
    },

]

model=genai.GenerativeModel('gemini-1.5-flash-latest',
                            generation_config=generation_config,
                            safety_settings=safety_settings,)



def wav_to_text(audio_file_path,target_lang):
    with open(audio_file_path, "rb") as audio_file:
        audio_data = audio_file.read()
    base64_string = base64.b64encode(audio_data).decode('utf-8')
    translated=bhashini_stt(target_lang,base64_string)
    return translated

def bhashini_tts(target_lang,query,gender):
    if target_lang in ["hi", "as", "gu", "mr", "or", "pa", "bn"]:
        service_id_tts = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4"
    elif target_lang in ["kn", "ml", "ta", "te"]:
        service_id_tts = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4"
    elif target_lang in ["en", "brx", "mni"]:
        service_id_tts = "ai4bharat/indic-tts-coqui-misc-gpu--t4"

    headers = {
     "Postman-Token": "<calculated when request is sent>", 
     "Content-Type": "application/json",
     "Content-Length": "<calculated when request is sent>", 
     "Host": "<calculated when request is sent>",
     "User-Agent": "PostmanRuntime/7.40.0",
     "Accept": "*/*",
     "Accept-Encoding": "gzip, deflate, br",
     "Connection": "keep-alive",
     "Accept":"*/*",
     "User-Agent": "Python", 
     "Authorization":bhashini_key
     }
    body = {
    "pipelineTasks": [       
        {
            "taskType": "tts",
            "config": {
                "language": {
                    "sourceLanguage": target_lang
                },
                "serviceId": service_id_tts,
                "gender": gender,
                "samplingRate": 8000
            }
        }
    ],
    "inputData": {
        "input": [
            {
                "source": query
            }
        ]
    }
    }
    
    response1 = requests.post("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", headers=headers,json=body)
    response_data = response1.json()
    audio_data = base64.b64decode(response_data['pipelineResponse'][0]['audio'][0]['audioContent'])
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"tts_{timestamp}.wav"
    file_path = os.path.join(TTS_FOLDER, filename)
    with open(file_path, "wb") as audio_file:
        audio_file.write(audio_data)
    return file_path

def translation(prompt, source_lang,target_lang):
    service_id_trans = "ai4bharat/indictrans-v2-all-gpu--t4"
    
    # If the source language is already English, no need to translate
    if target_lang == "en":
        return prompt
    
    # Headers as provided
    headers = {
        "Postman-Token": "<calculated when request is sent>", 
        "Content-Type": "application/json",
        "Content-Length": "<calculated when request is sent>", 
        "Host": "<calculated when request is sent>",
        "User-Agent": "PostmanRuntime/7.40.0",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "User-Agent": "Python", 
        "Authorization": bhashini_key
    }
    
    # Correct body structure with sourceLanguage and targetLanguage properly set
    body = {
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": source_lang,  # Source language (Malayalam in this case)
                        "targetLanguage": target_lang   # Target language (English in this case)
                    },
                    "serviceId": service_id_trans
                }
            }
        ],
        "inputData": {
            "input": [
                {
                    "source": prompt
                }
            ]
        }
    }
    
    # Make the POST request
    response = requests.post("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", headers=headers, json=body)
    
    # Get response data
    response_data = response.json()
    
    # Extracting only the English translation (target)
    translation_text = response_data['pipelineResponse'][0]['output'][0]['target']
    return translation_text


def bhashini_stt(target_language,audio):
    if target_language in ["hi"]:
        service_id_sst= "ai4bharat/conformer-hi-gpu--t4"
    elif target_language in ["kn", "ml", "ta", "te"]:
        service_id_sst = "ai4bharat/conformer-multilingual-dravidian-gpu--t4"
    elif target_language in ["en"]:
        service_id_sst = "ai4bharat/whisper-medium-en--gpu--t4"
    elif target_language in ["bn", "gu", "mr", "or", "pa", "sa","ur"]:
        service_id_sst = "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4"
    headers = {
     "Postman-Token": "<calculated when request is sent>", 
     "Content-Type": "application/json",
     "Content-Length": "<calculated when request is sent>", 
     "Host": "<calculated when request is sent>",
     "User-Agent": "PostmanRuntime/7.40.0",
     "Accept": "*/*",
     "Accept-Encoding": "gzip, deflate, br",
     "Connection": "keep-alive",
     "Accept":"*/*",
     "User-Agent": "Python", 
     "Authorization":bhashini_key
     }
    body = {
    "pipelineTasks": [
        {
            "taskType": "asr",
            "config": {
                "language": {
                    "sourceLanguage": target_language
                },
                "serviceId": service_id_sst,
                "audioFormat": "flac",
                "samplingRate": 16000
            }
        },
        { 
            "taskType": "translation",
            "config": {
                "language": {
                    "sourceLanguage": target_language,
                    "targetLanguage": "en"
                },
                "serviceId": "ai4bharat/indictrans-v2-all-gpu--t4"
            }
        }
    ],
    "inputData": {
        "audio": [
            {
                "audioContent": audio
            }
        ]
    }
}
    response = requests.post("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", headers=headers,json=body)
    response_data = response.json()
    source_text = response_data["pipelineResponse"][0]["output"][0]["source"]
    target_text = response_data["pipelineResponse"][1]["output"][0]["target"]
    return target_text,source_text



def load_chat_history():
    with shelve.open("chat_history") as db:
        return db.get("messages", [])

def save_chat_history(messages):
    with shelve.open("chat_history") as db:
        db["messages"] = messages


def ai_response(prompt,conversation_history,vb,img_context):
    sys_msg=(
    'You are a empathetic , kind ,helpful multi-modal AI  assistant for all government policies and schemes in india.Your user may or may not have attached a photo for context'
    '(either a screenshot or webcam capture).Any photo has already been processed into highly detailed '
    'text prompt that will be attached to thier transcribed voice prompt.You will also be given relavent context '
    ' for the answer from the database .Generate the most useful and'
    'factual response possible,carefully considering all previous generated text in your response before'
    'adding new tokens to the response.Do not expect or request images,just use the context if added'
    'Use all the context of this conversation to generate a relavent response to the conversation.Make'
    'your responses very short,to the point, ,clear and concise,avoiding any verbosisity keep it readable and understandable do not use special charecters.'
)
    prompt= prompt=(f'USER PROMPT:{prompt}\nConversation History:\n{conversation_history},\n RELATED CONTEXT:{vb}\n Image Context:{img_context}')
    function_convo=[{'role':'system','content':sys_msg},{'role':'user','content':prompt}]
    chat_completion=groq_client.chat.completions.create(messages=function_convo,model='llama3-70b-8192')
    response=chat_completion.choices[0].message
    return response.content


def function_call(prompt):
    sys_msg=(
        'You are a AI function calling model.You will determine whether'
        'taking a screenshot,capturing the webcam or calling no functions is best for a voice assistant to respond '
        'to the user prompt.The webcam can be assumed to be a normal laptop webcam facing the user .You will '
        'respond with only one selection from this list;["take screenshot","capture webcam","None"] \n'
        'Do no respond with anything but the most logical selection from that list with no explanations.Format the '
        'function call name excatly as it appears in the list above.'
    )

    function_convo=[{'role':'system','content':sys_msg},{'role':'user','content':prompt}]
    chat_completion=groq_client.chat.completions.create(messages=function_convo,model='llama3-70b-8192')
    response=chat_completion.choices[0].message
    return response.content

def take_screenshot():
    path = 'screenshot.jpg'
    screenshot=ImageGrab.grab()

    rgb_im=screenshot.convert('RGB')
    rgb_im.save(path,quality=15)

def web_cam_capture():
    if not web_cam.isOpened():
        print("Error: Could not open webcam")
        exit()
    path='webcam.jpg'
    ret,frame=web_cam.read()
    cv2.imwrite(path,frame)

def vision_prompt(prompt,photo_path):
    img=Image.open(photo_path)
    prompt=(
        'You are a vision analysis AI model that provides semantic meaning from images to provide context'
        'to send to another AI that will create a response to the user.Do not respond as the AI assistant'
        'to the user.Instead take the user prompt and try to extract all meaning from the photo'
        'relavent to the user prompt .Then generate as much objective data about the image for the next AI'
        f'assistant who will respond to the user prompt. \nUser Prompt: {prompt}'
    )
    response = model.generate_content([prompt,img])
    return response.text


def talk_to_chatbot(user_input):
    chat_history = load_chat_history()
    #  rag_answer=scheme_context(user_input)
    rag_answer=None
    call=function_call(user_input)
    if 'take screenshot' in call:
        print('Taking screenshot...')
        take_screenshot()
        visual_context=vision_prompt(user_input,photo_path='screenshot.jpg')
    elif 'capture webcam' in call:
        print('Capturing webcam...')
        web_cam_capture()
        visual_context=vision_prompt(user_input,photo_path='webcam.jpg')
    else:
        visual_context=None
    response = ai_response(user_input,chat_history,rag_answer,visual_context)
    chat_history.append({"user": user_input, "bot": response})
    save_chat_history(chat_history)
    return response


@app.route('/main/chat-request', methods=['POST'])
def chat_request():
    try:
        data = request.json
        user_input = data.get("input")
        language_code = data.get("languageCode")
        response=talk_to_chatbot(user_input)
        translated_response = translation(response,"en",language_code)
        # Process the input here
        response_data = {
            "message": f"{translated_response}"
        }
        return jsonify(response_data), 200
    except Exception as e:
        # Return an error message as JSON
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/main/upload-audio', methods=['POST'])
def save_audio():
    if 'audio' not in request.files:
        return 'No file part', 400

    file = request.files['audio']
    target_lang = request.form.get("targetLang")

    # Create a unique filename with datetime stamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"audio_{timestamp}.wav"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        # Save the file using Pydub to handle audio conversion
        audio_segment = AudioSegment.from_file(io.BytesIO(file.read()))
        audio_segment.export(file_path, format="wav")

        english_text,lang_text = wav_to_text(file_path, target_lang)  # Process for transcription

        return jsonify({
            'englishText': english_text,
            'langText': lang_text
        }), 200   # Return structured response
    except Exception as e:
        return f'Error processing file: {str(e)}' , 500


@app.route('/main/delete-request', methods=['POST'])
def delete_chat_history():
    with shelve.open("chat_history", writeback=True) as db:
        db["messages"] = []
    return '', 204 

@app.route('/main/tts-request', methods=['POST'])
def tts_request():
    data = request.json
    target_lang = data.get("targetLang")
    query = data.get("query")
    gender = data.get("gender")
    filename=bhashini_tts(target_lang,query,gender)
    return send_file(filename, mimetype="audio/wav")


def lang_detect(prompt):
    try:
        sys_msg = (
            "You will be given a word or a phrase in an indian language and you will answer with only the language of the word or phrase."
        )
        function_convo = [
            {'role': 'system', 'content': sys_msg},
            {'role': 'user', 'content': prompt}
        ]
        
        chat_completion = groq_client.chat.completions.create(
            messages=function_convo,
            model='llama3-70b-8192'
        )
        
        response = chat_completion.choices[0].message
        return response.content
    except Exception as e:
        print(f"Error in lang_detect: {str(e)}")
        return str(e)



@app.route('/')
def home_main():
    return render_template('index_m.html')


@app.route('/lang-request', methods=['POST'])
def lang_request():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.get_json()
        if not data or 'input' not in data:
            return jsonify({"error": "Missing input parameter"}), 400
        
        user_input = data['input']
        print(f"Received input: {user_input}") # Debug log
        
        response = lang_detect(user_input)
        print(f"Language detection response: {response}") # Debug log
        
        return jsonify({"message": response}), 200
    
    except Exception as e:
        print(f"Error in chat_request: {str(e)}") # Debug log
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)