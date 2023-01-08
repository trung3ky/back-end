from flask import Flask, redirect, url_for, render_template, request
from chat import chatbot

app = Flask(__name__)

messages = []
hyperl = []

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/", methods=["post"])
def home_post():
    userresp = request.form["text"]
    response = chatbot(userresp)
    flag = False
    if "http" in response:
        flag = True
    hyperl.append(flag)
    print(response)
    messages.append([userresp, response])
    k = list(range(len(messages)))
    return render_template("index.html", mesg=messages, hyperl=hyperl, num=k)


if __name__ == "__main__":
    app.run()
