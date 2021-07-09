import { IdGenerator } from "@/utils/IdGenerator";

export const NODE_ID_PREFIX = "node_";
export const NodeIdGenerator = new IdGenerator(NODE_ID_PREFIX);

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
