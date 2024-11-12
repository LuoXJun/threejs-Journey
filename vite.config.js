import { defineConfig } from 'vite';
import { exec } from 'child_process';
import chokidar from 'chokidar';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        {
            // 监听目录变化自动执行index.js脚本
            name: 'watch-and-execute',
            configureServer(server) {
                const watcher = chokidar.watch('./pages');
                /* 
                    add：当一个文件或目录被添加到被监听的目录中时触发。
                    change：当一个文件被修改时触发。注意，这个事件只适用于文件，不适用于目录。
                    unlink：当一个文件被删除时触发。
                    addDir：当一个目录被添加到被监听的目录中时触发。
                    unlinkDir：当一个目录被删除时触发。
                    ready：当初始扫描完成时触发。
                    raw：当底层操作系统发出原始事件时触发。这个事件通常用于调试。
                    error：当发生错误时触发。
                */
                const typeList = ['addDir', 'unlinkDir']
                const logEvent = (event, path) => {
                    if (typeList.includes(event)) {
                        exec('node index.js', (error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return;
                            }
                        });
                    }
                };

                watcher
                    .on('addDir', path => logEvent('addDir', path))
                    .on('unlinkDir', path => logEvent('unlinkDir', path))
            }
        }
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    base: "./",
    server: {
        host: '0.0.0.0'
    },
})
