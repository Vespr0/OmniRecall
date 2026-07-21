### Install Plugin Dependencies

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Build a plugin.md

Install the necessary Node.js dependencies for the sample plugin using npm.

```bash
npm install
```

---

### Example manifest.json

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/Versions.md

Defines the plugin version and the minimum required Obsidian app version.

```json
{
  // ...

  "version": "1.0.0",
  "minAppVersion": "1.2.0"
}
```

---

### Complete Settings Tab Implementation with SecretComponent

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Guides/Store secrets.md

A full example of a plugin settings tab that integrates SecretComponent for secure secret management. It includes the settings interface, the SecretComponent setup, and saving the secret name.

```typescript
import { App, PluginSettingTab, SecretComponent, Setting } from "obsidian";
import MyPlugin from "./main";

export interface MyPluginSettings {
  mySetting: string;
}

export class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("API key")
      .setDesc("Select a secret from SecretStorage")
      .addComponent((el) =>
        new SecretComponent(this.app, el)
          .setValue(this.plugin.settings.mySetting)
          .onChange((value) => {
            this.plugin.settings.mySetting = value;
            this.plugin.saveSettings();
          }),
      );
  }
}
```

---

### Example versions.json

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/Versions.md

Maps plugin versions to their corresponding minimum required Obsidian app versions for fallback compatibility.

```json
{
  "0.1.0": "1.0.0",
  "0.12.0": "1.1.0"
}
```

---

### Properties Configuration Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/BasesConfigFile.md

Defines the structure for configuring properties in a Base. This can include settings like 'displayName'.

```typescript
Record<string, Record<string, any>>;
```

---

### Plugin.onUserEnable()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Plugin/onUserEnable.md

Perform any initial setup code. The user has explicitly interacted with the plugin so its safe to engage with the user. If your plugin registers a custom view, you can open it here.

````APIDOC
## Plugin.onUserEnable()

### Description
Perform any initial setup code. The user has explicitly interacted with the plugin so its safe to engage with the user. If your plugin registers a custom view, you can open it here.

### Signature
```typescript
onUserEnable(): void;
````

### Returns

`void`

````

--------------------------------

### SubpathResult.start

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/SubpathResult/start.md

The `start` property of a `SubpathResult` object represents the starting location of a subpath. It is of type `Loc`.

```APIDOC
## SubpathResult.start property

### Description

The `start` property indicates the starting point of a subpath within a larger context. This property is of type `Loc`, which likely defines a specific location or coordinate.

### Signature

```typescript
start: Loc;
````

### Type

`Loc`

````

--------------------------------

### Add React dependencies

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Use React in your plugin.md

Install React and ReactDOM as project dependencies. This is the first step to using React in your plugin.

```bash
npm install react react-dom
````

---

### Get Markdown Files

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Vault.md

Retrieves all Markdown files within the vault. This is a common starting point for many file-related operations.

```APIDOC
## Get Markdown Files

### Description
Retrieves all Markdown files within the vault. This is a common starting point for many file-related operations.

### Method
`app.vault.getMarkdownFiles()`

### Returns
- `TFile[]`: An array of `TFile` objects representing the Markdown files.
```

---

### Setting a Tooltip with Options

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/ButtonComponent/setTooltip.md

This example shows how to set a tooltip with additional options, such as positioning or delay. The options parameter is optional.

```typescript
button.setTooltip("Another tooltip", {
  placement: "top",
  delay: 500,
});
```

---

### getFrontMatterInfo()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/getFrontMatterInfo.md

Given the contents of a file, get information about the frontmatter of the file, including whether there is a frontmatter block, the offsets of where it starts and ends, and the frontmatter text.

````APIDOC
## getFrontMatterInfo()

### Description
Given the contents of a file, get information about the frontmatter of the file, including whether there is a frontmatter block, the offsets of where it starts and ends, and the frontmatter text.

### Signature
```typescript
export function getFrontMatterInfo(content: string): FrontMatterInfo;
````

### Parameters

#### Path Parameters

- **content** (string) - Description: The content of the file to analyze.

### Returns

#### Success Response

- **FrontMatterInfo** (FrontMatterInfo) - An object containing information about the frontmatter.

### Response Example

```json
{
  "exists": true,
  "start": 0,
  "end": 100,
  "text": "---\nkey: value\n---"
}
```

````

--------------------------------

### Get Current Markdown View Mode

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MarkdownView/getMode.md

Call this method to determine if the current Markdown view is in preview or source mode. No setup is required.

```typescript
const mode: MarkdownViewModeType = this.app.workspace.getActiveViewOfType(MarkdownView).getMode();
````

---

### Folder Control Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

Defines a setting control for selecting an output folder. It includes an option to include the root directory.

```typescript
{
  name: 'Output folder',
  control: { type: 'folder', key: 'outputDir', includeRoot: true },
}
```

---

### Navigate to Plugin Folder

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Build a plugin.md

Navigate into the cloned sample plugin directory to begin the build process.

```bash
cd obsidian-sample-plugin
```

---

### Pos.start

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Pos/start.md

Represents the starting location of a position. This property is of type Loc.

````APIDOC
## Pos.start property

Starting location.

### Signature:

```typescript
start: Loc;
````

````

--------------------------------

### Get Markdown Content

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MarkdownSubView/get.md

Call the `get()` method on a `MarkdownSubView` instance to retrieve its Markdown content.

```typescript
get(): string;
````

