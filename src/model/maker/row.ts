import type { Stitch } from '@/model/maker/stitch';

export interface Row {
    stitches: Stitch[];
    isCircular?: boolean;
}