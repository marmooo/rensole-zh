words = {}
with open("words.lst") as f:
    for line in f:
        word = line.split(",", 1)[0]
        words[word] = True

with open("cc.zh.300-small.vec", "w") as fout:
    fout.write(str(len(words)) + " 300\n")
    with open("cc.zh.300.vec") as fin:
        for line in fin:
            word = line.split(" ", 1)[0]
            if word in words:
                fout.write(line)
