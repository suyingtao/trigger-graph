import { Node } from "./Node";

export interface Line {
  id: string;
  parentId: string;
  x: number;
  y: number;
  parentX: number;
  parentY: number;
}

export const genLine = (node: Node, parentNode: Node) => {
  return {
    id: node.id,
    parentId: parentNode.id,
    x: node.x,
    y: node.y,
    parentX: parentNode.x,
    parentY: parentNode.y,
  };
};
