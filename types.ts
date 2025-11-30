export enum NodeType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface NodeData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  type: NodeType;
  color?: string;
  isLoading?: boolean;
  error?: string;
  imageUrl?: string; // For image nodes
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

export interface CanvasState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export enum ToolMode {
  SELECT = 'SELECT',
  HAND = 'HAND',
  CONNECT = 'CONNECT'
}