---

### Formulas Configuration Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/BasesConfigFile.md

Defines the structure for configuring formulas within a Base. The key is the formula property name, and the value is the formula string.

```typescript
Record<string, string>;
```

---

### FileSystemAdapter.getName()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter/getName.md

Gets the name of the file system adapter.

````APIDOC
## FileSystemAdapter.getName()

### Description
Gets the name of the file system adapter.

### Method
```typescript
getName(): string;
````

### Returns

`string` - The name of the file system adapter.

````

--------------------------------

### TypeScript - Get File By Path

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault/getFileByPath.md

Use this method to get a file object from the vault by its path. Returns null if the file does not exist.

```typescript
getFileByPath(path: string): TFile | null;
````

---

### Get Markdown Editor Content

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MarkdownEditView/get.md

Call the get() method on a MarkdownEditView instance to retrieve its current content as a string.

```typescript
const content: string = this.markdownEditView.get();
```

---

### EditorSuggestTriggerInfo.start

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/EditorSuggestTriggerInfo/start.md

The start position of the triggering text. This is used to position the popover.

````APIDOC
## EditorSuggestTriggerInfo.start property

The start position of the triggering text. This is used to position the popover.

### Signature

```typescript
start: EditorPosition;
````

````

--------------------------------

### Get File/Folder Metadata

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter/stat.md

Use this method to get metadata for a file or folder. Ensure the path is normalized using normalizePath() before calling.

```typescript
const stat = await app.vault.adapter.stat(app.vault.normalizePath("my-folder/my-file.md"));
if (stat === null) {
    // File does not exist
} else {
    // File exists, stat contains metadata
    console.log(stat.size, stat.mtime);
}
````

---

### Setting Editor Instructions

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/EditorSuggest/setInstructions.md

Use this method to provide custom instructions to the editor suggest widget. The instructions are displayed to the user to guide them on how to use the suggestions.

```typescript
setInstructions(instructions: Instruction[]): void;
```

---

### Example Setting Tab Class

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

Define a custom setting tab by extending PluginSettingTab and overriding getSettingDefinitions() to declaratively describe settings.

```typescript
import ExamplePlugin from "./main";
import { App, PluginSettingTab } from "obsidian";

export class ExampleSettingTab extends PluginSettingTab {
  plugin: ExamplePlugin;

  constructor(app: App, plugin: ExamplePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions() {
    return [
      {
        name: "Default value",
        control: {
          type: "text",
          key: "sampleValue",
          placeholder: "Lorem ipsum",
        },
      },
    ];
  }
}
```

---

### Create a Directory with DataAdapter.mkdir()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter/mkdir.md

Use this method to create a new folder. Ensure the path is normalized using `normalizePath()` before passing it to `mkdir()`.

```typescript
await this.app.vault.adapter.mkdir(normalizedPath);
```

---

### Plugin.onload()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Plugin/onload.md

The onload() method is called when the plugin is loaded. It's used for initialization and setup. It can be asynchronous, returning a Promise<void>, or synchronous, returning void.

````APIDOC
## Plugin.onload()

### Description

This method is a lifecycle hook that plugins can implement to perform initialization tasks when the plugin is loaded by Obsidian. It can be asynchronous, returning a Promise<void>, or synchronous, returning void.

### Signature

```typescript
onload(): Promise<void> | void;
````

### Returns

`Promise<void> | void` - A promise that resolves when the asynchronous operations are complete, or void if the operation is synchronous.

````

--------------------------------

### Handle Vault Create Events After Layout Ready (Option A)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Guides/Optimize plugin load time.md

This example shows how to check if the Obsidian workspace layout is ready before processing a 'create' event on the vault. This prevents unnecessary processing during app startup.

```typescript
class MyPlugin extends Plugin {
    onload(app: App) {
	super(app);
        this.registerEvent(this.app.vault.on('create', this.onCreate, this));
    }

	onCreate() {
	    if (!this.app.workspace.layoutReady) {
	      // Workspace is still loading, do nothing
	      return;
	    }
		// ...
	}
}
````

---

### SuggestModal.setInstructions()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/SuggestModal/setInstructions.md

Sets the instructions for the SuggestModal. This method takes an array of Instruction objects.

````APIDOC
## SuggestModal.setInstructions()

### Description

Sets the instructions for the SuggestModal. This method takes an array of Instruction objects.

### Method

```typescript
setInstructions(instructions: Instruction[]): void;
````

### Parameters

#### Parameters

- **instructions** (Instruction[]) - Description:

````

--------------------------------

### Vault.getFiles

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault.md

Gets all files in the vault.

```APIDOC
## Vault.getFiles

### Description
Get all files in the vault.

### Method
getFiles
````

---

### on (quick-preview)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace.md

Listens for the 'quick-preview' event, which is triggered when the active Markdown file is modified. Allows reacting to file changes before they are saved.

````APIDOC
## on(name: 'quick-preview', callback, ctx)

### Description
Triggered when the active Markdown file is modified. React to file changes before they are saved to disk.

### Method
(Not specified, likely internal or requires specific context)

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
* **name** (string) - Must be 'quick-preview'.
* **callback** (function) - Required - The function to execute when the event is triggered. Receives the file content as an argument.
* **ctx** (object) - Optional - The context for the callback function.

