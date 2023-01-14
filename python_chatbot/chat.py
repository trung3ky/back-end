import random
import json
import sys
import torch 

from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

import random
import json
 

from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('python_chatbot\\intents.json', 'r',encoding="utf-8") as json_data:
    intents = json.load(json_data)

FILE = "python_chatbot\\data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()
bot_name = "Sam"
def get_response(msg):
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    return "I do not understand..."


def fetch_info(name, type):
    products = json.load(open('python_chatbot\\item_2.json', 'r',encoding="utf-8"))
    for product in products["products"]:
        if product["name"].lower() == name.lower():
            if type == "specs":
                # return product["name"]+", "+product["price"]+", "+product["link"]+", The ratings are "+product["ratings"]
                return  product["name"]+", "+ str(product["price"]) +",<a href='"+product["link"]+"'><img src='"+product["image"]+"'/></a>"
            elif type == "link":
                return "<a href='"+product["link"]+"'>"+product["name"]+"</a>"
            else:
                return product[type]
    return "No such product found!"


def check_if_item(response):
    products = json.load(open('python_chatbot\\item_2.json', 'r',encoding="utf-8"))
    s = products["items"]
    for i in s:
        if i.lower() in response.lower():
            return i
    return 0


def chatbot(sentence):
    '''if __name__ == "__main__":
        print("Welcome to the E-commerce Chat! (type 'quit' to exit)")'''
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    with open('python_chatbot\\intents.json', 'r',encoding="utf-8") as json_data:
        intents = json.load(json_data)

    FILE = "python_chatbot\\data.pth"
    data = torch.load(FILE)

    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    output_size = data["output_size"]
    all_words = data['all_words']
    tags = data['tags']
    model_state = data["model_state"]

    model = NeuralNet(input_size, hidden_size, output_size).to(device)
    model.load_state_dict(model_state)
    model.eval()

    bot_name = "Morgan"
    while True:
        #sentence = input("You: ")
        # if sentence == "quit":
        #     break
        itm = check_if_item(sentence) 
        if itm != 0: 
            sentence = sentence.replace(itm, "", 1)
            resp = get_response(sentence) 
            if resp == "get price":
                resp = str(fetch_info(itm, "price"))
            elif resp == "get delivery":
                resp = str(fetch_info(itm, "delivery time"))
            elif resp == "get size":
                resp = str(fetch_info(itm, "size"))
            elif resp == "get link":
                resp = str(fetch_info(itm, "link"))
            elif resp == "get specs":
                resp = str(fetch_info(itm, "specs"))  
            else:
                resp = "I could not understand what to do with "+itm
        else:
            resp = get_response(sentence)
            if resp == "get items":
                products = json.load(open('python_chatbot\\item_2.json', 'r',encoding="utf-8"))
                resp = "List of our products are >>>\n"
                for i in products["items"]:
                    resp += i + ", "
        if resp == "get categories":
                products = json.load(open('python_chatbot\\item_2.json', 'r',encoding="utf-8"))
                resp = "List of our categories are >>>\n"
                for i in products["categories"]:
                    resp += i + ", "
        if "get" in resp:
            resp = "Check your product spelling and try again!"
        return resp

print(chatbot(str(sys.argv[1])))