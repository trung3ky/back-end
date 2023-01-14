import os
import datetime
import re
import time
import json
import requests
import time
import webbrowser
def hello():
    content = "Hello123"
    return content

def getPriceIphone11():
    content = 'price of product Iphone 11'
    return content 
def play_youtube():
    search = "hài"
    url = f"https://www.youtube.com/search?q={search}"
    webbrowser.get().open(url)