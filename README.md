# MS Translator CLI

## Install
1. install [Node.js](https://nodejs.org/)
2. `./install.sh`

## Usage
### Configuration
1. sign up for Microsoft Translator from [webpage](https://datamarket.azure.com/dataset/bing/microsofttranslator)
2. register the application from [webpage](https://datamarket.azure.com/developer/applications)
    * obtain client_id and client\_secret
3. write configuration file (`~/.mstclirc`) as follows.
```
to: <default language (e.g. ja, en)>
from: <default language (e.g. ja, en)>
client_id: <client_id>
client_secret: <client_secret>
```

### CLI
1. to translate the words.
```
$ mstcli -f en -t ja This is a sample sentence.
```
2. to translate the file
```
$ cat file | mstcli -f en -t ja
```
