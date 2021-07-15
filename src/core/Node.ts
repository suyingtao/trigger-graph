import { IdGenerator } from "@/utils/IdGenerator";
import { getStringLength } from "@/utils/getStringLength";

export const NODE_ID_PREFIX = "node_";
export const NodeIdGenerator = new IdGenerator(NODE_ID_PREFIX);
const OFFSET_X = 80;
const OFFSET_Y = 120;

export interface Node {
  id: string;
  parentId?: string;
  x: number;
  y: number;
  zIndex?: number;
  label: string;
}

export const genNode = (options: Partial<Node>) => {
  return {
    ...options,
    id: NodeIdGenerator.getNewId(),
  } as Node;
};

export const layout = (nodes: Node[], id: string) => {
  if (!id) return;
  const layoutIds = [id];
  let currId = layoutIds.shift();
  while (currId) {
    const currNode = nodes.find((node) => node.id === currId);
    if (!currNode) return;
    const children = nodes
      .filter((node) => node.parentId === currId)
      .sort((a, b) => b.y - a.y);
    const count = children.length;
    const labelLen = getStringLength(currNode.label.trim());
    children.forEach((child, i) => {
      child.x = currNode.x + OFFSET_X + labelLen * 8;
      child.y = currNode.y + ((count - 1) * OFFSET_Y) / 2 - i * OFFSET_Y;
      layoutIds.push(child.id);
    });
    currId = layoutIds.shift();
  }
};

export const deleteNode = (nodes: Node[], id: string) => {
  const index = nodes.findIndex((i) => i.id === id);
  nodes.splice(index, 1);
  const removedIds = [id];
  while (removedIds.length) {
    const curr = removedIds.shift();
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].parentId === curr) {
        removedIds.push(nodes[i].id);
        nodes.splice(i, 1);
        i--;
      }
    }
  }
};

export const addSibling = (
  nodes: Node[],
  nodeMap: Map<string, Node>,
  id: string
) => {
  const node = nodeMap.get(id);
  if (!node?.parentId) {
    return [];
  }
  const parentNode = nodeMap.get(node.parentId) as Node;
  const children = nodes.filter((i) => i.parentId === parentNode.id);
  const x = (() => {
    if (children.length) {
      return Math.max(...children.map((i) => i.x));
    }
    return node.x + 100;
  })();
  const y = (() => {
    if (children.length) {
      return Math.max(...children.map((i) => i.y)) + 50;
    }
    return node.y - 50;
  })();
  const newNode = genNode({
    x,
    y,
    zIndex: 1,
    parentId: parentNode.id,
    label: "new sibling node",
  });
  nodes.push(newNode);
  return [parentNode.id, newNode.id] as const;
};

export const addParent = (
  nodes: Node[],
  nodeMap: Map<string, Node>,
  id: string
) => {
  const node = nodeMap.get(id);
  if (!node) return [];
  const parentId = node.parentId;
  const newParentNode = genNode({
    x: node.x - 100,
    y: node.y,
    zIndex: 1,
    label: "new parent node",
  });
  if (parentId) newParentNode.parentId = parentId;
  node.parentId = newParentNode.id;
  nodes.push(newParentNode);
  return [parentId, newParentNode.id] as const;
};

export const addChild = (
  nodes: Node[],
  nodeMap: Map<string, Node>,
  id: string
) => {
  const node = nodeMap.get(id) as Node;
  const children = nodes.filter((i) => i.parentId === id);
  const x = (() => {
    if (children.length) {
      return Math.max(...children.map((i) => i.x));
    }
    return node.x + 100;
  })();
  const y = (() => {
    if (children.length) {
      return Math.max(...children.map((i) => i.y)) + 50;
    }
    return node.y - 50;
  })();
  const newNode = genNode({
    x,
    y,
    zIndex: 1,
    parentId: id,
    label: "new node",
  });
  nodes.push(newNode);
};