### Request Example
```javascript
workspace.on('quick-preview', (content) => {
  console.log('File content changed:', content);
});
````

### Response

(Not specified)

````

--------------------------------

### Clone sample theme

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Themes/App themes/Build a theme.md

Clone the sample theme from the official Obsidian GitHub repository. This provides a starting point for your theme development.

```bash
git clone https://github.com/obsidianmd/obsidian-sample-theme.git "Sample Theme"
````

---

### Basic List Configuration

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

Demonstrates the basic structure of a 'list' setting, including heading, empty state, add item action, reorder and delete handlers, and item mapping.

```typescript
{
  type: 'list',
  heading: 'Watched folders',
  emptyState: 'No folders being watched yet.',
  addItem: {
    name: 'Add folder',
    action: () => this.openAddFolderModal(),
  },
  onReorder: async (oldIndex, newIndex) => {
    let folders = this.plugin.settings.folders;
    let [moved] = folders.splice(oldIndex, 1);
    folders.splice(newIndex, 0, moved);
    await this.plugin.saveData(this.plugin.settings);
  },
  onDelete: async (idx) => {
    this.plugin.settings.folders.splice(idx, 1);
    await this.plugin.saveData(this.plugin.settings);
    this.update();
  },
  items: this.plugin.settings.folders.map((path) => ({
    name: path,
    searchable: false,
  })),
}
```

---

### DataAdapter.mkdir

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter.md

Create a directory.

```APIDOC
## DataAdapter.mkdir

### Description
Create a directory.

### Method
Not specified (likely a method call in a TypeScript SDK)

### Parameters
#### Path Parameters
- **normalizedPath** (string) - Required - The normalized path for the new directory.
```

---

### FileSystemAdapter.getFullPath

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter/getFullPath.md

Get the full path of a file.

````APIDOC
## FileSystemAdapter.getFullPath()

### Description
Get the full path of a file.

### Method
TypeScript

### Signature
```typescript
getFullPath(normalizedPath: string): string;
````

### Parameters

#### Path Parameters

- **normalizedPath** (string) - Required - The normalized path of the file.

### Returns

`string` - The full path of the file.

````

--------------------------------

### View.onOpen()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/View/onOpen.md

The `onOpen()` method is a protected lifecycle method for `View` objects. It is called when the view is opened and can be overridden to perform setup tasks. It returns a Promise that resolves when the opening process is complete.

```APIDOC
## View.onOpen()

### Description

The `onOpen()` method is a protected lifecycle method for `View` objects. It is called when the view is opened and can be overridden to perform setup tasks. It returns a Promise that resolves when the opening process is complete.

### Method

```typescript
protected onOpen(): Promise<void>;
````

### Returns

`Promise<void>` - A promise that resolves when the view has been successfully opened.

````

--------------------------------

### Vault.getAllLoadedFiles

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault.md

Gets all files and folders in the vault.

```APIDOC
## Vault.getAllLoadedFiles

### Description
Get all files and folders in the vault.

### Method
getAllLoadedFiles
````

---

### Get Active Markdown View

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace/getActiveViewOfType.md

Use `getActiveViewOfType` with `MarkdownView` to get the currently active Markdown editor. Returns `null` if no Markdown view is active.

```typescript
const markdownView = app.workspace.getActiveViewOfType(MarkdownView);
if (markdownView) {
  // Do something with the markdown view
  console.log(markdownView.file.path);
}
```

---

### Opening a Modal with Input Callback

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Modals.md

Shows how to instantiate and open the input modal, providing a callback function to handle the submitted result. A `Notice` is displayed with the result.

```typescript
new ExampleModal(this.app, (result) => {
  new Notice(`Hello, ${result}!`);
}).open();
```

---

### Get File or Directory Stats

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter/stat.md

Use FileSystemAdapter.stat() to get metadata for a given path. This method returns a Promise that resolves to a Stat object or null if the path is not found.

```typescript
const stat = await app.vault.adapter.stat("your/file/path.md");
if (stat === null) {
  console.log("File not found.");
} else {
  console.log("File size:", stat.size);
  console.log("Last modified:", new Date(stat.mtime));
}
```

---

### Emoji List State Field Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Editor/Decorations.md

An example of a state field that creates decorations for list items, replacing the list marker with an emoji widget. This is useful for visually enhancing list structures.

```typescript
import { syntaxTree } from "@codemirror/language";
import {
  Extension,
  RangeSetBuilder,
  StateField,
  Transaction,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { EmojiWidget } from "emoji";

export const emojiListField = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

    syntaxTree(transaction.state).iterate({
      enter(node) {
        if (node.type.name.startsWith("list")) {
          // Position of the '-' or the '*'.
          const listCharFrom = node.from - 2;

          builder.add(
            listCharFrom,
            listCharFrom + 1,
            Decoration.replace({
              widget: new EmojiWidget(),
            }),
          );
        }
      },
    });

    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});
```

---

### Vault.getAllFolders

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault.md

Gets all folders in the vault.

```APIDOC
## Vault.getAllFolders

### Description
Get all folders in the vault.

### Method
getAllFolders

### Parameters
#### Path Parameters
- **includeRoot** (boolean) - Optional - Whether to include the root folder.
```

---

### Get Display Text of a Workspace Leaf

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/WorkspaceLeaf/getDisplayText.md

This snippet demonstrates how to get the display text of a workspace leaf. This method returns the string that is displayed in the UI for the leaf.

```typescript
const leafDisplayText: string = leaf.getDisplayText();
```

