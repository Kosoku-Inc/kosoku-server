import os

root = '/Users/lonelyastronaut/Documents/Projects/Kosoku/kosoku-server/src/'
data = {}
text_file = open(root + "meh.txt", "w")

for path, subdirs, files in os.walk(root):
    for name in files:
        path = os.path.join(path, name)
        data[path] = name

keys = sorted(data.keys())

for key in keys:
    text_file.write('Файл ' + data[key] + '\n')

text_file.close()
