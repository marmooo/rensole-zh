words = {}
with open("siminym-zh-repo/all.lst") as f:
    for line in f:
        word = line.split(",", 1)[0]
        words[word] = True

count = 0
with open("cc.zh.300.vec") as f:
    for line in f:
        word = line.split(" ", 1)[0]
        if word in words:
            count += 1

with open("cc.zh.300-small.vec", "w") as fout:
    fout.write(str(count) + " 300\n")
    with open("cc.zh.300.vec") as fin:
        for line in fin:
            word = line.split(" ", 1)[0]
            if word in words:
                fout.write(line)