---

### CapacitorAdapter.mkdir()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/CapacitorAdapter/mkdir.md

Creates a directory at the specified normalized path.

````APIDOC
## CapacitorAdapter.mkdir()

### Description
Creates a directory at the specified normalized path.

### Method
```typescript
mkdir(normalizedPath: string): Promise<void>;
````

### Parameters

#### Path Parameters

- **normalizedPath** (string) - Description: The normalized path of the directory to create.

### Returns

`Promise<void>`

````

--------------------------------

### getState

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileView.md

Gets the current state of the file view.

```APIDOC
## getState()

### Description
Gets the current state of the file view.
````

---

### Get Active File in TypeScript

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace/getActiveFile.md

This snippet demonstrates how to get the active file using the Workspace API. It returns a TFile object or null if no file is active.

```typescript
const activeFile = app.workspace.getActiveFile();
if (activeFile) {
  console.log("Active file: ", activeFile.name);
} else {
  console.log("No active file.");
}
```

---

### onUserEnable

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Plugin.md

Called when the user explicitly enables the plugin. Safe for initial setup and user interaction.

```APIDOC
## onUserEnable

### Description
Perform any initial setup code. The user has explicitly interacted with the plugin so its safe to engage with the user. If your plugin registers a custom view, you can open it here.

### Method
`onUserEnable()`

### Version
1.7.2
```

---

### Vault.getMarkdownFiles

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault.md

Gets all Markdown files in the vault.

```APIDOC
## Vault.getMarkdownFiles

### Description
Get all Markdown files in the vault.

### Method
getMarkdownFiles
```

---

### Get Markdown View Data

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MarkdownView/getViewData.md

Call `getViewData()` on a `MarkdownView` instance to get the raw markdown string. Ensure you have a valid `MarkdownView` object before calling this method.

```typescript
const viewData: string = this.app.workspace
  .getActiveViewOfType(MarkdownView)
  .getViewData();
```

---

### Create Directory (Instance Method)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter.md

Creates a directory at the specified normalized path.

```typescript
mkdir(normalizedPath: string): Promise<void>
```

---

### SuggestModal Method: setInstructions

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/SuggestModal.md

Sets the instructions displayed to the user within the suggestion modal. This can be used to guide the user on how to interact with the suggestions.

```typescript
setInstructions(instructions: string): void
```

---

### Get Editor Client Width

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/EditorScrollInfo/clientWidth.md

Access the clientWidth property to get the current width of the editor's content area. This value is a number representing pixels.

```typescript
let width: number = this.editor.getScrollInfo().clientWidth;
```

---

### on(name: 'file-menu', callback, ctx)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace.md

Triggered when the user opens the context menu on a file.

```APIDOC
## on(name: 'file-menu', callback, ctx)

### Description
Triggered when the user opens the context menu on a file.

### Method
`on`

### Parameters
- **name**: string - The name of the event ('file-menu').
- **callback**: Function - The function to call when the event is triggered.
- **ctx**: any - The context for the callback function.
```

---

### Imperative Settings Tab Implementation

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Guides/Migrate to declarative settings.md

This is the starting point: an existing settings tab using the imperative `display()` method with toggle, dropdown, and validated text input controls.

```typescript
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface MySettings {
  enabled: boolean;
  mode: "fast" | "thorough";
  cacheKey: string;
}

class MySettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable feature")
      .setDesc("Turns the feature on or off.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveData(this.plugin.settings);
          }),
      );

    new Setting(containerEl).setName("Mode").addDropdown((dropdown) =>
      dropdown
        .addOption("fast", "Fast")
        .addOption("thorough", "Thorough")
        .setValue(this.plugin.settings.mode ?? "fast")
        .onChange(async (value) => {
          this.plugin.settings.mode = value as "fast" | "thorough";
          await this.plugin.saveData(this.plugin.settings);
        }),
    );

    new Setting(containerEl)
      .setName("Cache key")
      .setDesc("Alphanumeric only.")
      .addText((text) =>
        text.setValue(this.plugin.settings.cacheKey).onChange(async (value) => {
          let trimmed = value.trim();
          if (!/^[a-z0-9]*$/i.test(trimmed)) return;
          this.plugin.settings.cacheKey = trimmed;
          await this.plugin.saveData(this.plugin.settings);
        }),
      );
  }
}
```

---

### Get the last line index

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Editor/lastLine.md

Use this method to get the index of the last line in the editor. This is useful for operations that need to know the total number of lines.

```typescript
editor.lastLine();
```

---

### Install Svelte Dependencies

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Use Svelte in your plugin.md

Add Svelte and related build tools to your plugin's development dependencies.

```bash
npm install --save-dev svelte svelte-preprocess esbuild-svelte svelte-check
```

---

### Get Editor Scroll Information

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Editor/getScrollInfo.md

Call this method to get the current scroll position. It returns an object with 'top' and 'left' properties representing the scroll offsets.

```typescript
let scrollInfo = editor.getScrollInfo();
console.log(scrollInfo.top, scrollInfo.left);
```

---

### Opening a Basic Modal

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Modals.md

Demonstrates how to open a previously defined modal from a plugin command. Ensure the modal class is imported.

```typescript
import { Plugin } from "obsidian";
import { ExampleModal } from "./modal";

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "display-modal",
      name: "Display modal",
      callback: () => {
        new ExampleModal(this.app).open();
      },
    });
  }
}
```

