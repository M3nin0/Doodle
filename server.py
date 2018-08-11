from flask import Flask, render_template, send_from_directory

app = Flask(__name__, template_folder = './')

app.config["CACHE_TYPE"] = "null"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/data_filtered/<file>')
def download(file):
    return send_from_directory(directory = './', filename = 'data_filtered/{}'.format(file))


@app.route('/res/<file>')
def res(file):
    return send_from_directory(directory = './', filename = file)


@app.route('/lib/<file>')
def lib(file):
    return send_from_directory(directory = './', filename = 'lib/{}'.format(file))


if __name__ == '__main__':
    app.run()
