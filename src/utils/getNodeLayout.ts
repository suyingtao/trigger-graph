import { Node } from "vugel";

export const getNodeLayout = (node: Node) => {
  let x = 0;
  let y = 0;
  let curr = node;
  while (curr) {
    x += curr.getLayoutX();
    y += curr.getLayoutY();
    curr = curr.parent as Node;
  }
  return [x, y];
};