---

### WorkspaceWindowInitData

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/index.md

Initialization data for a new workspace window.

```APIDOC
## Interface: WorkspaceWindowInitData

### Description
Contains initialization data required when opening a new workspace window or tab in Obsidian. This can include information about which files to open and their initial states.

### Fields
- **files** (Array<string>) - An array of file paths to open in the new window.
- **focus** (boolean) - Whether the new window should receive focus.
- **split** (string) - Optional. Specifies how the new window should be split (e.g., 'vertical', 'horizontal').
```

---

### Clone Sample Plugin

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Build a plugin.md

Clone the sample plugin from its GitHub repository into the .obsidian/plugins directory.

```bash
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git
```

---

### Get Active Editor

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Releasing/Plugin guidelines.md

Access the editor of the active note using `activeEditor?.editor`. This provides a safe way to get the editor instance, returning null if no active editor is available.

```typescript
const editor = this.app.workspace.activeEditor?.editor;

if (editor) {
  // ...
}
```

---

### DataAdapter.getName

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter.md

Get the name of the data adapter.

```APIDOC
## DataAdapter.getName

### Description
Get the name of the data adapter.

### Method
Not specified (likely a method call in a TypeScript SDK)

### Returns
- **string** - The name of the data adapter.
```

---

### Setting Menu Width

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MenuPositionDef/width.md

Example of how to set the width of a menu using the MenuPositionDef.width property. This is useful for ensuring consistent menu sizing.

```typescript
width?: number;
```

---

### Vault.getRoot()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault/getRoot.md

Get the root folder of the current vault.

````APIDOC
## Vault.getRoot()

### Description
Get the root folder of the current vault.

### Signature
```typescript
getRoot(): TFolder;
````

### Returns

[`TFolder`](TFolder)

````

--------------------------------

### Editor.lineCount()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Editor/lineCount.md

Gets the number of lines in the document.

```APIDOC
## Editor.lineCount()

### Description
Gets the number of lines in the document.

### Signature
```typescript
abstract lineCount(): number;
````

### Returns

`number` - The number of lines in the document.

````

--------------------------------

### FileSystemAdapter.mkdir()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter/mkdir.md

Creates a directory at the specified path.

```APIDOC
## FileSystemAdapter.mkdir()

### Description
Creates a directory at the specified path.

### Method
static

### Signature
```typescript
static mkdir(path: string): Promise<void>;
````

### Parameters

#### Path Parameters

- **path** (string) - Required - The path where the directory should be created.

### Returns

`Promise<void>`

````

--------------------------------

### Vault.getName

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault.md

Gets the name of the vault.

```APIDOC
## Vault.getName

### Description
Gets the name of the vault.

### Method
getName
````

---

### Vault.getRoot

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault.md

Gets the root folder of the current vault.

```APIDOC
## Vault.getRoot

### Description
Get the root folder of the current vault.

### Method
getRoot
```

---

### TypeScript - Setting View State

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/WorkspaceLeaf/setViewState.md

Example of how to set the view state for a WorkspaceLeaf. This requires obtaining a reference to the leaf first.

```typescript
leaf.setViewState({
  type: "markdown",
  state: {
    file: "path/to/your/file.md",
  },
});
```

---

### Iterate Through Workspace Leaves

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Workspace.md

This example demonstrates how to iterate through all leaves in the workspace and log their view types. It's useful for inspecting the current state of the workspace.

```ts
import { Plugin } from "obsidian";

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addRibbonIcon("dice", "Print leaf types", () => {
      this.app.workspace.iterateAllLeaves((leaf) => {
        console.log(leaf.getViewState().type);
      });
    });
  }
}
```

---

### Funding URL - Single URL

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/Manifest.md

Example of a single URL for the fundingUrl property.

```json
{
  "fundingUrl": "https://buymeacoffee.com"
}
```

---

### Create a Directory

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/CapacitorAdapter/mkdir.md

Use CapacitorAdapter.mkdir() to create a new directory. This method takes a normalized path as a string and returns a Promise that resolves when the directory is successfully created.

```typescript
await capacitorAdapter.mkdir("my/new/directory");
```

---

### MarkdownSubView.get()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MarkdownSubView/get.md

The `get()` method returns the Markdown content as a string.

````APIDOC
## MarkdownSubView.get()

### Description
Retrieves the Markdown content of a MarkdownSubView as a string.

### Signature
```typescript
get(): string;
````

### Returns

`string` - The Markdown content.

````

--------------------------------

### EditorRange.from

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/EditorRange/from.md

The `from` property of an `EditorRange` object indicates the starting `EditorPosition` of the range.

```APIDOC
## EditorRange.from property

### Description

The `from` property of an `EditorRange` object indicates the starting `EditorPosition` of the range.

### Signature

```typescript
from: EditorPosition;
````

````

--------------------------------

### Handle Vault Create Events After Layout Ready (Option B)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Guides/Optimize plugin load time.md

This example demonstrates registering a vault 'create' event handler only after the Obsidian workspace layout is ready. This ensures the event handler is not called during initial app loading.

```typescript
class MyPlugin extends Plugin {
    onload(app: App) {
	super(app);
	    this.app.workspace.onLayoutReady(() => {
	        this.registerEvent(this.app.vault.on('create', this.onCreate, this));
	    });
    }

	onCreate() {
		// ...
	}
}
````

---

### BasesOption.key Signature

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/BasesOption/key.md

