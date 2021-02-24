import fs from "fs";
import path from "path";
import globby from "globby";

const contentDirectory = path.join(process.cwd(), "content");

export function moveImagesToPublicDirectory() {
  (async () => {

    const paths = await globby(contentDirectory, {
      expandDirectories: {
        files: ['*.png', '*.jpg', '*.svg', '*.jpeg'],
        extensions: ['png', 'jpg', 'svg', 'jpeg']
      }
    });
    const newPaths = paths.map(path => path.replace('/content', '/public'));
    const currentDirectories = paths.map(path => path.split('/').slice(0, -1).join('/'));
    const uniqueDirectories = Array.from(new Set(currentDirectories));
    const newDirectories = uniqueDirectories.map(directory => directory.replace('/content', '/public'))
    // 1. Delete old directories to sync images
    newDirectories.forEach(directory => {
      if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true })
      }
    })
    // 2. Create new directories
    newDirectories.forEach(directory => {
      fs.mkdirSync(directory, { recursive: true });
    })

    // 3. Copy images
    paths.forEach((path, index) => {
      try {
        fs.copyFileSync(path, newPaths[index])
      } catch (err) {
        console.log(err);
      }
    })
  })();
}
