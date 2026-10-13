import { Color } from '../types';

export interface StackLocal {
  name: string;
  value: number | string | boolean;
  address: string;
}

export interface HeapCell {
  index: number;
  value: Color;
  address: string;
}

export function getStackLocals(variables: Record<string, number | string | boolean>): StackLocal[] {
  return Object.entries(variables)
    .filter(([name]) => !name.includes('[') && !name.includes('<'))
    .map(([name, value], index) => ({
      name,
      value,
      address: `0x7fff${(index * 16).toString(16).padStart(4, '0')}`,
    }));
}

export function getHeapCells(array: Color[]): HeapCell[] {
  return array.map((value, index) => ({
    index,
    value,
    address: `0x${(0x1000 + index * 4).toString(16)}`,
  }));
}
