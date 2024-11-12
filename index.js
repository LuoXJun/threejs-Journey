import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dirPath = path.resolve(__dirname, './pages')
const fileNames = fs.readdirSync(dirPath)

let str = '\n'
fileNames.forEach(fileName => {
    str += `<a href="pages/${fileName + '/index.html'}">${fileName}</a><br>\n`
})

const fd = './index.html'

/* 
    不替换body里面的内容而是全部写入是因为
    启动项目时会多次触发addDir事件，导致读取和写入出现异常
 */
const indexHtml = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>目录</title>
</head>

<body>
${str}
</body>

</html>
`
fs.writeFileSync(fd, indexHtml, 'utf-8')