The BasesOption.key property is a string. It is available starting from version 1.10.0.

```typescript
key: string;
```

---

### Funding URL - Multiple URLs

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/Manifest.md

Example of multiple URLs for the fundingUrl property, allowing users to choose their preferred support method.

```json
{
  "fundingUrl": {
    "Buy Me a Coffee": "https://buymeacoffee.com",
    "GitHub Sponsor": "https://github.com/sponsors",
    "Patreon": "https://www.patreon.com/"
  }
}
```

---

### getDisplayText

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileView.md

Gets the display text for the file view.

```APIDOC
## getDisplayText()

### Description
Gets the display text for the file view.
```

---

### Text Input Control Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

Use a 'text' control type for string settings. An optional 'placeholder' can be provided.

```typescript
{ name: 'Folder name', control: { type: 'text', key: 'folder', placeholder: '/' } }
```

---

### on(name: 'window-open', callback, ctx)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace.md

Triggered when a new popout window is created.

```APIDOC
## on(name: 'window-open', callback, ctx)

### Description
Triggered when a new popout window is created.

### Method
`on`

### Parameters
- **name**: string - The name of the event ('window-open').
- **callback**: Function - The function to call when the event is triggered.
- **ctx**: any - The context for the callback function.
```

---

### AbstractInputSuggest.getValue()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/AbstractInputSuggest/getValue.md

Gets the value from the input element.

```APIDOC
## AbstractInputSuggest.getValue()

### Description

Gets the value from the input element.

### Method

`getValue(): string;`

### Returns

`string` - The current value of the input element.
```

---

### MarkdownEditView.get()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/MarkdownEditView/get.md

The `get()` method returns the current markdown content as a string.

````APIDOC
## MarkdownEditView.get()

### Description
Retrieves the current markdown content of the editor view.

### Signature
```typescript
get(): string;
````

### Returns

`string` - The current markdown content.

````

--------------------------------

### Color Picker Control Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

Defines a setting control for selecting an accent color.

```typescript
{ name: 'Accent color', control: { type: 'color', key: 'accent' } }
````

---

### DataAdapter.trashSystem

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter.md

Try moving to system trash.

```APIDOC
## DataAdapter.trashSystem

### Description
Try moving to system trash.

### Method
Not specified (likely a method call in a TypeScript SDK)

### Parameters
#### Path Parameters
- **normalizedPath** (string) - Required - The normalized path to the file or folder to move to system trash.
```

---

### getLastOpenFiles

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace.md

Gets the filenames of the 10 most recently opened files.

````APIDOC
## getLastOpenFiles()

### Description
Get the filenames of the 10 most recently opened files.

### Method
(Not specified, likely internal or requires specific context)

### Parameters
None

### Request Example
```json
{}
````

### Response

- **files** (Array<string>) - An array of filenames of the last 10 opened files.

````

--------------------------------

### Add React type definitions

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Use React in your plugin.md

Install type definitions for React and ReactDOM as development dependencies. This improves type checking and autocompletion.

```bash
npm install --save-dev @types/react @types/react-dom
````

---

### Declarative Settings UI (Path A)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Guides/Migrate to declarative settings.md

Implement settings using `getSettingDefinitions()` for Obsidian 1.13.0+. This approach simplifies settings management by allowing Obsidian to handle rendering and data binding.

```typescript
import { App, PluginSettingTab } from "obsidian";

interface MySettings {
  enabled: boolean;
  mode: "fast" | "thorough";
  cacheKey: string;
}

class MySettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions() {
    return [
      {
        name: "Enable feature",
        desc: "Turns the feature on or off.",
        control: { type: "toggle", key: "enabled" },
      },
      {
        name: "Mode",
        control: {
          type: "dropdown",
          key: "mode",
          defaultValue: "fast",
          options: { fast: "Fast", thorough: "Thorough" },
        },
      },
      {
        name: "Cache key",
        desc: "Alphanumeric only.",
        control: {
          type: "text",
          key: "cacheKey",
          placeholder: "default",
          validate: (value: string) =>
            /^[a-z0-9]*$/i.test(value.trim())
              ? undefined
              : "Use letters and digits only.",
        },
      },
    ];
  }
}
```

---

### getSecret

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/SecretStorage.md

Gets a secret from storage using its ID.

````APIDOC
## getSecret(id)

### Description
Gets a secret from storage.

### Method Signature
```typescript
getSecret(id: string): Promise<string | undefined>
````

### Parameters

#### Path Parameters

- **id** (string) - Required - The ID of the secret to retrieve.

````

--------------------------------

### Workspace.on('quick-preview')

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace/on('quick-preview').md

Listens for changes to the active Markdown file before they are saved to disk. This is useful for real-time processing of file content.

```APIDOC
## Workspace.on('quick-preview')

### Description
Triggered when the active Markdown file is modified. React to file changes before they are saved to disk.

### Method Signature
```typescript
on(name: 'quick-preview', callback: (file: TFile, data: string) => any, ctx?: any): EventRef;
````

### Parameters

#### Event Name

- **name** ('quick-preview') - The name of the event to listen for.

#### Callback Function

- **callback** ((file: TFile, data: string) => any) - A function that will be called when the 'quick-preview' event is triggered. It receives the modified `TFile` object and the file's current content as a string.

#### Context (Optional)

- **ctx** (any) - An optional context object that can be passed to the callback.

### Returns

- **EventRef** - An event reference that can be used to unsubscribe from the event.

````

--------------------------------

### Dropdown Control Example

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

Use a 'dropdown' control type for settings with predefined options. 'options' maps display values to stored values.

```typescript
{ name: 'Default mode', control: { type: 'dropdown', key: 'mode', defaultValue: 'edit', options: { edit: 'Editing', read: 'Reading' } } }
````

