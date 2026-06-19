const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: <DialogTrigger render={<Button />}>...</DialogTrigger>
    content = content.replace(/<DialogTrigger\s+render=\{<Button\s*\/>\}>/g, '<DialogTrigger asChild><Button />');
    
    // Pattern 2: <AlertDialogTrigger nativeButton={false} render={<Switch checked={...} />} />
    // or without nativeButton={false}
    content = content.replace(/<AlertDialogTrigger[\s\S]*?render=\{<Switch([^>]+) \/>\}[\s\S]*?\/>/g, '<AlertDialogTrigger asChild><Switch$1 /></AlertDialogTrigger>');

    // Pattern 3: <AlertDialogTrigger render={<Button ...>...</Button>} />
    content = content.replace(/<AlertDialogTrigger[\s\S]*?render=\{([\s\S]*?)\}[\s\S]*?\/>/g, (match, inner) => {
        if (inner.includes('<Button') || inner.includes('<a') || inner.includes('<Link')) {
            return `<AlertDialogTrigger asChild>${inner.trim()}</AlertDialogTrigger>`;
        }
        return match;
    });

    // Pattern 4: <Button nativeButton={false} render={<Link ... />} ...>...</Button>
    content = content.replace(/<Button([^>]*?)nativeButton=\{false\}([^>]*?)render=\{<Link([^>]+)\/>\}([^>]*)>([\s\S]*?)<\/Button>/g, (match, p1, p2, linkAttrs, p4, children) => {
        let attrs = (p1 + p2 + p4).replace(/\s+/g, ' ').trim();
        return `<Button asChild ${attrs}>\n\t<Link${linkAttrs}>\n\t\t${children.trim()}\n\t</Link>\n</Button>`;
    });

    // Pattern 5: <Button render={<Link ... />} ...>...</Button>
    content = content.replace(/<Button([^>]*?)render=\{<Link([^>]+)\/>\}([^>]*)>([\s\S]*?)<\/Button>/g, (match, p1, linkAttrs, p3, children) => {
        let attrs = (p1 + p3).replace(/\s+/g, ' ').trim();
        return `<Button asChild ${attrs}>\n\t<Link${linkAttrs}>\n\t\t${children.trim()}\n\t</Link>\n</Button>`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  }
});
