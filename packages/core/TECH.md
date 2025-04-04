# doc-editor 核心架构与实现详解

## 目录

1. [ProseMirror 文档模型基础](#1-prosemirror-文档模型基础)
2. [Tiptap 的扩展框架](#2-tiptap-的扩展框架)
3. [doc-editor 核心架构设计](#3-doc-editor-核心架构设计)
4. [块结构设计](#4-块结构设计)
5. [Schema 与类型系统](#5-schema-与类型系统)
6. [扩展功能实现](#6-扩展功能实现)
7. [协作编辑](#7-协作编辑)
8. [导入导出功能](#8-导入导出功能)

## 1. ProseMirror 文档模型基础

ProseMirror 是一个强大的编辑器框架，提供了一套严格的文档模型系统。在深入 doc-editor 之前，我们先了解 ProseMirror 的核心概念。

### 1.1 文档树结构

ProseMirror 将文档表示为一棵树，其中：

```text
文档(Document)
  ├── 节点(Node)
  │   ├── 片段(Fragment，包含子节点)
  │   └── 标记(Mark，应用于节点的格式)
  └── 节点(Node)
      └── ...
```

每个节点都有类型、属性和内容。这种树状结构使得编辑操作可以表达为树的变换。

### 1.2 Schema 模式定义

Schema 是 ProseMirror 的核心概念，它定义了什么样的文档结构是合法的。

```javascript
// ProseMirror Schema 示例
const schema = new Schema({
  nodes: {
    doc: {
      content: "block+"
    },
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{tag: "p"}],
      toDOM() { return ["p", 0] }
    },
    text: {
      group: "inline"
    }
  },
  marks: {
    bold: {
      parseDOM: [{tag: "strong"}],
      toDOM() { return ["strong", 0] }
    }
  }
})
```

Schema 定义了:

- 哪些节点类型是允许的
- 每种节点可以包含哪些内容
- 节点如何转换为 DOM 以及如何从 DOM 解析

### 1.3 状态和事务

ProseMirror 使用不可变的状态对象（State）来表示编辑器的完整状态，包括：

- 文档内容
- 选区信息
- 各种元数据

所有修改都通过创建和应用事务（Transaction）完成：

```javascript
// 应用事务示例
const newState = state.apply(
  state.tr.insertText("Hello, world!")
)
```

这种设计使得编辑操作可以被跟踪、合并或撤销，非常适合构建协作编辑功能。

## 2. Tiptap 的扩展框架

Tiptap 是建立在 ProseMirror 之上的一个更高级的框架，提供了更友好的 API 和丰富的扩展系统。

### 2.1 Tiptap 与 ProseMirror 的关系

Tiptap 主要解决了以下 ProseMirror 的使用痛点：

- 降低了 ProseMirror 的学习曲线
- 提供了模块化的扩展系统
- 简化了常见功能的实现

```javascript
// Tiptap 编辑器创建示例
const editor = new Editor({
  extensions: [
    StarterKit,
    Image,
    Link
  ],
  content: '<p>Hello World!</p>'
})
```

### 2.2 扩展系统

Tiptap 的核心是其扩展系统，扩展可以是：

- 节点扩展（Node Extensions）：定义文档结构的元素
- 标记扩展（Mark Extensions）：可以应用于文本的样式
- 功能扩展（Extensions）：添加编辑器功能但不影响文档模型

```javascript
// Tiptap 扩展示例
const CustomExtension = Extension.create({
  name: 'custom',
  
  addCommands() {
    return {
      customCommand: () => ({ chain }) => {
        return chain()
          .toggleBold()
          .run()
      }
    }
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.editor.commands.customCommand()
    }
  }
})
```

### 2.3 命令系统

Tiptap 提供了丰富的命令系统，用于执行各种编辑操作：

```javascript
// 命令示例
editor.commands.toggleBold()
editor.chain().focus().toggleItalic().run()
```

这些命令最终会被转换为 ProseMirror 的事务，但提供了更好的开发体验。

## 3. doc-editor 核心架构设计

基于 ProseMirror 和 Tiptap，doc-editor 构建了自己的核心架构，专注于块式编辑体验。

### 3.1 EtcDocEditor 类

`EtcDocEditor` 是整个编辑器的核心类，负责协调各个组件：

```typescript
export class EtcDocEditor<
  BSchema extends BlockSchema = DefaultBlockSchema,
  ISchema extends InlineContentSchema = DefaultInlineContentSchema,
  SSchema extends StyleSchema = DefaultStyleSchema,
> {
  // Tiptap 编辑器实例
  public readonly _tiptapEditor: EtcDocTipTapEditor;
  
  // Schema 定义
  public readonly schema: EtcDocSchema<BSchema, ISchema, SSchema>;
  
  // 块实现
  public readonly blockImplementations: BlockSpecs;
  
  // 内联内容实现
  public readonly inlineContentImplementations: InlineContentSpecs;
  
  // 样式实现
  public readonly styleImplementations: StyleSpecs;
  
  // 各种工具栏和菜单
  public readonly formattingToolbar: FormattingToolbarProsemirrorPlugin;
  public readonly linkToolbar: LinkToolbarProsemirrorPlugin;
  public readonly sideMenu: SideMenuProsemirrorPlugin;
  public readonly suggestionMenus: SuggestionMenuProseMirrorPlugin;
  
  // ...各种方法
}
```

泛型参数使得 `EtcDocEditor` 可以根据不同的需求使用不同的块类型、内联内容和样式类型。

### 3.2 三层架构

doc-editor 采用了三层架构：

1. **底层**：ProseMirror 提供文档模型和状态管理
2. **中层**：Tiptap 提供扩展系统和命令
3. **上层**：doc-editor 自定义的块系统和 UI 组件

这样的架构既利用了底层库的能力，又提供了更符合 Notion 风格编辑体验的 API。

### 3.3 数据流

doc-editor 中的数据流大致如下：

```text
用户操作 → 编辑器命令 → Tiptap 命令 → ProseMirror 事务 → 状态更新 → 视图更新
```

所有编辑操作最终都会转化为 ProseMirror 事务，然后应用到状态上，触发视图更新。

## 4. 块结构设计

doc-editor 最重要的创新之一是其块结构设计，这使得它可以实现类似 Notion 的编辑体验。

### 4.1 块的概念模型

在 doc-editor 中，块（Block）是文档的基本构建单位：

```typescript
export type Block<
  BSchema extends BlockSchema = DefaultBlockSchema,
  I extends InlineContentSchema = DefaultInlineContentSchema,
  S extends StyleSchema = DefaultStyleSchema,
> = {
  id: string;                    // 块的唯一标识符
  type: keyof BSchema & string;  // 块的类型
  props: Record<string, any>;    // 块的属性
  content: InlineContent<I, S>[] | TableContent<I, S> | undefined; // 块的内容
  children: Block<BSchema, I, S>[]; // 子块
}
```

块可以是段落、标题、列表项、代码块、图片等多种类型。

### 4.2 块的实现方式

我们看一个具体的块实现，以段落块为例：

```typescript
// packages/core/src/blocks/ParagraphBlockContent/ParagraphBlockContent.ts
export const ParagraphBlockContent = createStronglyTypedTiptapNode({
  name: 'paragraph',
  content: 'inline*',
  group: 'blockContent',

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => {
        // 实现段落快捷键
        // ...
      },
    }
  },

  parseHTML() {
    return [
      { tag: `div[data-content-type=${this.name}]` },
      {
        tag: 'p',
        priority: 200,
        // ...
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return createDefaultBlockDOMOutputSpec(
      this.name,
      'p',
      {
        ...(this.options.domAttributes?.blockContent || {}),
        ...HTMLAttributes,
      },
      this.options.domAttributes?.inlineContent || {},
    )
  },
})
```

每个块都实现了：

- 数据模型定义
- HTML 解析规则
- HTML 渲染规则
- 快捷键处理

### 4.3 块的转换机制

doc-editor 实现了块与 ProseMirror 节点之间的相互转换：

```typescript
// 将 Block 转换为 ProseMirror Node
export function blockToNode(
  block: PartialBlock<any, any, any>,
  schema: Schema,
  styleSchema: StyleSchema,
) {
  // 1. 生成唯一 ID
  let id = block.id || UniqueID.options.generateID();
  
  // 2. 转换内容节点
  const contentNode = blockOrInlineContentToContentNode(block, schema, styleSchema);
  
  // 3. 处理子块
  const children: Node[] = [];
  if (block.children) {
    for (const child of block.children) {
      children.push(blockToNode(child, schema, styleSchema));
    }
  }
  
  // 4. 创建块组和块容器
  const groupNode = schema.nodes['blockGroup'].create({}, children);
  return schema.nodes['blockContainer'].create({ id, ...block.props }, [contentNode, groupNode]);
}

// 将 ProseMirror Node 转换为 Block
export function nodeToBlock(node, blockSchema, inlineSchema, styleSchema, blockCache) {
  // 实现逻辑...
}
```

这种转换机制使得 doc-editor 可以在高层次上操作块，而底层仍然利用 ProseMirror 的强大功能。

## 5. Schema 与类型系统

doc-editor 使用 TypeScript 构建了一套强大的类型系统，确保编辑器的类型安全。

### 5.1 Schema 设计

`EtcDocSchema` 类定义了编辑器支持的块、内联内容和样式：

```typescript
export class EtcDocSchema<
  BSchema extends BlockSchema,
  ISchema extends InlineContentSchema,
  SSchema extends StyleSchema,
> {
  public readonly blockSpecs: BlockSpecs;
  public readonly inlineContentSpecs: InlineContentSpecs;
  public readonly styleSpecs: StyleSpecs;

  public readonly blockSchema: BSchema;
  public readonly inlineContentSchema: ISchema;
  public readonly styleSchema: SSchema;

  // 创建 schema 的静态方法
  public static create<
    BSpecs extends BlockSpecs = typeof defaultBlockSpecs,
    ISpecs extends InlineContentSpecs = typeof defaultInlineContentSpecs,
    SSpecs extends StyleSpecs = typeof defaultStyleSpecs,
  >(options?: {
    blockSpecs?: BSpecs;
    inlineContentSpecs?: ISpecs;
    styleSpecs?: SSpecs;
  }) {
    return new EtcDocSchema<
      BlockSchemaFromSpecs<BSpecs>,
      InlineContentSchemaFromSpecs<ISpecs>,
      StyleSchemaFromSpecs<SSpecs>
    >(options);
  }
}
```

### 5.2 类型安全的 API

doc-editor 大量使用 TypeScript 泛型和类型推导，提供类型安全的 API：

```typescript
// 类型安全的块插入
export function insertBlocks<
  BSchema extends BlockSchema,
  I extends InlineContentSchema,
  S extends StyleSchema,
>(
  editor: EtcDocEditor<BSchema, I, S>,
  blocksToInsert: PartialBlock<BSchema, I, S>[],
  referenceBlock: BlockIdentifier,
  placement: 'before' | 'after' = 'before',
): Block<BSchema, I, S>[] {
  // 实现逻辑...
}
```

这确保了在编译时就能捕获潜在的类型错误，提高代码质量。

### 5.3 默认 Schema

doc-editor 提供了默认的 Schema 定义，包含常用的块、内联内容和样式：

```typescript
// 默认块定义
export const defaultBlockSpecs = {
  paragraph: Paragraph,
  heading: Heading,
  codeBlock: CodeBlock,
  bulletListItem: BulletListItem,
  numberedListItem: NumberedListItem,
  checkListItem: CheckListItem,
  table: Table,
  file: FileBlock,
  image: ImageBlock,
  video: VideoBlock,
  audio: AudioBlock,
} satisfies BlockSpecs;

// 默认样式定义
export const defaultStyleSpecs = {
  bold: createStyleSpecFromTipTapMark(Bold, 'boolean'),
  italic: createStyleSpecFromTipTapMark(Italic, 'boolean'),
  underline: createStyleSpecFromTipTapMark(Underline, 'boolean'),
  strike: createStyleSpecFromTipTapMark(Strike, 'boolean'),
  code: createStyleSpecFromTipTapMark(Code, 'boolean'),
  textColor: TextColor,
  backgroundColor: BackgroundColor,
} satisfies StyleSpecs;
```

这些默认定义可以被扩展或替换，以满足特定的需求。

## 6. 扩展功能实现

doc-editor 提供了丰富的扩展功能，以增强编辑体验。

### 6.1 建议菜单

建议菜单（类似 Notion 的 "/" 命令菜单）的实现：

```typescript
export class SuggestionMenuProseMirrorPlugin<
  BSchema extends BlockSchema,
  I extends InlineContentSchema,
  S extends StyleSchema,
> extends EventEmitter<any> {
  private view: SuggestionMenuView<BSchema, I, S> | undefined;
  public readonly plugin: Plugin;
  private triggerCharacters: string[] = [];

  constructor(editor: EtcDocEditor<BSchema, I, S>) {
    super();
    // 初始化插件
    this.plugin = new Plugin({
      key: suggestionMenuPluginKey,
      
      view: () => {
        this.view = new SuggestionMenuView<BSchema, I, S>(
          editor,
          (triggerCharacter, state) => {
            this.emit(`update ${triggerCharacter}`, state);
          }
        );
        return this.view;
      },
      
      state: {
        // 初始化状态
        init(): SuggestionPluginState {
          return undefined;
        },
        
        // 处理事务
        apply(transaction, prev, _oldState, newState): SuggestionPluginState {
          // 实现逻辑...
        }
      },
      
      // 处理输入
      props: {
        handleKeyDown(view, event) {
          // 处理键盘事件...
        },
        
        // 装饰元素
        decorations(state) {
          // 添加装饰元素...
        }
      }
    });
  }
  
  // 其他方法...
}
```

### 6.2 工具栏和菜单

doc-editor 实现了各种工具栏和菜单，包括：

1. **格式工具栏**：用于文本格式化
2. **链接工具栏**：用于管理链接
3. **侧边菜单**：用于块级操作
4. **表格操作工具**：用于表格编辑

这些功能通过 ProseMirror 插件系统实现，为用户提供丰富的编辑体验。

### 6.3 自定义扩展

doc-editor 设计了灵活的扩展系统，允许添加自定义块类型和功能：

```typescript
// 创建自定义 Schema
const customSchema = EtcDocSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    myCustomBlock: MyCustomBlock,
  },
  styleSpecs: {
    ...defaultStyleSpecs,
    myCustomStyle: MyCustomStyle,
  },
});

// 使用自定义 Schema 创建编辑器
const editor = new EtcDocEditor({
  schema: customSchema,
  // 其他选项...
});
```

## 7. 协作编辑

doc-editor 支持基于 Yjs 的协作编辑功能。

### 7.1 协作原理

协作编辑基于 CRDT (Conflict-free Replicated Data Type) 技术，使用 Yjs 实现：

```typescript
// 创建支持协作的编辑器
const editor = new EtcDocEditor({
  // 其他选项...
  collaboration: {
    fragment: yDoc.getXmlFragment('document'),
    user: {
      name: 'User Name',
      color: '#ff0000',
    },
    provider: webrtcProvider, // Yjs 提供者
  },
});
```

### 7.2 光标同步

协作编辑包括光标位置的同步，用于显示其他用户的编辑位置：

```typescript
// 在编辑器选项中可以自定义光标渲染
collaboration: {
  // ...
  renderCursor: (user) => {
    const cursor = document.createElement('div');
    cursor.className = 'collaboration-cursor';
    cursor.style.backgroundColor = user.color;
    cursor.textContent = user.name;
    return cursor;
  },
}
```

## 8. 导入导出功能

doc-editor 支持多种格式的导入和导出。

### 8.1 HTML 导入导出

```typescript
// HTML 导出
const html = editor.exportHTML();

// HTML 导入
const blocks = editor.parseHTML('<p>Hello, world!</p>');
editor.setContent(blocks);
```

### 8.2 Markdown 导入导出

```typescript
// Markdown 导出
const markdown = editor.exportMarkdown();

// Markdown 导入
const blocks = editor.parseMarkdown('# Hello\n\nThis is a paragraph.');
editor.setContent(blocks);
```

这些功能使得文档可以与其他编辑器和格式互操作。

## 总结

doc-editor 是一个基于 ProseMirror 和 Tiptap 构建的强大块式编辑器框架，它通过创新的块结构设计、类型安全的 API 和丰富的扩展功能，提供了类似 Notion 的编辑体验。

核心优势包括：

1. 基于成熟的 ProseMirror 文档模型
2. 利用 Tiptap 的扩展系统简化开发
3. 创新的块结构设计支持类 Notion 的编辑体验
4. 强大的类型系统确保类型安全
5. 丰富的扩展功能提升用户体验
6. 内置协作编辑支持
7. 灵活的导入导出能力

通过这种架构设计，doc-editor 既保持了底层编辑器的强大功能，又提供了更高层次的抽象，使得开发类似 Notion 的编辑器变得更加容易。