---

### on (files-menu)

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace.md

Listens for the 'files-menu' event, triggered when the user opens the context menu with multiple files selected in the File Explorer.

````APIDOC
## on(name: 'files-menu', callback, ctx)

### Description
Triggered when the user opens the context menu with multiple files selected in the File Explorer.

### Method
(Not specified, likely internal or requires specific context)

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
* **name** (string) - Must be 'files-menu'.
* **callback** (function) - Required - The function to execute when the event is triggered. Receives the menu and an array of files as arguments.
* **ctx** (object) - Optional - The context for the callback function.

### Request Example
```javascript
workspace.on('files-menu', (menu, files) => {
  menu.addItem(item => {
    item.setTitle('Custom Action')
      .setIcon('star')
      .onClick(() => console.log('Custom action for files:', files));
  });
});
````

### Response

(Not specified)

````

--------------------------------

### prepareSimpleSearch()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/prepareSimpleSearch.md

Constructs a simple search callback that runs on a target string. It takes a query string and returns a function that accepts text and returns a SearchResult or null.

```APIDOC
## prepareSimpleSearch()

### Description
Constructs a simple search callback that runs on a target string.

### Signature
```typescript
export function prepareSimpleSearch(query: string): (text: string) => SearchResult | null;
````

### Parameters

#### Query Parameters

- **query** (string) - Required - the space-separated words

### Returns

- `(text: string) => SearchResult | null` - A callback function that takes a string and returns a SearchResult or null.

````

--------------------------------

### TextFileView.getViewData()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/TextFileView/getViewData.md

Gets the data from the editor. This will be called to save the editor contents to the file.

```APIDOC
## TextFileView.getViewData()

### Description
Gets the data from the editor. This will be called to save the editor contents to the file.

### Method
```typescript
abstract getViewData(): string;
````

### Returns

`string` - The current content of the editor.

````

--------------------------------

### Import Moment.js in Obsidian

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Events.md

Obsidian includes Moment.js internally, so you can import it directly from the Obsidian API without needing to install it separately.

```typescript
import { moment } from 'obsidian';
````

---

### ColorComponent.getValueRgb()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/ColorComponent/getValueRgb.md

Gets the RGB value of the color component.

````APIDOC
## ColorComponent.getValueRgb()

### Description
Gets the RGB value of the color component.

### Method
```typescript
getValueRgb(): RGB;
````

### Returns

[`RGB`](RGB)

````

--------------------------------

### Basic Plugin Structure with Settings

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/User interface/Settings.md

This snippet shows the fundamental structure of an Obsidian plugin, including loading and saving settings and adding a settings tab. It demonstrates how to initialize settings and integrate with Obsidian's plugin lifecycle.

```typescript
import {
  Plugin
} from 'obsidian';
import { ExampleSettingTab } from './settings';

interface ExamplePluginSettings {
  sampleValue: string;
}

const DEFAULT_SETTINGS: Partial<ExamplePluginSettings> = {
  sampleValue: 'Lorem ipsum',
};

