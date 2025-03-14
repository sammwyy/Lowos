export interface FSNode {
  name: string;
  type: "file" | "directory";
  content?: string; // For files
  metadata: {
    createdAt: Date;
    modifiedAt: Date;
    size: number;
    executable?: boolean;
  };
  children?: Map<string, FSNode>; // For directories
}

export class FileSystem {
  private root: FSNode;
  private currentDir: FSNode;
  private path: string[] = ["/"];

  constructor() {
    // Initialize the root directory
    this.root = {
      name: "/",
      type: "directory",
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        size: 0,
      },
      children: new Map(),
    };

    this.currentDir = this.root;

    // Create initial directories and files
    this.mkdir("/bin");
    this.mkdir("/etc");
    this.mkdir("/home");
    this.mkdir("/home/user");

    // Create some example files
    this.writeFile(
      "/bin/hello",
      '// Example program\nfunction main() {\n  console.log("Hello, World!");\n  drawText("Hello, World!", 10, 50);\n}'
    );
    this.writeFile(
      "/bin/snake",
      '// Snake game\nfunction main() {\n  console.log("Snake game starting...");\n  // Game logic would go here\n  drawText("Snake Game", 10, 50);\n}'
    );

    // Set executable flag
    const helloFile = this.getNode("/bin/hello");
    const snakeFile = this.getNode("/bin/snake");
    if (helloFile && snakeFile) {
      helloFile.metadata.executable = true;
      snakeFile.metadata.executable = true;
    }
  }

  private getNode(path: string): FSNode | null {
    if (path === "/") return this.root;

    const parts = path.split("/").filter(Boolean);
    let currentNode = this.root;

    for (const part of parts) {
      if (!currentNode.children?.has(part)) {
        return null;
      }
      const nextNode = currentNode.children.get(part);
      if (!nextNode) return null;
      currentNode = nextNode;
    }

    return currentNode;
  }

  private createNodeIfNotExists(
    path: string,
    type: "file" | "directory",
    content?: string
  ): FSNode {
    if (path === "/") return this.root;

    const parts = path.split("/").filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) throw new Error("Invalid path");

    let currentDir = this.root;

    // Navigate to the parent directory
    for (const part of parts) {
      if (!currentDir.children?.has(part)) {
        // Create directory if it doesn't exist
        const newDir: FSNode = {
          name: part,
          type: "directory",
          metadata: {
            createdAt: new Date(),
            modifiedAt: new Date(),
            size: 0,
          },
          children: new Map(),
        };
        currentDir.children?.set(part, newDir);
      }
      const nextDir = currentDir.children?.get(part);
      if (!nextDir || nextDir.type !== "directory")
        throw new Error(`Path component ${part} is not a directory`);
      currentDir = nextDir;
    }

    // Check if file/dir already exists
    if (currentDir.children?.has(fileName)) {
      const existingNode = currentDir.children.get(fileName);
      if (existingNode && existingNode.type === type) {
        if (type === "file" && content !== undefined) {
          existingNode.content = content;
          existingNode.metadata.modifiedAt = new Date();
          existingNode.metadata.size = content.length;
        }
        return existingNode;
      } else {
        throw new Error(`${fileName} already exists and is not a ${type}`);
      }
    }

    // Create the new node
    const newNode: FSNode = {
      name: fileName,
      type: type,
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        size: content ? content.length : 0,
      },
    };

    if (type === "file") {
      newNode.content = content || "";
    } else {
      newNode.children = new Map();
    }

    currentDir.children?.set(fileName, newNode);
    return newNode;
  }

  getCurrentPath(): string {
    return this.path.join("/").replace("//", "/");
  }

  mkdir(path: string): boolean {
    try {
      this.createNodeIfNotExists(path, "directory");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  writeFile(path: string, content: string): boolean {
    try {
      this.createNodeIfNotExists(path, "file", content);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== "file" || node.content === undefined) {
      return null;
    }
    return node.content;
  }

  listDir(path: string = this.getCurrentPath()): string[] {
    const node = path === "" ? this.currentDir : this.getNode(path);
    if (!node || node.type !== "directory" || !node.children) {
      return [];
    }

    return Array.from(node.children.keys());
  }

  changeDir(path: string): boolean {
    if (path === "..") {
      if (this.path.length > 1) {
        this.path.pop();
        this.currentDir = this.getNode(this.getCurrentPath()) || this.root;
      }
      return true;
    }

    const targetPath = path.startsWith("/")
      ? path
      : `${this.getCurrentPath()}/${path}`.replace("//", "/");

    const node = this.getNode(targetPath);
    if (!node || node.type !== "directory") {
      return false;
    }

    this.currentDir = node;
    this.path =
      targetPath === "/" ? ["/"] : targetPath.split("/").filter(Boolean);
    if (!this.path.length) this.path = ["/"];

    return true;
  }

  isExecutable(path: string): boolean {
    const node = this.getNode(path);
    return !!(node && node.type === "file" && node.metadata.executable);
  }

  getFileInfo(path: string): {
    exists: boolean;
    type?: "file" | "directory";
    executable?: boolean;
  } {
    const node = this.getNode(path);
    if (!node) return { exists: false };

    return {
      exists: true,
      type: node.type,
      executable: node.type === "file" ? !!node.metadata.executable : undefined,
    };
  }
}
