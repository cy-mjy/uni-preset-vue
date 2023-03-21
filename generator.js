const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')

const isBinary = require('isbinaryfile')

async function generate(dir, files, base = '', rootOptions = {}) {
  const glob = require('glob')

  glob.sync('**/*', {
    cwd: dir,
    nodir: true
  }).forEach(rawPath => {
    const sourcePath = path.resolve(dir, rawPath)
    const filename = path.join(base, rawPath)

    if (isBinary.sync(sourcePath)) {
      files[filename] = fs.readFileSync(sourcePath) // return buffer
    } else {
      let content = fs.readFileSync(sourcePath, 'utf-8')
      if (path.basename(filename) === 'manifest.json') {
        content = content.replace('{{name}}', rootOptions.projectName || '')
      }
      if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
        files[`.${filename.slice(1)}`] = content
      } else if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
        files[`${filename.slice(1)}`] = content
      } else {
        files[filename] = content
      }
    }
  })
}

module.exports = (api, options, rootOptions) => {
  api.extendPackage(pkg => {
    return {
      devDependencies: {
        '@dcloudio/uni-helper-json': '*',
        '@dcloudio/types': '^3.3.2',
        'miniprogram-api-typings': '*',
        'mini-types': '*',
        "postcss": '^8.4.21',
        'postcss-comment': '^2.0.0',
        'sass': '^1.49.8',
        'sass-loader': '^8.0.2'
      },
      "uni-app": {
        "scripts": {
          "mp-dingtalk": {
            "title": "钉钉小程序",
            "env": {
              "UNI_PLATFORM": "mp-alipay"
            },
            "define": {
              "MP-DINGTALK": true
            }
          }
        }
      }
    }
  })
  api.extendPackage(pkg => {
    return {
      dependencies: {
        'vue': '>= 2.6.14 < 2.7'
      },
      devDependencies: {
        'vue-template-compiler': '>= 2.6.14 < 2.7',
      }
    }
  }, { forceOverwrite: true })

  api.render(async function (files) {
    Object.keys(files).forEach(name => {
      delete files[name]
    })

    const base = 'src'
    await generate(path.resolve(__dirname, './template/common'), files)
    await generate(path.resolve(__dirname, './template/default'), files, base, rootOptions)
  })
}