export default class ExamplePlugin extends Plugin {
  settings: ExamplePluginSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new ExampleSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
````

---

### Add an Extra Button to a Setting

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Setting/addExtraButton.md

This example demonstrates how to add an extra button to a setting item. The callback function receives an `ExtraButtonComponent` which can be configured.

```typescript
new Setting(containerEl)
  .setName("My Setting")
  .setDesc("A setting with an extra button")
  .addExtraButton((button) => {
    button
      .setIcon("checkmark")
      .setTooltip("Click me!")
      .onClick(() => {
        console.log("Button clicked!");
      });
  });
```

---

### EditorRangeOrCaret.from

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/EditorRangeOrCaret/from.md

Represents the starting position of a range or caret.

````APIDOC
## EditorRangeOrCaret.from

### Description
Represents the starting position of a range or caret.

### Signature
```typescript
from: EditorPosition;
````

````

--------------------------------

### Create Directory

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter.md

Creates a directory at the specified path. This is a static method.

```typescript
static mkdir(path: string): Promise<void>
````

---

### getActiveViewOfType

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Workspace.md

Gets the currently active view of a specified type.

````APIDOC
## getActiveViewOfType(type)

### Description
Get the currently active view of a given type.

### Method
(Not specified, likely internal or requires specific context)

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
* **type** (string) - Required - The type of the view to retrieve.

### Request Example
```json
{
  "type": "markdown"
}
````

### Response

- **view** (View | null) - The active view of the specified type, or null if none is active.

````

--------------------------------

### Setting a Tooltip for a Button

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/ButtonComponent/setTooltip.md

This example demonstrates how to set a simple tooltip for a button using the setTooltip method. The method returns the button component itself, allowing for method chaining.

```typescript
button.setTooltip("This is a tooltip");
````

---

### Add Ribbon Icon and Notice

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Plugins/Getting started/Build a plugin.md

Implement the `onload()` method to add a ribbon icon. This icon, when clicked, will display a 'Hello, world!' notice to the user. The first argument is the icon name, the second is the tooltip, and the third is the click handler.

```typescript
this.addRibbonIcon("dice", "Greet", () => {
  new Notice("Hello, world!");
});
```

---

### Get Resource Path

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter.md

Retrieves the resource path for a given normalized path.

```typescript
getResourcePath(normalizedPath: string): string
```

---

### TypeScript - RequestUrlParam.contentType

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/RequestUrlParam/contentType.md

Example of setting the contentType property for a request URL parameter.

```typescript
contentType?: string;
```

---

### PluginSettingTab Constructor

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/PluginSettingTab/(constructor).md

Constructs a new instance of the PluginSettingTab class. It requires an App instance and a Plugin instance.

````APIDOC
## PluginSettingTab.(constructor)

### Description
Constructs a new instance of the `PluginSettingTab` class.

### Signature
```typescript
constructor(app: App, plugin: Plugin);
````

### Parameters

#### Path Parameters

- **app** (App) - Description:
- **plugin** (Plugin) - Description:

````

--------------------------------

### getIcon

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileView.md

Gets the icon for the view. This method is inherited from View.

```APIDOC
## getIcon()

### Description
Gets the icon for the view.

### Method
(Inherited from View)
````

---

### DataAdapter.getResourcePath

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter.md

Returns a URI for the browser engine to use, for example to embed an image.

```APIDOC
## DataAdapter.getResourcePath

### Description
Returns a URI for the browser engine to use, for example to embed an image.

### Method
Not specified (likely a method call in a TypeScript SDK)

### Parameters
#### Path Parameters
- **normalizedPath** (string) - Required - The normalized path to the resource.
```

---

### createFileForView Method

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/BasesView.md

Displays the new note menu for a file with a provided filename and an optional function to modify frontmatter.

```typescript
createFileForView(baseFileName: string, frontmatterProcessor?: (fm: Record<string, any>) => any): Promise<void>
```

---

### ListValue Get Method

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/ListValue.md

Retrieves a Value from the ListValue at the specified index.

```typescript
get(index: number): Value
```

---

### Get File System Adapter Name

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter.md

Retrieves the name of the file system adapter.

```typescript
getName(): string
```

---

### BasesView.createFileForView

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/BasesView/createFileForView.md

Displays the new note menu for a file with the provided filename and optionally a function to modify the frontmatter.

````APIDOC
## BasesView.createFileForView()

### Description
Display the new note menu for a file with the provided filename and optionally a function to modify the frontmatter.

### Method
TypeScript

### Signature
```typescript
createFileForView(baseFileName?: string, frontmatterProcessor?: (frontmatter: any) => void): Promise<void>;
````

### Parameters

#### Path Parameters

- **baseFileName** (string) - Optional -
- **frontmatterProcessor** ( (frontmatter: any) => void ) - Optional -

### Returns

`Promise<void>`

````

--------------------------------

### getEphemeralState

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileView.md

Gets the ephemeral state of the view. This method is inherited from View.

```APIDOC
## getEphemeralState()

### Description
Gets the ephemeral state of the view.

### Method
(Inherited from View)
````

---

### Create a Directory

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/FileSystemAdapter/mkdir.md

Use this method to create a new directory. It returns a Promise that resolves when the operation is complete.

```typescript
await FileSystemAdapter.mkdir("path/to/new/directory");
```

---

### Vault.configDir

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/Vault/configDir.md

Gets the path to the config folder. This value is typically `.obsidian` but it could be different.

```APIDOC
## Vault.configDir

### Description
Gets the path to the config folder. This value is typically `.obsidian` but it could be different.

### Property
`configDir: string`

### Return Value
- **string**: The path to the config folder.
```

---

### DataAdapter.getResourcePath()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/DataAdapter/getResourcePath.md

Returns a URI for the browser engine to use, for example to embed an image.

````APIDOC
## DataAdapter.getResourcePath()

### Description
Returns a URI for the browser engine to use, for example to embed an image.

### Method
TypeScript

### Signature
```typescript
getResourcePath(normalizedPath: string): string;
````

### Parameters

#### Path Parameters

- **normalizedPath** (string) - Required - path to file/folder, use [normalizePath()](normalizePath) to normalize beforehand.

### Returns

`string`

````

--------------------------------

### SettingTab.display()

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/SettingTab/display.md

The `display()` method is an abstract method called when the settings tab should be rendered. It does not take any arguments and returns void.

```APIDOC
## SettingTab.display()

### Description
Called when the settings tab should be rendered.

### Signature
```typescript
abstract display(): void;
````

### Returns

`void`

````

--------------------------------

### WorkspaceWindowInitData Interface

Source: https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Reference/TypeScript API/WorkspaceWindowInitData.md

Defines the structure for initializing a workspace window, allowing for optional size and position parameters.

```APIDOC
## WorkspaceWindowInitData Interface

### Description

This interface represents the data structure used to initialize a workspace window. It allows developers to optionally specify the suggested dimensions (width and height) and the initial coordinates (x and y) for the window.

### Properties

#### Optional Properties

- **size** (`{ width: number; height: number; }`) - Optional - The suggested size of the workspace window, including its width and height.
- **x** (`number`) - Optional - The suggested x-coordinate for the workspace window.
- **y** (`number`) - Optional - The suggested y-coordinate for the workspace window.

### Usage

This interface is used when creating or configuring a workspace window to provide initial layout and sizing information.
````
