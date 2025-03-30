# Rensole-zh

[一个利用单词之间相似性的联想游戏](https://marmooo.github.io/rensole-en/)。

## Requirements

- [rye](https://github.com/mitsuhiko/rye)
- `sudo apt install clang libstdc++-12-dev` for
  [spotify/annoy](https://github.com/spotify/annoy)

## Installation

- install [fxsjy/jieba](https://github.com/fxsjy/jieba) licensed under the MIT
- install
  [cc.zh.300.vec.gz](https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.zh.300.vec.gz)
  from [fastText](https://fasttext.cc/docs/en/crawl-vectors.html) licensed under
  the [CC-BY-SA-3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- install [marmooo/siminym-zh](https://github.com/marmooo/siminym-zh) licensed
  under the [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- `rye sync`

## Build

```
bash build-dict.sh
bash build-db.sh
bash build.sh
```

## Related projects

- [Rensole-en](https://github.com/marmooo/rensole-en) (English)
- [Rensole-ja](https://github.com/marmooo/rensole-ja) (Japanese)

## License

CC-BY-SA-4.0
