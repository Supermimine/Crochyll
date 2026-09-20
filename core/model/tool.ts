import type { toolsType } from "../enum/toolsType";

export interface tool {
  id: number,
  type: toolsType,
  slotIndex: number,
  w: number,
  h: number
}