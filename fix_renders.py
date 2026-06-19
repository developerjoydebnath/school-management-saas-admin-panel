import os
import re

files_with_render = []
for root, _, files in os.walk(r"c:\Workspace\Stackrover\school-management\admin-panel\src"):
    for file in files:
        if file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                if "render={" in content:
                    files_with_render.append(path)

print(f"Found {len(files_with_render)} files to fix.")

for path in files_with_render:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Generic replace for self-closing tag with render={<...>}
    # e.g. <DialogTrigger render={<Button />} /> -> <DialogTrigger asChild><Button /></DialogTrigger>
    # Also <Button nativeButton={false} render={<Link .../>} /> -> <Button asChild><Link .../></Button>
    # Also <AlertDialogTrigger render={<.../>} /> -> <AlertDialogTrigger asChild><.../></AlertDialogTrigger>
    
    # We will just print them out first to see what we are dealing with.
    matches = re.finditer(r'<([A-Z]\w+)[^>]*?render=\{([^>]+>)\}[^>]*?/>', content, re.DOTALL)
    for m in matches:
        print(f"File: {path}\nMatch: {m.group(0)}\n")
