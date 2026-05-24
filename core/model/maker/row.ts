import type { Stitch } from './stitch';

export interface Row {
    stitches: Stitch[];
    isCircular?: boolean;
}